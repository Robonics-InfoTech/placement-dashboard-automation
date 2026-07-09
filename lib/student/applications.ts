import { supabase } from "@/lib/supabase/client";

export async function hasApplied(
  studentId: string,
  jobId: string
) {
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("student_id", studentId)
    .eq("job_id", jobId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;

  return !!data;
}

export async function applyToJob({
  studentId,
  jobId,
  driveId,
}: {
  studentId: string;
  jobId: string;
  driveId: string;
}) {
  const { error } = await supabase
    .from("applications")
    .insert({
      student_id: studentId,
      job_id: jobId,
      drive_id: driveId,
      application_status: "applied",
    });

  if (error) throw error;
}

export async function getMyApplications(studentId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      jobs(*)
    `)
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .order("applied_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}