import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default async function EmployerDashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id, company_name, approval_status")
    .eq("user_id", user.id)
    .single();

  const employerId = profile?.id ?? null;
  const companyName = profile?.company_name ?? "Your Company";
  const approvalStatus = (profile?.approval_status ?? "pending") as "pending" | "approved" | "rejected";
  const isApproved = approvalStatus === "approved";

  // Parallel data fetch
  const [jobsRes, drivesRes, applicationsRes] = await Promise.all([
    employerId
      ? supabase.from("jobs").select("id, title, status, application_deadline, created_at").eq("employer_id", employerId).order("created_at", { ascending: false }).limit(5)
      : Promise.resolve({ data: [], error: null }),
    employerId
      ? supabase.from("placement_drives").select("id, drive_name, drive_date, status, drive_mode").eq("employer_id", employerId).gte("drive_date", new Date().toISOString()).order("drive_date").limit(3)
      : Promise.resolve({ data: [], error: null }),
    employerId
      ? supabase.from("applications").select("id, application_status, applied_at, job_id").in(
          "job_id",
          (await supabase.from("jobs").select("id").eq("employer_id", employerId ?? "")).data?.map((j: { id: string }) => j.id) ?? []
        )
      : Promise.resolve({ data: [], error: null }),
  ]);

  const jobs = jobsRes.data ?? [];
  const drives = drivesRes.data ?? [];
  const applications = applicationsRes.data ?? [];

  const activeJobs = jobs.filter((j) => j.status === "published").length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const applicantsThisMonth = applications.filter((a) => a.applied_at >= monthStart).length;
  const pendingReview = applications.filter((a) => a.application_status === "applied").length;

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title={`${companyName} Dashboard 🏢`}
        description="Overview of your recruitment activity."
        actions={
          isApproved ? (
            <Button href="/employer/jobs/new">+ Post a Job</Button>
          ) : (
            <span style={{ fontSize: 13, color: "var(--warning-text)", background: "var(--warning-light)", padding: "6px 14px", borderRadius: "var(--radius-md)", fontWeight: 600 }}>
              Approval: {approvalStatus}
            </span>
          )
        }
      />

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          padding: "20px 28px 0",
        }}
      >
        <StatCard label="Active Job Posts" value={activeJobs} color="var(--info)" />
        <StatCard label="Applicants This Month" value={applicantsThisMonth} color="var(--accent-primary)" />
        <StatCard label="Upcoming Drives" value={drives.length} color="var(--pending)" />
        <StatCard label="Pending Review" value={pendingReview} color="var(--warning)" />
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "20px 28px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <NavigationCard title="Job Postings" description="View and manage your job posts" href="/employer/jobs" icon="Briefcase" />
          <NavigationCard title="Placement Drives" description="Manage upcoming campus drives" href="/employer/drives" icon="Target" />
          <NavigationCard title="Offers" description="View and manage offers" href="/employer/offers" icon="Gift" />
          <NavigationCard title="Company Profile" description="Update your company details" href="/employer/profile" icon="Building2" />
        </div>
      </div>

      {/* Recent Jobs + Drives */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 16,
          padding: "20px 28px 0",
        }}
      >
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            Recent Job Postings
            <a href="/employer/jobs" style={{ fontSize: 12, color: "var(--accent-text)", textDecoration: "none" }}>View all →</a>
          </div>
          {jobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No jobs posted yet. {isApproved && <a href="/employer/jobs/new" style={{ color: "var(--accent-text)" }}>Post your first job →</a>}
            </div>
          ) : (
            jobs.map((j) => (
              <div
                key={j.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 0",
                  borderBottom: "1px solid var(--border-secondary)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{j.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Deadline: {new Date(j.application_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    background: j.status === "published" ? "var(--success-light)" : "var(--bg-tertiary)",
                    color: j.status === "published" ? "var(--success-text)" : "var(--text-muted)",
                  }}
                >
                  {j.status}
                </span>
              </div>
            ))
          )}
        </Card>

        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            Upcoming Drives
            <a href="/employer/drives" style={{ fontSize: 12, color: "var(--accent-text)", textDecoration: "none" }}>View all →</a>
          </div>
          {drives.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No upcoming drives.
            </div>
          ) : (
            drives.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: 13,
                  borderRadius: "var(--radius-md)",
                  marginBottom: 10,
                  background: "var(--info-light)",
                  border: "1px solid var(--border-secondary)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{d.drive_name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {new Date(d.drive_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {d.drive_mode === "online" ? "Virtual" : "Physical"}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          div[style*="gridTemplateColumns: 1fr 340px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}