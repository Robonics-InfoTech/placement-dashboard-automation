"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── icons ───────────────────────────────────────────────────────────── */
const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconLogOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlertTriangle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* ─── data ─────────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Overview",    icon: <IconGrid />,       active: true },
  { label: "Students",    icon: <IconUsers />,      badge: 142 },
  { label: "Employers",   icon: <IconBriefcase />,  badge: 24 },
  { label: "Reports",     icon: <IconBarChart /> },
  { label: "System",      icon: <IconShield /> },
];

const STATS = [
  { label: "Total Students",      value: "1,284", delta: "+48 this month",  color: "#10B981" },
  { label: "Registered Employers", value: "67",   delta: "+5 this month",   color: "#F59E0B" },
  { label: "Placements This Year", value: "318",  delta: "↑ 24% vs last yr",color: "#6366F1" },
  { label: "Pending Approvals",    value: "12",   delta: "Action required",  color: "#EF4444" },
];

const RECENT_STUDENTS = [
  { name: "Priya Sharma",   branch: "CSE",  batch: 2025, status: "Placed",   company: "Infosys" },
  { name: "Arjun Mehta",    branch: "ECE",  batch: 2025, status: "Active",   company: "—" },
  { name: "Neha Gupta",     branch: "IT",   batch: 2024, status: "Placed",   company: "TCS" },
  { name: "Rohan Patel",    branch: "MECH", batch: 2025, status: "Active",   company: "—" },
  { name: "Sneha Rao",      branch: "CSE",  batch: 2024, status: "Placed",   company: "Wipro" },
];

const PENDING_EMPLOYERS = [
  { name: "TechCorp Pvt. Ltd.",  industry: "IT",       submitted: "Jul 1" },
  { name: "FinEdge Analytics",   industry: "Finance",  submitted: "Jun 30" },
  { name: "GreenBuild Infra",    industry: "Civil",    submitted: "Jun 28" },
];

const PLACEMENT_STATS = [
  { branch: "CSE",  placed: 88, total: 110 },
  { branch: "ECE",  placed: 62, total: 90 },
  { branch: "IT",   placed: 74, total: 95 },
  { branch: "MECH", placed: 45, total: 80 },
  { branch: "CIVIL",placed: 30, total: 60 },
];

