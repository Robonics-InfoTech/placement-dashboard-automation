import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";
import DatabaseManager from "@/components/settings/DatabaseManager";

export default async function SuperAdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Platform-wide stats — all fetched in parallel
  const [
    collegesRes,
    employersRes,
    usersRes,
    activeJobsRes,
    openFeedbackRes,
    recentCollegesRes,
    recentFeedbackRes,
  ] = await Promise.all([
    supabase.from("colleges").select("*", { count: "exact", head: true }),
    supabase.from("employer_profiles").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("feedback").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("colleges").select("id, name, code, city, state, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("feedback").select("id, subject, category, status, created_at").eq("status", "open").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalColleges = collegesRes.count ?? 0;
  const totalEmployers = employersRes.count ?? 0;
  const totalUsers = usersRes.count ?? 0;
  const activeJobs = activeJobsRes.count ?? 0;
  const openFeedback = openFeedbackRes.count ?? 0;
  const recentColleges = recentCollegesRes.data ?? [];
  const recentFeedback = recentFeedbackRes.data ?? [];

  const STATUS_COLORS: Record<string, string> = {
    active: "var(--success)",
    inactive: "var(--text-muted)",
    suspended: "var(--error)",
    pending: "var(--warning)",
  };

  const FEEDBACK_CATEGORY_ICONS: Record<string, string> = {
    general: "💬",
    technical_issue: "🔧",
    profile_help: "👤",
    job_drive_query: "📋",
    offer_related: "🎁",
    other: "📌",
  };

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title="Platform Overview ⚡"
        description="Super admin — live platform-wide analytics and management."
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, padding: "20px 28px 0" }}>
        <StatCard label="Total Colleges" value={totalColleges} trend="Registered institutions" color="var(--accent-primary)" />
        <StatCard label="Total Employers" value={totalEmployers} trend="Across all colleges" color="var(--info)" />
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} trend="All active accounts" color="var(--success)" />
        <StatCard label="Active Jobs" value={activeJobs} trend="Published job posts" color="var(--warning)" />
        <StatCard
          label="Open Feedback"
          value={openFeedback}
          trend={openFeedback === 0 ? "Inbox clear ✓" : "Needs attention"}
          trendUp={openFeedback === 0}
          color={openFeedback > 0 ? "var(--error)" : "var(--success)"}
        />
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "20px 28px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Administration
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <NavigationCard title="Colleges" description="Manage registered institutions" href="/admin/colleges" icon="Building" disabled />
          <NavigationCard title="Employers" description="Manage all employers" href="/admin/employers" icon="Building2" disabled />
          <NavigationCard title="Users" description="Manage all platform users" href="/admin/users" icon="Users" disabled />
          <NavigationCard title={`Feedback Inbox ${openFeedback > 0 ? `(${openFeedback})` : ""}`} description="Review all platform feedback" href="/admin/feedback" icon="Inbox" disabled />
          <NavigationCard title="Audit Reports" description="Platform audit trail" href="/admin/audit" icon="Shield" disabled />
          <NavigationCard title="Error Logs" description="System error tracking" href="/admin/errors" icon="AlertTriangle" disabled />
          <NavigationCard title="Email Templates" description="Manage notification emails" href="/admin/email-templates" icon="Mail" disabled />
          <NavigationCard title="Settings" description="Platform configuration" href="/admin/settings" icon="Settings" disabled />
        </div>
      </div>

      {/* Recent Colleges + Open Feedback */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, padding: "20px 28px 0" }}>
        {/* Recent Colleges */}
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Registered Colleges
          </div>
          {recentColleges.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No colleges registered yet.
            </div>
          ) : (
            recentColleges.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-secondary)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--accent-text)", flexShrink: 0 }}>
                  {(c.code ?? c.name ?? "?").substring(0, 3).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.city}{c.state ? `, ${c.state}` : ""}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--bg-tertiary)", color: STATUS_COLORS[c.status ?? "active"] ?? "var(--text-muted)", textTransform: "uppercase" }}>
                  {c.status ?? "active"}
                </span>
              </div>
            ))
          )}
        </Card>

        {/* Open Feedback */}
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Open Feedback
          </div>
          {recentFeedback.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No open feedback. Inbox is clear.</div>
            </div>
          ) : (
            recentFeedback.map(fb => (
              <div key={fb.id} style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-secondary)", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 14 }}>{FEEDBACK_CATEGORY_ICONS[fb.category] ?? "📌"}</span>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fb.subject}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {fb.category?.replace(/_/g, " ")} · {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Database Manager */}
      <div style={{ padding: "20px 28px 0" }}>
        <DatabaseManager />
      </div>

      <style>{`
        @media (max-width: 1000px) {
          div[style*="gridTemplateColumns: 1fr 340px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}