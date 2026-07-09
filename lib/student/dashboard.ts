import { supabase } from "@/lib/supabase/client";

export async function getDashboardStats(studentId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("application_status")
    .eq("student_id", studentId)
    .is("deleted_at", null);

  if (error) throw error;

  const stats = {
    applied: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
  };

  data.forEach((application) => {
    switch (application.application_status) {
      case "applied":
        stats.applied++;
        break;

      case "shortlisted":
        stats.shortlisted++;
        break;

      case "selected":
        stats.selected++;
        break;

      case "rejected":
        stats.rejected++;
        break;
    }
  });

  return stats;
}

export async function getAvailableJobsCount() {
  const { count, error } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .is("deleted_at", null);

  if (error) throw error;

  return count ?? 0;
}

export async function getUpcomingDrives() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("placement_drives")
    .select("*")
    .gte("drive_date", today)
    .eq("status", "scheduled")
    .order("drive_date")
    .limit(5);

  if (error) throw error;

  return data;
}