import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/server";

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

/* ── PATCH /api/student/applications/[id] ─────────────────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSessionClient(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: appId } = params;
  let body: { action?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (body.action !== "withdraw") {
    return NextResponse.json({ error: "Invalid action. Only 'withdraw' is supported." }, { status: 400 });
  }

  // Get student profile id
  const { data: sp } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!sp) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

  // Verify ownership and status
  const { data: app } = await supabaseAdmin
    .from("applications")
    .select("id, application_status, student_id, job_id, jobs!inner(title, employer_profiles!inner(company_name))")
    .eq("id", appId)
    .eq("student_id", sp.id)
    .is("deleted_at", null)
    .single();

  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  if (app.application_status !== "applied") {
    return NextResponse.json({
      error: `Cannot withdraw an application with status '${app.application_status}'. Only 'applied' applications can be withdrawn.`,
    }, { status: 422 });
  }

  // Update status to withdrawn
  const { error: updateErr } = await supabaseAdmin
    .from("applications")
    .update({
      application_status: "withdrawn",
      updated_status_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", appId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Create notification
  const job = app.jobs as { title: string; employer_profiles: { company_name: string } };
  await supabaseAdmin.from("notifications").insert({
    user_id: user.id,
    title: "Application Withdrawn",
    message: `You withdrew your application for ${job.title} at ${job.employer_profiles.company_name}.`,
    notification_type: "status_change",
    is_read: false,
  });

  return NextResponse.json({ success: true });
}
