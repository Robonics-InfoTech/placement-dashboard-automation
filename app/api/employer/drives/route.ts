import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/server";
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

// GET /api/employer/drives
export async function GET() {
  const { data: { user }, error } = await authedUser();
  if (error || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("employer_profiles").select("id").eq("user_id", user.id).single();

  if (!profile) return NextResponse.json({ success: true, data: [] });

  const { data, error: dbErr } = await supabaseAdmin
    .from("drives")
    .select("*, drive_jobs(job_id)")
    .eq("employer_id", profile.id)
    .order("drive_date", { ascending: true });

  if (dbErr) return NextResponse.json({ success: false, message: dbErr.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

// POST /api/employer/drives
export async function POST(req: NextRequest) {
  const { data: { user }, error } = await authedUser();
  if (error || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("employer_profiles").select("id, approval_status, college_id").eq("user_id", user.id).single();

  if (!profile) return NextResponse.json({ success: false, message: "Profile not found." }, { status: 404 });
  // TODO: Restore approval gate after testing
  // if (profile.approval_status !== "approved") {
  //   return NextResponse.json({ success: false, message: "Account must be approved to schedule drives." }, { status: 403 });
  // }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 }); }

  const required = ["name", "drive_date", "venue_type", "venue"];
  for (const f of required) {
    if (!body[f]) return NextResponse.json({ success: false, message: `Missing field: ${f}` }, { status: 422 });
  }

  // Insert drive
  const { data: drive, error: driveErr } = await supabaseAdmin
    .from("drives")
    .insert({
      employer_id:     profile.id,
      college_id:      profile.college_id,
      name:            body.name,
      drive_date:      body.drive_date,
      venue_type:      body.venue_type,
      venue:           body.venue,
      rounds_schedule: body.rounds_schedule ?? [],
      max_students:    body.max_students ?? null,
      status:          "scheduled",
    })
    .select("id")
    .single();

  if (driveErr || !drive) {
    return NextResponse.json({ success: false, message: driveErr?.message ?? "Insert failed." }, { status: 500 });
  }

  // Link jobs via drive_jobs junction
  const jobIds = (body.job_ids as string[]) ?? [];
  if (jobIds.length > 0) {
    await supabaseAdmin
      .from("drive_jobs")
      .insert(jobIds.map((jid) => ({ drive_id: drive.id, job_id: jid })));
  }

  return NextResponse.json({ success: true, message: "Drive scheduled.", driveId: drive.id }, { status: 201 });
}
