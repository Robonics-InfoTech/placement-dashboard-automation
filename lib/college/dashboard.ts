import { supabase } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollegeDashboardStats {
  totalStudents: number;
  registeredEmployers: number;
  placementsThisYear: number;
  pendingApprovals: number;
}

export interface RecentStudent {
  id: string;
  full_name: string;
  branch: string;
  graduation_year: number;
  placement_status: string;
  company?: string;
}

export interface BranchPlacement {
  branch: string;
  placed: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve the college_id for the currently signed-in college_admin. */
export async function getCollegeId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("college_admin_profiles")
    .select("college_id")
    .eq("user_id", user.id)
    .single();

  return data?.college_id ?? null;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/** Total students registered under this college. */
async function getTotalStudents(collegeId: string): Promise<number> {
  const { count } = await supabase
    .from("student_profiles")
    .select("*", { count: "exact", head: true })
    .eq("college_id", collegeId);
  return count ?? 0;
}

/**
 * Employers who have posted jobs/drives associated with this college_id.
 * Counts distinct employer_profiles via job_postings.
 */
async function getRegisteredEmployers(collegeId: string): Promise<number> {
  const { count } = await supabase
    .from("job_postings")
    .select("employer_id", { count: "exact", head: true })
    .eq("college_id", collegeId);
  return count ?? 0;
}

/**
 * Placements this calendar year = accepted offers whose student belongs to this college.
 */
async function getPlacementsThisYear(collegeId: string): Promise<number> {
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const { data: students } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("college_id", collegeId);

  if (!students || students.length === 0) return 0;

  const studentIds = students.map((s) => s.id);

  const { count } = await supabase
    .from("offers")
    .select("*", { count: "exact", head: true })
    .in("student_id", studentIds)
    .eq("offer_status", "accepted")
    .gte("offered_at", yearStart);

  return count ?? 0;
}

/**
 * Pending approvals = employer_profiles with approval_status = 'pending'
 * linked to this college via job_postings or tenant_id.
 */
async function getPendingApprovals(collegeId: string): Promise<number> {
  const { data: jobEmployerIds } = await supabase
    .from("job_postings")
    .select("employer_id")
    .eq("college_id", collegeId);

  const ids = [...new Set((jobEmployerIds ?? []).map((r) => r.employer_id))];

  if (ids.length === 0) {
    const { count } = await supabase
      .from("employer_profiles")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", collegeId)
      .eq("approval_status", "pending");
    return count ?? 0;
  }

  const { count } = await supabase
    .from("employer_profiles")
    .select("*", { count: "exact", head: true })
    .in("id", ids)
    .eq("approval_status", "pending");

  return count ?? 0;
}

/** Fetch all four stats in parallel. */
export async function getCollegeDashboardStats(
  collegeId: string
): Promise<CollegeDashboardStats> {
  const [totalStudents, registeredEmployers, placementsThisYear, pendingApprovals] =
    await Promise.all([
      getTotalStudents(collegeId),
      getRegisteredEmployers(collegeId),
      getPlacementsThisYear(collegeId),
      getPendingApprovals(collegeId),
    ]);

  return { totalStudents, registeredEmployers, placementsThisYear, pendingApprovals };
}

// ─── Recent Students ──────────────────────────────────────────────────────────

export async function getRecentStudents(
  collegeId: string,
  limit = 6
): Promise<RecentStudent[]> {
  const { data } = await supabase
    .from("student_profiles")
    .select("id, full_name, branch, graduation_year, placement_status")
    .eq("college_id", collegeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return [];

  // For placed students, attempt to get their company name via offers
  const placedStudentIds = data
    .filter((s) => s.placement_status === "placed")
    .map((s) => s.id);

  let companyMap: Record<string, string> = {};
  if (placedStudentIds.length > 0) {
    const { data: offers } = await supabase
      .from("offers")
      .select("student_id, employer_profiles(company_name)")
      .in("student_id", placedStudentIds)
      .eq("offer_status", "accepted")
      .limit(placedStudentIds.length);

    if (offers) {
      offers.forEach((o) => {
        const company = (o.employer_profiles as { company_name?: string } | null)
          ?.company_name;
        if (o.student_id && company) {
          companyMap[o.student_id] = company;
        }
      });
    }
  }

  return data.map((s) => ({
    id: s.id,
    full_name: s.full_name ?? "Unknown",
    branch: s.branch ?? "—",
    graduation_year: s.graduation_year ?? 0,
    placement_status: s.placement_status ?? "eligible",
    company: companyMap[s.id],
  }));
}

// ─── Placement by Branch ──────────────────────────────────────────────────────

export async function getPlacementByBranch(
  collegeId: string
): Promise<BranchPlacement[]> {
  const { data: students } = await supabase
    .from("student_profiles")
    .select("id, branch, placement_status")
    .eq("college_id", collegeId);

  if (!students || students.length === 0) return [];

  const branchMap: Record<string, { placed: number; total: number }> = {};

  students.forEach((s) => {
    const b = s.branch ?? "Other";
    if (!branchMap[b]) branchMap[b] = { placed: 0, total: 0 };
    branchMap[b].total++;
    if (s.placement_status === "placed") branchMap[b].placed++;
  });

  return Object.entries(branchMap)
    .map(([branch, stats]) => ({ branch, ...stats }))
    .sort((a, b) => b.total - a.total);
}
