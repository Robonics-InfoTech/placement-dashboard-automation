import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// PATCH /api/employer/applications/[appId] — update status + write audit log
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("employer_profiles").select("id").eq("user_id", user.id).single();
  if (!profile) return NextResponse.json({ success: false, message: "Profile not found." }, { status: 404 });

  let body: { status: string; rejection_reason?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 }); }

  // Rejection requires a reason
  if (body.status === "rejected" && !body.rejection_reason?.trim()) {
    return NextResponse.json(
      { success: false, message: "A rejection reason is required." },
      { status: 422 }
    );
  }

  // Fetch current application to verify ownership and get from_status
  const { data: app } = await supabaseAdmin
    .from("applications")
    .select("status, job_id, student_id, jobs:job_postings(employer_id)")
    .eq("id", appId)
    .single();

  if (!app) return NextResponse.json({ success: false, message: "Application not found." }, { status: 404 });

  const jobEmployerId = (app.jobs as unknown as { employer_id: string } | null)?.employer_id;
  if (jobEmployerId !== profile.id) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });
  }

  const fromStatus = app.status;

  // Update application
  const updatePayload: Record<string, unknown> = {
    status: body.status,
    updated_at: new Date().toISOString(),
  };
  if (body.status === "rejected") {
    updatePayload.rejection_reason = body.rejection_reason;
  }
  // Advance round counter for round_N statuses
  if (body.status.startsWith("round_")) {
    const roundNum = parseInt(body.status.split("_")[1] ?? "1");
    updatePayload.current_round = roundNum;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("applications")
    .update(updatePayload)
    .eq("id", appId);

  if (updateErr) return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });

  // Write audit log
  await supabaseAdmin.from("audit_logs").insert({
    entity_type:    "application",
    entity_id:      appId,
    action:         "status_change",
    acting_user_id: user.id,
    from_status:    fromStatus,
    to_status:      body.status,
    notes:          body.rejection_reason ?? null,
  });

  // Create in-app notification for student if rejected
  if (body.status === "rejected") {
    await supabaseAdmin.from("notifications").insert({
      user_id: app.student_id,
      type:    "rejection",
      title:   "Application Update",
      body:    `Your application status has been updated: Application Unsuccessful. ${body.rejection_reason ? `Reason: ${body.rejection_reason}` : ""}`,
      link:    "/student/applications",
    });
  }

  return NextResponse.json({ success: true, message: "Status updated." });
}
