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

// GET /api/employer/jobs — list jobs for this employer
export async function GET() {
  const { data: { user }, error } = await authedUser();
  if (error || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from("employer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ success: true, data: [] });
  }

  const { data, error: dbErr } = await supabaseAdmin
    .from("job_postings")
    .select("*")
    .eq("employer_id", profile.id)
    .order("created_at", { ascending: false });

  if (dbErr) {
    return NextResponse.json({ success: false, message: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// POST /api/employer/jobs — create a new job posting
export async function POST(req: NextRequest) {
  const { data: { user }, error } = await authedUser();
  if (error || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // Verify approval gate
  const { data: profile } = await supabaseAdmin
    .from("employer_profiles")
    .select("id, approval_status, college_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ success: false, message: "Employer profile not found." }, { status: 404 });
  }
  // TODO: Restore approval gate after testing
  // if (profile.approval_status !== "approved") {
  //   return NextResponse.json(
  //     { success: false, message: "Your account must be approved before posting jobs." },
  //     { status: 403 }
  //   );
  // }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  // Validate required fields
  const required = ["title", "description", "job_type", "location", "openings", "deadline"];
  for (const f of required) {
    if (!body[f]) {
      return NextResponse.json({ success: false, message: `Missing field: ${f}` }, { status: 422 });
    }
  }

  // Validate deadline is in the future
  const deadline = new Date(body.deadline as string);
  if (isNaN(deadline.getTime()) || deadline <= new Date()) {
    return NextResponse.json(
      { success: false, message: "Application deadline must be a future date." },
      { status: 422 }
    );
  }

  const { error: insertErr } = await supabaseAdmin.from("job_postings").insert({
    employer_id:      profile.id,
    college_id:       profile.college_id,
    title:            body.title,
    description:      body.description,
    job_type:         body.job_type,
    location:         body.location,
    ctc_min:          body.ctc_min ?? null,
    ctc_max:          body.ctc_max ?? null,
    openings:         Number(body.openings),
    deadline:         body.deadline,
    min_cgpa:         Number(body.min_cgpa ?? 0),
    allowed_branches: body.allowed_branches ?? [],
    max_backlogs:     Number(body.max_backlogs ?? 0),
    batch_years:      body.batch_years ?? [],
    selection_rounds: body.selection_rounds ?? [],
    status:           "pending_approval",
  });

  if (insertErr) {
    return NextResponse.json({ success: false, message: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Job submitted for college admin approval." }, { status: 201 });
}
