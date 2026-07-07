"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type AppStatus = "applied" | "shortlisted" | "assessment" | "interview" | "selected" | "rejected" | "withdrawn";

type Application = {
  id: string;
  application_status: AppStatus;
  applied_at: string;
  updated_status_at: string;
  remarks: string | null;
  jobs: { id: string; title: string; location: string | null; salary_package: number | null } | null;
  employer_profiles: { company_name: string; logo_url: string | null } | null;
  placement_drives: { drive_name: string; drive_date: string } | null;
};

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; bg: string; border: string; step: number }> = {
  applied:     { label: "Applied",            color: "#94A3B8", bg: "rgba(100,116,139,.12)", border: "rgba(100,116,139,.2)", step: 0 },
  shortlisted: { label: "Shortlisted",        color: "#34D399", bg: "rgba(16,185,129,.12)",  border: "rgba(16,185,129,.2)",  step: 1 },
  assessment:  { label: "Assessment",         color: "#818CF8", bg: "rgba(99,102,241,.12)",  border: "rgba(99,102,241,.2)",  step: 2 },
  interview:   { label: "Interview",          color: "#FCD34D", bg: "rgba(245,158,11,.12)",  border: "rgba(245,158,11,.2)",  step: 3 },
  selected:    { label: "Offer Extended",     color: "#34D399", bg: "rgba(16,185,129,.15)",  border: "rgba(16,185,129,.3)",  step: 4 },
  rejected:    { label: "Not Selected",       color: "#F87171", bg: "rgba(239,68,68,.1)",    border: "rgba(239,68,68,.18)",  step: -1 },
  withdrawn:   { label: "Withdrawn",          color: "#64748B", bg: "rgba(100,116,139,.08)", border: "rgba(100,116,139,.15)", step: -1 },
};

const PIPELINE = ["applied", "shortlisted", "assessment", "interview", "selected"] as const;

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconRotate = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
  </svg>
);

