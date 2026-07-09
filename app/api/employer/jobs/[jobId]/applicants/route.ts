import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/employer/jobs/[jobId]/applicants
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  // Verify employer owns this job
  const { data: profile } = await supabaseAdmin
    .from("employer_profiles").select("id").eq("user_id", user.id).single();
  if (!profile) return NextResponse.json({ success: false, message: "Profile not found." }, { status: 404 });

  const { data: job } = await supabaseAdmin
    .from("job_postings").select("employer_id").eq("id", jobId).single();
  if (!job || job.employer_id !== profile.id) {
    return NextResponse.json({ success: false, message: "Job not found or unauthorized." }, { status: 404 });
  }

  // Fetch applications with student profile join
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select(`
      id, status, rejection_reason, current_round, applied_at, updated_at,
      student_profiles (
        id, full_name, branch, cgpa, resume_url, enrollment_number
      )
    `)
    .eq("job_id", jobId)
    .order("applied_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
