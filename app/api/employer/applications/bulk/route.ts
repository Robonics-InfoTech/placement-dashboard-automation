import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// POST /api/employer/applications/bulk
// Body: { applicationIds: string[], status: string, rejection_reason?: string }
export async function POST(req: NextRequest) {
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

  let body: { applicationIds: string[]; status: string; rejection_reason?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 }); }

  const { applicationIds, status, rejection_reason } = body;

  if (!applicationIds || applicationIds.length === 0) {
    return NextResponse.json({ success: false, message: "No applications selected." }, { status: 422 });
  }
  if (status === "rejected" && !rejection_reason?.trim()) {
    return NextResponse.json({ success: false, message: "Rejection reason is required." }, { status: 422 });
  }

  // Fetch all applications and verify ownership via job's employer_id
  const { data: apps } = await supabaseAdmin
    .from("applications")
    .select("id, status, student_id, job_postings!inner(employer_id)")
    .in("id", applicationIds);

  if (!apps || apps.length === 0) {
    return NextResponse.json({ success: false, message: "Applications not found." }, { status: 404 });
  }

  // Filter to only those owned by this employer
  const ownedApps = apps.filter(
    (a) => (a.job_postings as unknown as { employer_id: string } | null)?.employer_id === profile.id
  );

  if (ownedApps.length === 0) {
    return NextResponse.json({ success: false, message: "Unauthorized for all selected applications." }, { status: 403 });
  }

  const ownedIds = ownedApps.map((a) => a.id);
  const now      = new Date().toISOString();

  // Bulk update
  const updatePayload: Record<string, unknown> = { status, updated_at: now };
  if (status === "rejected") updatePayload.rejection_reason = rejection_reason;

  await supabaseAdmin.from("applications").update(updatePayload).in("id", ownedIds);

  // Audit logs (one row per application)
  const auditRows = ownedApps.map((a) => ({
    entity_type:    "application",
    entity_id:      a.id,
    action:         "bulk_status_change",
    acting_user_id: user.id,
    from_status:    a.status,
    to_status:      status,
    notes:          rejection_reason ?? null,
  }));
  await supabaseAdmin.from("audit_logs").insert(auditRows);

  // Notifications — one per student for rejections
  if (status === "rejected") {
    const notifRows = ownedApps.map((a) => ({
      user_id: a.student_id,
      type:    "rejection",
      title:   "Application Update",
      body:    `Your application status has been updated: Application Unsuccessful. ${rejection_reason ? `Reason: ${rejection_reason}` : ""}`,
      link:    "/student/applications",
    }));
    await supabaseAdmin.from("notifications").insert(notifRows);
  }

  return NextResponse.json({
    success: true,
    message: `${ownedIds.length} application(s) updated to '${status}'.`,
    updatedCount: ownedIds.length,
  });
}
