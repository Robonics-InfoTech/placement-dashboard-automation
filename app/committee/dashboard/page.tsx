import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";

export default async function CommitteeDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Resolve college_id from committee_members
  const { data: member } = await supabase
    .from("committee_members")
    .select("college_id, full_name, designation")
    .eq("user_id", user.id)
    .single();

  const collegeId = member?.college_id ?? null;
  const memberName = member?.full_name ?? user.user_metadata?.full_name ?? "Committee Member";

  let stats = { students: 0, applications: 0, placements: 0, pendingApprovals: 0 };
  let collegeName = "Your Institution";

  if (collegeId) {
    // Fetch college name
    const { data: college } = await supabase
      .from("colleges")
      .select("name")
      .eq("id", collegeId)
      .single();
    collegeName = college?.name ?? collegeName;

    // Fetch all stats in parallel
    const [studentsRes, appsRes, collegeStudentIds, pendingRes] = await Promise.all([
      supabase.from("student_profiles").select("*", { count: "exact", head: true }).eq("college_id", collegeId),
      supabase.from("student_profiles").select("id").eq("college_id", collegeId),
      supabase.from("student_profiles").select("id").eq("college_id", collegeId),
      supabase.from("employer_profiles").select("*", { count: "exact", head: true }).eq("tenant_id", collegeId).eq("approval_status", "pending"),
    ]);

    const studentIds = (appsRes.data ?? []).map(s => s.id);
    let applicationsCount = 0;
    let placementsCount = 0;

    if (studentIds.length > 0) {
      const [totalApps, placedApps] = await Promise.all([
        supabase.from("applications").select("*", { count: "exact", head: true }).in("student_id", studentIds),
        supabase.from("offers").select("*", { count: "exact", head: true }).in("student_id", studentIds).eq("offer_status", "accepted"),
      ]);
      applicationsCount = totalApps.count ?? 0;
      placementsCount = placedApps.count ?? 0;
    }

    stats = {
      students: studentsRes.count ?? 0,
      applications: applicationsCount,
      placements: placementsCount,
      pendingApprovals: pendingRes.count ?? 0,
    };
  }

  // Recent applications for read-only view
  let recentApplications: any[] = [];
  if (collegeId) {
    const { data: studentIds } = await supabase.from("student_profiles").select("id, full_name, branch").eq("college_id", collegeId).limit(100);
    if (studentIds && studentIds.length > 0) {
      const ids = studentIds.map(s => s.id);
      const { data: apps } = await supabase
        .from("applications")
        .select("id, application_status, applied_at, student_id, jobs(title, company_name)")
        .in("student_id", ids)
        .order("applied_at", { ascending: false })
        .limit(6);

      const studentMap = Object.fromEntries(studentIds.map(s => [s.id, s]));
      recentApplications = (apps ?? []).map(a => ({
        ...a,
        student: studentMap[a.student_id],
      }));
    }
  }

  const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    applied:     { bg: "var(--info-light)",    color: "var(--info-text)" },
    shortlisted: { bg: "var(--warning-light)", color: "var(--warning-text)" },
    selected:    { bg: "var(--success-light)", color: "var(--success-text)" },
    rejected:    { bg: "var(--error-light)",   color: "var(--error-text)" },
  };

  return (
    <div style={{ padding: "0 0 32px" }}>
      {/* Read-only banner */}
      <div style={{ margin: "16px 28px 0", padding: "10px 16px", borderRadius: "var(--radius-md)", background: "var(--info-light)", color: "var(--info-text)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
        🔒 Read-only view — {memberName} · {member?.designation ?? "Placement Committee"} · {collegeName}
      </div>

      <PageHeader
        title="Committee Overview 📋"
        description="Live read-only view of placement data for your institution."
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, padding: "20px 28px 0" }}>
        <StatCard label="Registered Students" value={stats.students} trend={collegeId ? "In your institution" : "No college linked"} color="var(--accent-primary)" />
        <StatCard label="Total Applications" value={stats.applications} trend="Across all students" color="var(--info)" />
        <StatCard label="Placements" value={stats.placements} trend="Accepted offers" color="var(--success)" />
        <StatCard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          trend={stats.pendingApprovals === 0 ? "All clear ✓" : "Employers awaiting review"}
          trendUp={stats.pendingApprovals === 0}
          color={stats.pendingApprovals > 0 ? "var(--warning)" : "var(--success)"}
        />
      </div>

      {/* Navigation */}
      <div style={{ padding: "20px 28px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Available Views
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <NavigationCard title="View Students" description="Browse student directory (read-only)" href="/committee/students" icon="Users" disabled />
          <NavigationCard title="View Applications" description="Browse all applications (read-only)" href="/committee/applications" icon="FileText" disabled />
          <NavigationCard title="Submit Feedback" description="Send feedback to administrators" href="/committee/feedback" icon="MessageSquare" disabled />
        </div>
      </div>

      {/* Recent Applications */}
      <div style={{ padding: "20px 28px 0" }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Recent Applications (Read-Only)
          </div>
          {recentApplications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
              {collegeId ? "No applications found for your institution." : "No institution linked to your account."}
            </div>
          ) : (
            recentApplications.map(app => {
              const s = STATUS_STYLES[app.application_status] ?? STATUS_STYLES.applied;
              return (
                <div key={app.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-secondary)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", flexShrink: 0 }}>
                    {(app.student?.full_name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{app.student?.full_name ?? "Student"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {app.jobs?.company_name} · {app.jobs?.title}
                      {app.student?.branch ? ` · ${app.student.branch}` : ""}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--radius-full)", background: s.bg, color: s.color }}>
                    {app.application_status}
                  </span>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
}