export default function AdminDashboard() {
  const [user, setUser] = useState<{ email: string; metadata: Record<string, string> } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email ?? "", metadata: (data.user.user_metadata ?? {}) as Record<string, string> });
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const name = user?.metadata?.full_name ?? user?.email?.split("@")[0] ?? "Admin";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #060A14; color: #E2E8F0; }

        .ad-shell { display: flex; min-height: 100vh; }

        .ad-sidebar {
          width: 240px; flex-shrink: 0;
          background: rgba(16,185,129,.04);
          border-right: 1px solid rgba(16,185,129,.1);
          display: flex; flex-direction: column; padding: 28px 0;
          position: sticky; top: 0; height: 100vh;
        }
        .ad-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 0 24px 28px; border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .ad-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg,#10B981,#059669);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: white;
        }
        .ad-logo-text { font-size: 16px; font-weight: 700; color: white; }
        .ad-logo-sub  { font-size: 10px; color: #64748B; font-weight: 500; }

        .ad-nav { padding: 20px 12px; flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .ad-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 14px; font-weight: 500; color: #94A3B8;
          cursor: pointer; transition: all .2s;
        }
        .ad-nav-item:hover { background: rgba(255,255,255,.05); color: #E2E8F0; }
        .ad-nav-item.active { background: rgba(16,185,129,.12); color: #34D399; border: 1px solid rgba(16,185,129,.2); }
        .ad-badge { margin-left: auto; background: #10B981; color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }

        .ad-user {
          margin: 0 12px; padding: 14px; border-radius: 12px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .ad-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#10B981,#059669);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .ad-user-name { font-size: 13px; font-weight: 600; color: #E2E8F0; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ad-user-role { font-size: 11px; color: #64748B; }
        .ad-logout-btn { margin-left: auto; background: transparent; border: none; cursor: pointer; color: #64748B; display: flex; transition: color .2s; padding: 4px; }
        .ad-logout-btn:hover { color: #EF4444; }

        .ad-main { flex: 1; display: flex; flex-direction: column; }
        .ad-topbar {
          padding: 20px 32px; display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02);
        }
        .ad-greeting h2 { font-size: 20px; font-weight: 700; color: white; }
        .ad-greeting p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .ad-topbar-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 10px;
          background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2);
          color: #FCA5A5; font-size: 13px; font-weight: 600;
        }

        .ad-content { padding: 28px 32px; flex: 1; overflow-y: auto; }
        .ad-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
        .ad-stat-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 20px; transition: transform .2s;
        }
        .ad-stat-card:hover { transform: translateY(-3px); }
        .ad-stat-dot { width: 8px; height: 8px; border-radius: 50%; margin-bottom: 12px; }
        .ad-stat-value { font-size: 28px; font-weight: 800; color: white; }
        .ad-stat-label { font-size: 12px; color: #64748B; font-weight: 500; margin-top: 4px; }
        .ad-stat-delta { margin-top: 10px; font-size: 11px; font-weight: 600; color: #10B981; }
        .ad-stat-delta.warn { color: #EF4444; }

        .ad-grid3 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .ad-grid2 { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .ad-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 24px;
        }
        .ad-card-title { font-size: 15px; font-weight: 700; color: white; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
        .ad-card-title span { font-size: 12px; font-weight: 500; color: #10B981; cursor: pointer; }

        /* Students table */
        .ad-student-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .ad-student-row:last-child { border-bottom: none; }
        .ad-s-avatar {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: rgba(16,185,129,.15); display: flex; align-items: center;
          justify-content: center; font-size: 12px; font-weight: 700; color: #34D399;
        }
        .ad-s-name  { font-size: 13px; font-weight: 600; color: #E2E8F0; }
        .ad-s-meta  { font-size: 11px; color: #64748B; }
        .ad-s-status { font-size: 11px; font-weight: 600; margin-left: auto; padding: 3px 10px; border-radius: 20px; }
        .ad-s-status.Placed  { background: rgba(16,185,129,.15); color: #34D399; }
        .ad-s-status.Active  { background: rgba(100,116,139,.15); color: #94A3B8; }

        /* Branch bar chart */
        .ad-branch-item { margin-bottom: 14px; }
        .ad-branch-label { display: flex; justify-content: space-between; font-size: 12px; color: #94A3B8; margin-bottom: 5px; }
        .ad-branch-label span { color: #10B981; font-weight: 600; }
        .ad-branch-track { height: 6px; background: rgba(255,255,255,.06); border-radius: 20px; overflow: hidden; }
        .ad-branch-fill  { height: 100%; border-radius: 20px; background: linear-gradient(90deg,#10B981,#059669); transition: width .8s ease; }

        /* Pending approvals */
        .ad-pending-item {
          padding: 14px; border-radius: 12px; margin-bottom: 10px;
          background: rgba(239,68,68,.06); border: 1px solid rgba(239,68,68,.12);
        }
        .ad-pending-name { font-size: 14px; font-weight: 600; color: white; }
        .ad-pending-meta { font-size: 12px; color: #64748B; margin-top: 3px; }
        .ad-pending-actions { display: flex; gap: 8px; margin-top: 10px; }
        .ad-btn-approve {
          flex: 1; padding: 7px; border-radius: 8px; border: none; cursor: pointer;
          background: rgba(16,185,129,.15); color: #34D399; font-size: 12px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 5px; transition: background .2s;
        }
        .ad-btn-approve:hover { background: rgba(16,185,129,.25); }
        .ad-btn-reject {
          flex: 1; padding: 7px; border-radius: 8px; border: none; cursor: pointer;
          background: rgba(239,68,68,.1); color: #FCA5A5; font-size: 12px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 5px; transition: background .2s;
        }
        .ad-btn-reject:hover { background: rgba(239,68,68,.2); }

        @media(max-width:1100px){
          .ad-grid2 { grid-template-columns: 1fr; }
          .ad-grid3 { grid-template-columns: 1fr; }
        }
        @media(max-width:900px){
          .ad-stats   { grid-template-columns: repeat(2,1fr); }
          .ad-sidebar { display: none; }
        }
      `}</style>

      <div className="ad-shell">
        <aside className="ad-sidebar">
          <div className="ad-logo">
            <div className="ad-logo-icon">A</div>
            <div>
              <div className="ad-logo-text">PlacementHub</div>
              <div className="ad-logo-sub">Admin Console</div>
            </div>
          </div>
          <nav className="ad-nav">
            {NAV.map((n) => (
              <div key={n.label} className={`ad-nav-item${n.active ? " active" : ""}`}>
                {n.icon}{n.label}
                {n.badge && <span className="ad-badge">{n.badge}</span>}
              </div>
            ))}
          </nav>
          <div style={{ padding: "0 0 12px" }}>
            <div className="ad-user">
              <div className="ad-avatar">{name[0]?.toUpperCase()}</div>
              <div>
                <div className="ad-user-name">{name}</div>
                <div className="ad-user-role">College Admin</div>
              </div>
              <button className="ad-logout-btn" onClick={handleLogout} title="Logout"><IconLogOut /></button>
            </div>
          </div>
        </aside>

        <main className="ad-main">
          <div className="ad-topbar">
            <div className="ad-greeting">
              <h2>Admin Overview 🏫</h2>
              <p>Placement cell management &amp; analytics.</p>
            </div>
            <div className="ad-topbar-badge">
              <IconAlertTriangle /> 12 pending approvals
            </div>
          </div>

          <div className="ad-content">
            {/* Stats */}
            <div className="ad-stats">
              {STATS.map((s) => (
                <div className="ad-stat-card" key={s.label}>
                  <div className="ad-stat-dot" style={{ background: s.color }} />
                  <div className="ad-stat-value">{s.value}</div>
                  <div className="ad-stat-label">{s.label}</div>
                  <div className={`ad-stat-delta${s.color === "#EF4444" ? " warn" : ""}`}>
                    {s.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* Students + Branch stats */}
            <div className="ad-grid2" style={{ marginBottom: "20px" }}>
              {/* Recent students */}
              <div className="ad-card">
                <div className="ad-card-title">Recent Students <span>View all →</span></div>
                {RECENT_STUDENTS.map((s) => (
                  <div className="ad-student-row" key={s.name}>
                    <div className="ad-s-avatar">{s.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div className="ad-s-name">{s.name}</div>
                      <div className="ad-s-meta">{s.branch} · Batch {s.batch}{s.company !== "—" ? ` · ${s.company}` : ""}</div>
                    </div>
                    <div className={`ad-s-status ${s.status}`}>{s.status}</div>
                  </div>
                ))}
              </div>

              {/* Branch placement rates */}
              <div className="ad-card">
                <div className="ad-card-title">Placement by Branch</div>
                {PLACEMENT_STATS.map((b) => {
                  const pct = Math.round((b.placed / b.total) * 100);
                  return (
                    <div className="ad-branch-item" key={b.branch}>
                      <div className="ad-branch-label">
                        {b.branch} — {b.placed}/{b.total} <span>{pct}%</span>
                      </div>
                      <div className="ad-branch-track">
                        <div className="ad-branch-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending employer approvals */}
            <div className="ad-card">
              <div className="ad-card-title">Pending Employer Approvals <span>View all →</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                {PENDING_EMPLOYERS.map((e) => (
                  <div className="ad-pending-item" key={e.name}>
                    <div className="ad-pending-name">{e.name}</div>
                    <div className="ad-pending-meta">{e.industry} · Submitted {e.submitted}</div>
                    <div className="ad-pending-actions">
                      <button className="ad-btn-approve"><IconCheck /> Approve</button>
                      <button className="ad-btn-reject"><IconAlertTriangle /> Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}