import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendApplicationConfirmation } from "@/lib/email/student";

function getSessionClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

/* ── POST /api/student/apply ─────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const supabase = getSessionClient(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { job_id?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.job_id) return NextResponse.json({ error: "job_id is required" }, { status: 400 });

  /* ── 1. Get student profile ── */
  const { data: sp } = await supabaseAdmin
    .from("student_profiles")
    .select("id, resume_url, placement_status, cgpa, active_backlogs")
    .eq("user_id", user.id)
    .single();

  if (!sp) return NextResponse.json({ error: "Student profile not found. Please complete your profile." }, { status: 404 });

  /* ── 2. Placement lock check ── */
  if (sp.placement_status === "placed") {
    return NextResponse.json({ error: "You are already placed and cannot apply to new jobs." }, { status: 403 });
  }

  /* ── 3. Primary resume check ── */
  if (!sp.resume_url) {
    return NextResponse.json({ error: "Please upload and set a primary resume before applying." }, { status: 422 });
  }

  /* ── 4. Get primary resume document name ── */
  const { data: resumeDoc } = await supabaseAdmin
    .from("documents")
    .select("document_name")
    .eq("user_id", user.id)
    .eq("file_path", sp.resume_url)
    .is("deleted_at", null)
    .single();

  /* ── 5. Get job details ── */
  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("id, title, status, minimum_cgpa, maximum_backlogs, application_deadline, employer_profiles!inner(company_name)")
    .eq("id", body.job_id)
    .single();

  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  if (job.status !== "published") return NextResponse.json({ error: "This job is no longer accepting applications." }, { status: 422 });

  // Deadline check
  if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
    return NextResponse.json({ error: "The application deadline for this job has passed." }, { status: 422 });
  }

  // Eligibility check
  if (job.minimum_cgpa && sp.cgpa !== null && sp.cgpa < job.minimum_cgpa) {
    return NextResponse.json({ error: `Your CGPA (${sp.cgpa}) is below the minimum required (${job.minimum_cgpa}).` }, { status: 422 });
  }
  if (sp.active_backlogs > job.maximum_backlogs) {
    return NextResponse.json({ error: `You have ${sp.active_backlogs} active backlogs. Maximum allowed is ${job.maximum_backlogs}.` }, { status: 422 });
  }

  /* ── 6. Check for duplicate application ── */
  const { data: existing } = await supabaseAdmin
    .from("applications")
    .select("id")
    .eq("student_id", sp.id)
    .eq("job_id", body.job_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) return NextResponse.json({ error: "You have already applied to this job." }, { status: 409 });

  /* ── 7. Create application ── */
  const { data: app, error: insertErr } = await supabaseAdmin.from("applications").insert({
    student_id: sp.id,
    job_id: body.job_id,
    application_status: "applied",
    applied_at: new Date().toISOString(),
    updated_status_at: new Date().toISOString(),
  }).select().single();

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  /* ── 8. Create notification ── */
  await supabaseAdmin.from("notifications").insert({
    user_id: user.id,
    title: "Application Submitted ✓",
    message: `Your application for ${job.title} at ${(job.employer_profiles as { company_name: string }).company_name} has been submitted.`,
    notification_type: "status_change",
    is_read: false,
  });

  /* ── 9. Send confirmation email ── */
  try {
    await sendApplicationConfirmation(user.email!, {
      jobTitle: job.title,
      company: (job.employer_profiles as { company_name: string }).company_name,
      deadline: job.application_deadline,
    }, resumeDoc?.document_name ?? "Your resume");
  } catch (e) {
    console.error("[apply] Email send failed:", e);
    // Non-fatal — application is already created
  }

  return NextResponse.json({ success: true, application: app }, { status: 201 });
}
