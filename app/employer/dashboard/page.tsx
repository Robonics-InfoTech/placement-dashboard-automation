import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import StatusChip from "@/components/employer/StatusChip";


/* ── icon helpers ─────────────────────────────────────────────────────── */
const IPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ICal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default async function EmployerDashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // ── Fetch employer profile ──────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id, company_name, approval_status")
    .eq("user_id", user.id)
    .single();

  const employerId      = profile?.id ?? null;
  const approvalStatus  = (profile?.approval_status ?? "pending") as "pending" | "approved" | "rejected";
  const isApproved      = approvalStatus === "approved";

  // ── Parallel data fetch ─────────────────────────────────────────────────
  const [jobsRes, drivesRes, applicationsRes] = await Promise.all([
    employerId
      ? supabase
          .from("jobs")                                   // real table
          .select("id, title, status, application_deadline, created_at")
          .eq("employer_id", employerId)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),

    employerId
      ? supabase
          .from("placement_drives")                       // real table
          .select("id, drive_name, drive_date, status, drive_mode")
          .eq("employer_id", employerId)
          .gte("drive_date", new Date().toISOString())
          .order("drive_date")
          .limit(3)
      : Promise.resolve({ data: [], error: null }),

    employerId
      ? supabase
          .from("applications")
          .select("id, application_status, applied_at, job_id")
          .in(
            "job_id",
            (await supabase
              .from("jobs")                               // real table
              .select("id")
              .eq("employer_id", employerId ?? "")
            ).data?.map((j: { id: string }) => j.id) ?? []
          )
      : Promise.resolve({ data: [], error: null }),
  ]);

  const jobs         = jobsRes.data         ?? [];
  const drives       = drivesRes.data       ?? [];
  const applications = applicationsRes.data ?? [];

  // ── Compute stats ───────────────────────────────────────────────────────
  // 'published' = active in real schema
  const activeJobs    = jobs.filter((j) => j.status === "published").length;
  const now           = new Date();
  const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const applicantsThisMonth = applications.filter(
    (a) => a.applied_at >= monthStart
  ).length;
  const pendingReview = applications.filter((a) => a.application_status === "applied").length;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <style>{`
        .epd-topbar {
          padding: 22px 32px; display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02);
        }
        .epd-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .epd-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .epd-post-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 10px; border: none; cursor: pointer; text-decoration: none;
          background: linear-gradient(135deg,#0EA5E9,#6366F1);
          color: white; font-size: 13px; font-weight: 600; transition: opacity .2s;
        }
        .epd-post-btn:hover { opacity: .88; }
        .epd-post-btn--disabled {
          opacity: .4; pointer-events: none; cursor: not-allowed;
        }

        .epd-content { padding: 28px 32px; }

        .epd-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
        .epd-stat {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 20px; transition: transform .2s;
        }
        .epd-stat:hover { transform: translateY(-3px); }
        .epd-stat-dot { width: 8px; height: 8px; border-radius: 50%; margin-bottom: 12px; }
        .epd-stat-value { font-size: 30px; font-weight: 800; color: white; }
        .epd-stat-label { font-size: 12px; color: #64748B; font-weight: 500; margin-top: 4px; }

        .epd-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        .epd-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 22px;
        }
        .epd-card-hd {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .epd-card-hd h3 { font-size: 15px; font-weight: 700; color: white; }
        .epd-card-hd a  { font-size: 12px; color: #0EA5E9; text-decoration: none; display: flex; align-items: center; gap: 4px; }
        .epd-card-hd a:hover { opacity: .8; }

        .epd-job-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .epd-job-row:last-child { border-bottom: none; }
        .epd-job-title { font-size: 13px; font-weight: 600; color: #E2E8F0; flex: 1; }
        .epd-job-deadline { font-size: 11px; color: #64748B; }

        .epd-drive-item {
          padding: 13px; border-radius: 11px; margin-bottom: 10px;
          background: rgba(14,165,233,.07); border: 1px solid rgba(14,165,233,.14);
        }
        .epd-drive-item:last-child { margin-bottom: 0; }
        .epd-drive-name { font-size: 13px; font-weight: 600; color: white; }
        .epd-drive-meta { font-size: 12px; color: #64748B; margin-top: 4px; display: flex; gap: 10px; align-items: center; }

        .epd-empty { text-align: center; padding: 30px 0; color: #475569; font-size: 13px; }
        .epd-empty a { color: #0EA5E9; text-decoration: none; }

        @media(max-width:1000px){ .epd-stats { grid-template-columns: repeat(2,1fr); } .epd-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Top bar */}
      <div className="epd-topbar">
        <div>
          <h2>Dashboard 🏢</h2>
          <p>Overview of your recruitment activity.</p>
        </div>
        <Link
          href="/employer/jobs/new"
          className={`epd-post-btn${!isApproved ? " epd-post-btn--disabled" : ""}`}
        >
          <IPlus /> Post a Job
        </Link>
      </div>

      <div className="epd-content">

        {/* Stats */}
        <div className="epd-stats">
          {[
            { label: "Active Job Posts",     value: activeJobs,         color: "#0EA5E9" },
            { label: "Applicants This Month", value: applicantsThisMonth, color: "#6366F1" },
            { label: "Upcoming Drives",       value: drives.length,      color: "#8B5CF6" },
            { label: "Pending Review",        value: pendingReview,      color: "#F59E0B" },
          ].map((s) => (
            <div className="epd-stat" key={s.label}>
              <div className="epd-stat-dot" style={{ background: s.color }} />
              <div className="epd-stat-value">{s.value}</div>
              <div className="epd-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Grid: jobs + drives */}
        <div className="epd-grid">
          {/* Recent Job Postings */}
          <div className="epd-card">
            <div className="epd-card-hd">
              <h3>Recent Job Postings</h3>
              <Link href="/employer/jobs">View all <IArrow /></Link>
            </div>
            {jobs.length === 0 ? (
              <div className="epd-empty">
                No jobs posted yet.{" "}
                {isApproved && <Link href="/employer/jobs/new">Post your first job →</Link>}
              </div>
            ) : (
              jobs.map((j) => (
                <div className="epd-job-row" key={j.id}>
                  <div style={{ flex: 1 }}>
                    <div className="epd-job-title">{j.title}</div>
                    <div className="epd-job-deadline">Deadline: {fmt(j.application_deadline)}</div>
                  </div>
                  <StatusChip status={j.status} size="sm" />
                </div>
              ))
            )}
          </div>

          {/* Upcoming Drives */}
          <div className="epd-card">
            <div className="epd-card-hd">
              <h3>Upcoming Drives</h3>
              <Link href="/employer/drives">View all <IArrow /></Link>
            </div>
            {drives.length === 0 ? (
              <div className="epd-empty">No upcoming drives.</div>
            ) : (
              drives.map((d) => (
                <div className="epd-drive-item" key={d.id}>
                  <div className="epd-drive-name">{d.drive_name}</div>
                  <div className="epd-drive-meta">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ICal />{fmt(d.drive_date)}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <IUsers />{d.drive_mode === "online" ? "Virtual" : "Physical"}
                    </span>
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <StatusChip status={d.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}