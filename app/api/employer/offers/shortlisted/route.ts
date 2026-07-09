import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/employer/offers/shortlisted
// Returns all shortlisted applications across all this employer's jobs, with student data
export async function GET() {
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
  if (!profile) return NextResponse.json({ success: true, data: [] });

  const { data, error } = await supabaseAdmin
    .from("applications")
    .select(`
      id,
      status,
      job_postings!inner ( id, title, employer_id ),
      student_profiles ( id, full_name, branch, cgpa, enrollment_number )
    `)
    .in("status", ["shortlisted", "round_1", "round_2", "round_3", "round_4"])
    .eq("job_postings.employer_id", profile.id);

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

  const mapped = (data ?? []).map((row) => {
    const jp = row.job_postings as unknown as { title: string } | null;
    const sp = row.student_profiles as unknown as {
      full_name: string | null; branch: string; cgpa: number; enrollment_number: string;
    } | null;
    return {
      applicationId: row.id,
      jobTitle:      jp?.title ?? "",
      studentName:   sp?.full_name ?? "Unknown",
      branch:        sp?.branch ?? "",
      cgpa:          sp?.cgpa ?? 0,
      enrollment:    sp?.enrollment_number ?? "",
    };
  });

  return NextResponse.json({ success: true, data: mapped });
}
