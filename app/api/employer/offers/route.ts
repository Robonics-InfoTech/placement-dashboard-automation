import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function authedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );
  return supabase.auth.getUser();
}

// GET /api/employer/offers
export async function GET() {
  const { data: { user }, error } = await authedUser();
  if (error || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("employer_profiles").select("id").eq("user_id", user.id).single();
  if (!profile) return NextResponse.json({ success: true, data: [] });

  const { data, error: dbErr } = await supabaseAdmin
    .from("offers")
    .select(`
      id, role_confirmed, ctc, joining_date, location, status, published_at,
      offer_letter_path,
      student_profiles ( full_name, branch, enrollment_number )
    `)
    .eq("employer_id", profile.id)
    .order("published_at", { ascending: false });

  if (dbErr) return NextResponse.json({ success: false, message: dbErr.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

// POST /api/employer/offers
export async function POST(req: NextRequest) {
  const { data: { user }, error } = await authedUser();
  if (error || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("employer_profiles").select("id, company_name").eq("user_id", user.id).single();
  if (!profile) return NextResponse.json({ success: false, message: "Profile not found." }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 }); }

  const required = ["application_id", "role_confirmed", "ctc", "joining_date", "location"];
  for (const f of required) {
    if (!body[f]) return NextResponse.json({ success: false, message: `Missing: ${f}` }, { status: 422 });
  }

  // Verify application is shortlisted and belongs to this employer
  const { data: app } = await supabaseAdmin
    .from("applications")
    .select("id, status, student_id, job_postings!inner(employer_id, title)")
    .eq("id", body.application_id as string)
    .single();

  if (!app) return NextResponse.json({ success: false, message: "Application not found." }, { status: 404 });

  const jobMeta = app.job_postings as unknown as { employer_id: string; title: string } | null;
  if (jobMeta?.employer_id !== profile.id) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });
  }
  if (!["shortlisted", "round_1", "round_2", "round_3", "round_4"].includes(app.status)) {
    return NextResponse.json(
      { success: false, message: "Can only extend an offer to shortlisted applicants." },
      { status: 409 }
    );
  }

  // Insert offer
  const { data: offer, error: insertErr } = await supabaseAdmin
    .from("offers")
    .insert({
      application_id:    body.application_id,
      employer_id:       profile.id,
      student_id:        app.student_id,
      role_confirmed:    body.role_confirmed,
      ctc:               Number(body.ctc),
      joining_date:      body.joining_date,
      location:          body.location,
      bond_clause:       body.bond_clause ?? null,
      offer_letter_path: body.offer_letter_path ?? null,
      status:            "pending",
    })
    .select("id")
    .single();

  if (insertErr) {
    return NextResponse.json({ success: false, message: insertErr.message }, { status: 500 });
  }

  // Update application status to offer_extended
  await supabaseAdmin
    .from("applications")
    .update({ status: "offer_extended", updated_at: new Date().toISOString() })
    .eq("id", body.application_id as string);

  // Audit log
  await supabaseAdmin.from("audit_logs").insert({
    entity_type:    "offer",
    entity_id:      offer!.id,
    action:         "offer_published",
    acting_user_id: user.id,
    to_status:      "pending",
  });

  // In-app notification for student
  await supabaseAdmin.from("notifications").insert({
    user_id: app.student_id,
    type:    "offer",
    title:   `Offer Extended — ${profile.company_name}`,
    body:    `${profile.company_name} has extended you an offer for ${body.role_confirmed}. CTC: ${body.ctc} LPA. Joining: ${body.joining_date}. Please review in your offers page.`,
    link:    "/student/offers",
  });

  // Find college admin to notify (get college_id from employer profile)
  const { data: employerFull } = await supabaseAdmin
    .from("employer_profiles").select("college_id").eq("id", profile.id).single();
  if (employerFull?.college_id) {
    const { data: admins } = await supabaseAdmin
      .from("college_admin_profiles")
      .select("user_id")
      .eq("college_id", employerFull.college_id);
    if (admins && admins.length > 0) {
      const adminNotifs = admins.map((a: { user_id: string }) => ({
        user_id: a.user_id,
        type:    "offer",
        title:   "New Offer Letter Published",
        body:    `${profile.company_name} has published an offer for ${body.role_confirmed}. Student ID: ${app.student_id}.`,
        link:    "/admin/offers",
      }));
      await supabaseAdmin.from("notifications").insert(adminNotifs);
    }
  }

  return NextResponse.json({ success: true, message: "Offer published.", offerId: offer!.id }, { status: 201 });
}
