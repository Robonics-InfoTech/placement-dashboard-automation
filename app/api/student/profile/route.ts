import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";

function getSessionClient(req: NextRequest) {
  const res = NextResponse.next();
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

/* ── GET /api/student/profile ─────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const supabase = getSessionClient(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sp, error } = await supabaseAdmin
    .from("student_profiles")
    .select(`
      id, branch, course, specialization, semester, graduation_year,
      cgpa, active_backlogs, phone, resume_url, linkedin_url, github_url, portfolio_url,
      placement_status, enrollment_number, skills,
      users!inner(id, full_name, email, phone)
    `)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ profile: sp });
}

/* ── PATCH /api/student/profile ───────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  const supabase = getSessionClient(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Validate CGPA if present
  if (body.cgpa !== undefined && body.cgpa !== null) {
    const cgpa = parseFloat(String(body.cgpa));
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      return NextResponse.json({ error: "CGPA must be between 0.0 and 10.0" }, { status: 422 });
    }
  }

  const profileFields: Record<string, unknown> = {};
  const userFields: Record<string, unknown> = {};

  const profileKeys = ["branch", "course", "specialization", "semester", "graduation_year", "cgpa", "active_backlogs", "phone", "linkedin_url", "github_url", "portfolio_url", "skills"];
  const userKeys    = ["full_name", "phone"];

  for (const [k, v] of Object.entries(body)) {
    if (profileKeys.includes(k)) profileFields[k] = v;
    if (userKeys.includes(k))    userFields[k] = v;
  }
  profileFields.updated_at = new Date().toISOString();

  // Update student_profiles
  const { error: spErr } = await supabaseAdmin
    .from("student_profiles")
    .update(profileFields)
    .eq("user_id", user.id);

  if (spErr) return NextResponse.json({ error: spErr.message }, { status: 500 });

  // Update users table (full_name, phone)
  if (Object.keys(userFields).length > 0) {
    await supabaseAdmin.from("users").update({ ...userFields, updated_at: new Date().toISOString() }).eq("id", user.id);
  }

  return NextResponse.json({ success: true });
}
