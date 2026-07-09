import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import StatusChip from "@/components/employer/StatusChip";

export default async function EmployerJobsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id, approval_status")
    .eq("user_id", user.id)
    .single();

  const isApproved = profile?.approval_status === "approved";

  const { data: jobs } = await supabase
    .from("job_postings")
    .select("id, title, job_type, status, deadline, openings, created_at")
    .eq("employer_id", profile?.id ?? "")
    .order("created_at", { ascending: false });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const JOB_TYPE_LABEL: Record<string, string> = {
    full_time: "Full-time", internship: "Internship", ppo: "PPO",
  };

  return (
    <>
      <style>{`
        .ejl-topbar { padding: 22px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .ejl-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .ejl-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .ejl-new-btn {
          display: flex; align-items: center; gap: 7px; padding: 9px 18px;
          border-radius: 10px; border: none; cursor: pointer; text-decoration: none;
          background: linear-gradient(135deg,#0EA5E9,#6366F1); color: white;
          font-size: 13px; font-weight: 600; transition: opacity .2s;
        }
        .ejl-new-btn:hover { opacity: .88; }
        .ejl-new-btn--disabled { opacity: .4; pointer-events: none; }
        .ejl-content { padding: 28px 32px; }
        .ejl-table-wrap { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 16px; overflow: hidden; }
        .ejl-table { width: 100%; border-collapse: collapse; }
        .ejl-th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .ejl-td { padding: 14px 16px; font-size: 13px; color: #CBD5E1; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
        .ejl-tr:last-child .ejl-td { border-bottom: none; }
        .ejl-tr:hover .ejl-td { background: rgba(255,255,255,.02); }
        .ejl-title { font-weight: 600; color: #E2E8F0; }
        .ejl-type-chip { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(99,102,241,.15); color: #A78BFA; }
        .ejl-action { padding: 6px 12px; border-radius: 7px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
        .ejl-action.view { background: rgba(14,165,233,.12); color: #38BDF8; }
        .ejl-action.view:hover { background: rgba(14,165,233,.2); }
        .ejl-empty { padding: 60px; text-align: center; color: #475569; font-size: 14px; }
        .ejl-empty a { color: #0EA5E9; text-decoration: none; }
      `}</style>

      <div className="ejl-topbar">
        <div>
          <h2>Job Postings</h2>
          <p>Manage all your job listings here.</p>
        </div>
        <Link
          href="/employer/jobs/new"
          className={`ejl-new-btn${!isApproved ? " ejl-new-btn--disabled" : ""}`}
        >
          + New Job
        </Link>
      </div>

      <div className="ejl-content">
        <div className="ejl-table-wrap">
          <table className="ejl-table">
            <thead>
              <tr>
                {["Role Title", "Type", "Openings", "Deadline", "Status", "Actions"].map((h) => (
                  <th key={h} className="ejl-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!jobs || jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ejl-empty">
                    No jobs posted yet.{" "}
                    {isApproved
                      ? <Link href="/employer/jobs/new">Create your first job posting →</Link>
                      : "Get approved first to post jobs."}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="ejl-tr">
                    <td className="ejl-td"><div className="ejl-title">{job.title}</div></td>
                    <td className="ejl-td"><span className="ejl-type-chip">{JOB_TYPE_LABEL[job.job_type] ?? job.job_type}</span></td>
                    <td className="ejl-td">{job.openings}</td>
                    <td className="ejl-td">{fmt(job.deadline)}</td>
                    <td className="ejl-td"><StatusChip status={job.status} size="sm" /></td>
                    <td className="ejl-td">
                      <Link href={`/employer/jobs/${job.id}/applicants`} className="ejl-action view">
                        View Applicants
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