/* ─── Withdraw confirm modal ─────────────────────────────────────────────── */
function WithdrawModal({ app, onConfirm, onCancel, loading }: {
  app: Application; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: "#0E1629", border: "1px solid rgba(239,68,68,.25)", borderRadius: 16, padding: 28, width: 400, maxWidth: "100%" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>Withdraw Application?</div>
        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20, lineHeight: 1.5 }}>
          Withdraw your application for <strong style={{ color: "#E2E8F0" }}>{app.jobs?.title}</strong> at{" "}
          <strong style={{ color: "#E2E8F0" }}>{app.employer_profiles?.company_name}</strong>? This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "#DC2626", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            {loading ? "Withdrawing…" : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status pipeline mini-component ───────────────────────────────────────── */
function StatusPipeline({ status }: { status: AppStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (cfg.step === -1) {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
        {cfg.label}
      </span>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
      {PIPELINE.map((s, i) => {
        const sCfg = STATUS_CONFIG[s];
        const done = i <= cfg.step;
        const current = s === status;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? (current ? sCfg.bg : "rgba(16,185,129,.1)") : "rgba(255,255,255,.06)",
              border: `1.5px solid ${done ? (current ? sCfg.border : "rgba(16,185,129,.2)") : "rgba(255,255,255,.1)"}`,
              fontSize: 9, fontWeight: 700, color: done ? (current ? sCfg.color : "#34D399") : "#475569",
              transition: "all .2s", flexShrink: 0,
            }}>
              {done && !current ? <IconCheck /> : i + 1}
            </div>
            {i < PIPELINE.length - 1 && (
              <div style={{ width: 16, height: 2, background: i < cfg.step ? "rgba(16,185,129,.3)" : "rgba(255,255,255,.08)", borderRadius: 2 }} />
            )}
          </div>
        );
      })}
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, marginLeft: 6 }}>
        {cfg.label}
      </span>
    </div>
  );
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | AppStatus>("all");
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sp } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!sp) { setLoading(false); return; }

      const { data } = await supabase
        .from("applications")
        .select(`
          id, application_status, applied_at, updated_status_at, remarks,
          jobs!inner(id, title, location, salary_package,
            employer_profiles!inner(company_name, logo_url)
          ),
          placement_drives(drive_name, drive_date)
        `)
        .eq("student_id", sp.id)
        .is("deleted_at", null)
        .order("applied_at", { ascending: false });

      if (data) {
        setApps(data.map((a) => ({
          ...a,
          employer_profiles: (a.jobs as { employer_profiles: { company_name: string; logo_url: string | null } }).employer_profiles,
        })) as unknown as Application[]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      const res = await fetch(`/api/student/applications/${withdrawTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      });
      if (!res.ok) throw new Error("Failed to withdraw");
      setApps((prev) => prev.map((a) => a.id === withdrawTarget.id ? { ...a, application_status: "withdrawn" } : a));
      showToast("Application withdrawn.");
    } catch (e) {
      showToast((e as Error).message, "err");
    }
    setWithdrawing(false);
    setWithdrawTarget(null);
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.application_status === filter);

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map((s) => [s, apps.filter((a) => a.application_status === s).length])
  ) as Record<AppStatus, number>;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(99,102,241,.2)", borderTopColor: "#6366F1", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .apps-wrap { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }

        /* ── Filter tabs ── */
        .apps-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .apps-tab {
          padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04); color: #64748B; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .15s;
        }
        .apps-tab:hover { color: #CBD5E1; border-color: rgba(255,255,255,.15); }
        .apps-tab.active { background: rgba(99,102,241,.15); color: #A5B4FC; border-color: rgba(99,102,241,.25); }
        .apps-tab .count { display: inline-block; margin-left: 5px; background: rgba(255,255,255,.08); padding: 1px 5px; border-radius: 8px; font-size: 10px; }

        /* ── App card ── */
        .app-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 20px; margin-bottom: 12px;
          transition: border-color .18s;
        }
        .app-card:hover { border-color: rgba(255,255,255,.12); }
        .app-card-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
        .app-logo {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg,#6366F1,#8B5CF6);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 800; color: white; overflow: hidden;
        }
        .app-logo img { width: 100%; height: 100%; object-fit: cover; }
        .app-info { flex: 1; }
        .app-title { font-size: 15px; font-weight: 700; color: white; }
        .app-company { font-size: 12.5px; color: #818CF8; margin-top: 2px; }
        .app-meta { font-size: 11px; color: #475569; margin-top: 4px; display: flex; gap: 10px; flex-wrap: wrap; }

        .app-card-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .app-withdraw-btn {
          padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.15);
          color: #F87171; cursor: pointer; transition: all .18s;
        }
        .app-withdraw-btn:hover { background: rgba(239,68,68,.15); }

        /* ── Remarks ── */
        .app-remarks {
          margin-top: 12px; padding: 10px 14px; border-radius: 8px;
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
          font-size: 12px; color: "#94A3B8"; color: #94A3B8;
        }

        /* ── Toast ── */
        .apps-toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
          z-index: 300; box-shadow: 0 8px 32px rgba(0,0,0,.4);
          animation: toast-in .25s ease;
        }
        .apps-toast.ok  { background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.25); color: #34D399; }
        .apps-toast.err { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.25); color: #F87171; }
        @keyframes toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 700px) { .apps-wrap { padding: 16px; } }
      `}</style>

      <div className="apps-wrap">
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white" }}>My Applications</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Track your application pipeline in real time.</p>
        </div>

        {/* Summary stats */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Total", count: apps.length, color: "#6366F1" },
            { label: "Active", count: apps.filter((a) => !["rejected", "withdrawn"].includes(a.application_status)).length, color: "#10B981" },
            { label: "Offers", count: counts.selected, color: "#FCD34D" },
            { label: "Rejected", count: counts.rejected, color: "#F87171" },
          ].map((s) => (
            <div key={s.label} style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="apps-tabs">
          <button className={`apps-tab${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
            All <span className="count">{apps.length}</span>
          </button>
          {(Object.entries(STATUS_CONFIG) as [AppStatus, typeof STATUS_CONFIG[AppStatus]][]).map(([s, cfg]) => (
            counts[s] > 0 && (
              <button key={s} className={`apps-tab${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
                {cfg.label} <span className="count">{counts[s]}</span>
              </button>
            )
          ))}
        </div>

        {/* Application cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>
              {filter === "all" ? "No applications yet" : `No ${STATUS_CONFIG[filter as AppStatus]?.label} applications`}
            </div>
            {filter === "all" && (
              <div style={{ marginTop: 12 }}>
                <a href="/student/jobs" style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                  Browse Jobs →
                </a>
              </div>
            )}
          </div>
        ) : (
          filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.application_status];
            return (
              <div key={app.id} className="app-card">
                <div className="app-card-header">
                  <div className="app-logo">
                    {app.employer_profiles?.logo_url ? (
                      <img src={app.employer_profiles.logo_url} alt="" />
                    ) : (
                      (app.employer_profiles?.company_name?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  <div className="app-info">
                    <div className="app-title">{app.jobs?.title}</div>
                    <div className="app-company">{app.employer_profiles?.company_name}</div>
                    <div className="app-meta">
                      <span>Applied {new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {app.jobs?.location && <span>· {app.jobs.location}</span>}
                      {app.jobs?.salary_package && <span>· ₹{app.jobs.salary_package} LPA</span>}
                      {app.placement_drives && <span>· Drive: {app.placement_drives.drive_name}</span>}
                    </div>
                  </div>
                </div>

                <div className="app-card-footer">
                  <StatusPipeline status={app.application_status} />
                  {app.application_status === "applied" && (
                    <button className="app-withdraw-btn" onClick={() => setWithdrawTarget(app)}>
                      <IconRotate /> Withdraw
                    </button>
                  )}
                </div>

                {app.remarks && (
                  <div className="app-remarks">
                    <strong style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>Note from recruiter: </strong>
                    {app.remarks}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {withdrawTarget && (
        <WithdrawModal
          app={withdrawTarget}
          onConfirm={handleWithdraw}
          onCancel={() => setWithdrawTarget(null)}
          loading={withdrawing}
        />
      )}

      {toast && <div className={`apps-toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
