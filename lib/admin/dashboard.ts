import { supabaseAdmin } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface DashboardStats {
  totalStudents: number;
  verifiedStudents: number;
  suspendedStudents: number;
  activeJobs: number;
  pendingEmployers: number;
  upcomingDrives: number;
}

export interface RecentStudent {
  id: string;
  full_name: string;
  enrollment_number: string;
  branch: string;
  semester: number;
  placement_status: string;
  is_verified: boolean;
}

export interface PendingEmployerApproval {
  id: string;
  status: string;
  requested_at: string;
  employer_profiles: {
    company_name: string;
    contact_person: string;
  } | null;
}

export interface UpcomingDrive {
  id: string;
  drive_name: string;
  drive_date: string;
  venue: string;
  drive_mode: string;
  status: string;
}

/* -------------------------------------------------------------------------- */
/*                            DASHBOARD KPI COUNTS                            */
/* -------------------------------------------------------------------------- */

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split("T")[0];

  const [
    totalStudents,
    verifiedStudents,
    suspendedStudents,
    activeJobs,
    pendingEmployers,
    upcomingDrives,
  ] = await Promise.all([
    supabaseAdmin
      .from("student_profiles")
      .select("*", { head: true, count: "exact" })
      .is("deleted_at", null),

    supabaseAdmin
      .from("student_profiles")
      .select("*", { head: true, count: "exact" })
      .eq("is_verified", true)
      .is("deleted_at", null),

    supabaseAdmin
      .from("student_profiles")
      .select("*", { head: true, count: "exact" })
      .eq("is_suspended", true)
      .is("deleted_at", null),

    supabaseAdmin
      .from("jobs")
      .select("*", { head: true, count: "exact" })
      .eq("status", "active")
      .is("deleted_at", null),

    supabaseAdmin
      .from("employer_approvals")
      .select("*", { head: true, count: "exact" })
      .eq("status", "pending")
      .is("deleted_at", null),

    supabaseAdmin
      .from("placement_drives")
      .select("*", { head: true, count: "exact" })
      .gte("drive_date", today)
      .is("deleted_at", null),
  ]);

  return {
    totalStudents: totalStudents.count ?? 0,
    verifiedStudents: verifiedStudents.count ?? 0,
    suspendedStudents: suspendedStudents.count ?? 0,
    activeJobs: activeJobs.count ?? 0,
    pendingEmployers: pendingEmployers.count ?? 0,
    upcomingDrives: upcomingDrives.count ?? 0,
  };
}

/* -------------------------------------------------------------------------- */
/*                            RECENT STUDENTS                                 */
/* -------------------------------------------------------------------------- */

export async function getRecentStudents(): Promise<RecentStudent[]> {
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select(`
      id,
      full_name,
      enrollment_number,
      branch,
      semester,
      placement_status,
      is_verified
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("getRecentStudents:", error);
    return [];
  }

  return data ?? [];
}

/* -------------------------------------------------------------------------- */
/*                      PENDING EMPLOYER APPROVALS                             */
/* -------------------------------------------------------------------------- */

export async function getPendingEmployerApprovals(): Promise<
  PendingEmployerApproval[]
> {
  const { data, error } = await supabaseAdmin
    .from("employer_approvals")
    .select(`
      id,
      status,
      requested_at,
      employer_profiles (
        company_name,
        contact_person
      )
    `)
    .eq("status", "pending")
    .is("deleted_at", null)
    .order("requested_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("getPendingEmployerApprovals:", error);
    return [];
  }

  return data ?? [];
}

/* -------------------------------------------------------------------------- */
/*                           UPCOMING PLACEMENT DRIVES                        */
/* -------------------------------------------------------------------------- */

export async function getUpcomingDrives(): Promise<UpcomingDrive[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseAdmin
    .from("placement_drives")
    .select(`
      id,
      drive_name,
      drive_date,
      venue,
      drive_mode,
      status
    `)
    .gte("drive_date", today)
    .is("deleted_at", null)
    .order("drive_date", { ascending: true })
    .limit(5);

  if (error) {
    console.error("getUpcomingDrives:", error);
    return [];
  }

  return data ?? [];
}