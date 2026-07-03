"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── icons ───────────────────────────────────────────────────────────── */
const IconBuilding = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
);
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconFileText = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconLogOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

/* ─── data ─────────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Dashboard",    icon: <IconBuilding />, active: true },
  { label: "Post a Job",   icon: <IconPlus /> },
  { label: "Candidates",   icon: <IconUsers /> },
  { label: "Applications", icon: <IconFileText />, badge: 8 },
];

const STATS = [
  { label: "Active Job Posts",   value: "6",   delta: "+2 this month", color: "#0EA5E9" },
  { label: "Total Applicants",   value: "142",  delta: "+28 this week", color: "#6366F1" },
  { label: "Interviews Today",   value: "5",   delta: "2 confirmed",   color: "#8B5CF6" },
  { label: "Offers Extended",    value: "11",   delta: "+3 this month", color: "#10B981" },
];

const JOBS = [
  { title: "Software Engineer",    applicants: 38, deadline: "Jul 10", status: "Active",  color: "#0EA5E9" },
  { title: "Data Analyst",         applicants: 24, deadline: "Jul 15", status: "Active",  color: "#6366F1" },
  { title: "UI/UX Designer",       applicants: 19, deadline: "Jul 8",  status: "Active",  color: "#8B5CF6" },
  { title: "DevOps Engineer",      applicants: 41, deadline: "Jul 20", status: "Closing", color: "#F59E0B" },
  { title: "Product Manager",      applicants: 20, deadline: "Jul 5",  status: "Closed",  color: "#64748B" },
];

const CANDIDATES = [
  { name: "Priya Sharma",    branch: "CSE",  cgpa: "9.2", match: 94, location: "Mumbai" },
  { name: "Arjun Mehta",     branch: "ECE",  cgpa: "8.8", match: 88, location: "Pune" },
  { name: "Neha Gupta",      branch: "IT",   cgpa: "9.0", match: 85, location: "Bangalore" },
  { name: "Rohan Patel",     branch: "CSE",  cgpa: "8.5", match: 82, location: "Hyderabad" },
];

export default function EmployerDashboard() {
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

  const name = user?.metadata?.company_name ?? user?.metadata?.full_name ?? user?.email?.split("@")[0] ?? "Employer";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #060C18; color: #E2E8F0; }

        .ep-shell { display: flex; min-height: 100vh; }

        .ep-sidebar {
          width: 240px; flex-shrink: 0;
          background: rgba(14,165,233,.05);
          border-right: 1px solid rgba(14,165,233,.12);
          display: flex; flex-direction: column; padding: 28px 0;
          position: sticky; top: 0; height: 100vh;
        }
        .ep-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 0 24px 28px; border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .ep-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg,#0EA5E9,#6366F1);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: white;
        }
        .ep-logo-text { font-size: 16px; font-weight: 700; color: white; }
        .ep-logo-sub  { font-size: 10px; color: #64748B; font-weight: 500; }

        .ep-nav { padding: 20px 12px; flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .ep-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 14px; font-weight: 500; color: #94A3B8;
          cursor: pointer; transition: all .2s;
        }
        .ep-nav-item:hover { background: rgba(255,255,255,.05); color: #E2E8F0; }
        .ep-nav-item.active { background: rgba(14,165,233,.12); color: #38BDF8; border: 1px solid rgba(14,165,233,.2); }
        .ep-badge { margin-left: auto; background: #0EA5E9; color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }

        .ep-user {
          margin: 0 12px; padding: 14px; border-radius: 12px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .ep-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#0EA5E9,#6366F1);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .ep-user-name { font-size: 13px; font-weight: 600; color: #E2E8F0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; }
        .ep-user-role { font-size: 11px; color: #64748B; }
        .ep-logout-btn { margin-left: auto; background: transparent; border: none; cursor: pointer; color: #64748B; display: flex; transition: color .2s; padding: 4px; }
        .ep-logout-btn:hover { color: #EF4444; }

        .ep-main { flex: 1; display: flex; flex-direction: column; }
        .ep-topbar {
          padding: 20px 32px; display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02);
        }
        .ep-greeting h2 { font-size: 20px; font-weight: 700; color: white; }
        .ep-greeting p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .ep-post-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#0EA5E9,#6366F1);
          color: white; font-size: 13px; font-weight: 600; transition: opacity .2s;
        }
        .ep-post-btn:hover { opacity: .88; }

        .ep-content { padding: 28px 32px; flex: 1; overflow-y: auto; }
        .ep-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
        .ep-stat-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 20px; transition: transform .2s;
        }
        .ep-stat-card:hover { transform: translateY(-3px); }
        .ep-stat-dot { width: 8px; height: 8px; border-radius: 50%; margin-bottom: 12px; }
        .ep-stat-value { font-size: 28px; font-weight: 800; color: white; }
        .ep-stat-label { font-size: 12px; color: #64748B; font-weight: 500; margin-top: 4px; }
        .ep-stat-delta { margin-top: 10px; font-size: 11px; font-weight: 600; color: #10B981; }

        .ep-grid2 { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .ep-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 24px;
        }
        .ep-card-title { font-size: 15px; font-weight: 700; color: white; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
        .ep-card-title span { font-size: 12px; font-weight: 500; color: #0EA5E9; cursor: pointer; }

        /* Job table */
        .ep-job-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .ep-job-row:last-child { border-bottom: none; }
        .ep-job-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .ep-job-title { font-size: 14px; font-weight: 600; color: #E2E8F0; flex: 1; }
        .ep-job-meta { font-size: 12px; color: #64748B; }
        .ep-job-chip {
          font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;
        }
        .ep-job-chip.Active   { background: rgba(16,185,129,.15); color: #34D399; }
        .ep-job-chip.Closing  { background: rgba(245,158,11,.15);  color: #FCD34D; }
        .ep-job-chip.Closed   { background: rgba(100,116,139,.15); color: #94A3B8; }

        /* Candidates */
        .ep-cand-item {
          padding: 14px; border-radius: 12px; margin-bottom: 10px;
          background: rgba(14,165,233,.06); border: 1px solid rgba(14,165,233,.12);
        }
        .ep-cand-name  { font-size: 14px; font-weight: 600; color: white; }
        .ep-cand-meta  { font-size: 12px; color: #64748B; margin-top: 3px; display: flex; gap: 10px; }
        .ep-cand-match {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 700; margin-top: 8px;
          color: #FCD34D;
        }

        @media(max-width:900px){
          .ep-stats { grid-template-columns: repeat(2,1fr); }
          .ep-grid2  { grid-template-columns: 1fr; }
          .ep-sidebar{ display: none; }
        }
      `}</style>

      <div className="ep-shell">
        <aside className="ep-sidebar">
          <div className="ep-logo">
            <div className="ep-logo-icon">P</div>
            <div>
              <div className="ep-logo-text">PlacementHub</div>
              <div className="ep-logo-sub">Employer Portal</div>
            </div>
          </div>
          <nav className="ep-nav">
            {NAV.map((n) => (
              <div key={n.label} className={`ep-nav-item${n.active ? " active" : ""}`}>
                {n.icon}{n.label}
                {n.badge && <span className="ep-badge">{n.badge}</span>}
              </div>
            ))}
          </nav>
          <div style={{ padding: "0 0 12px" }}>
            <div className="ep-user">
              <div className="ep-avatar">{name[0]?.toUpperCase()}</div>
              <div>
                <div className="ep-user-name">{name}</div>
                <div className="ep-user-role">Employer</div>
              </div>
              <button className="ep-logout-btn" onClick={handleLogout} title="Logout"><IconLogOut /></button>
            </div>
          </div>
        </aside>

        <main className="ep-main">
          <div className="ep-topbar">
            <div className="ep-greeting">
              <h2>Employer Dashboard 🏢</h2>
              <p>Manage your job posts and find top talent.</p>
            </div>
            <button className="ep-post-btn"><IconPlus /> Post a Job</button>
          </div>

          <div className="ep-content">
            <div className="ep-stats">
              {STATS.map((s) => (
                <div className="ep-stat-card" key={s.label}>
                  <div className="ep-stat-dot" style={{ background: s.color }} />
                  <div className="ep-stat-value">{s.value}</div>
                  <div className="ep-stat-label">{s.label}</div>
                  <div className="ep-stat-delta">↑ {s.delta}</div>
                </div>
              ))}
            </div>

            <div className="ep-grid2">
              {/* Job posts */}
              <div className="ep-card">
                <div className="ep-card-title">Active Job Posts <span>Manage all →</span></div>
                {JOBS.map((j) => (
                  <div className="ep-job-row" key={j.title}>
                    <div className="ep-job-dot" style={{ background: j.color }} />
                    <div style={{ flex: 1 }}>
                      <div className="ep-job-title">{j.title}</div>
                      <div className="ep-job-meta">{j.applicants} applicants · Closes {j.deadline}</div>
                    </div>
                    <div className={`ep-job-chip ${j.status}`}>{j.status}</div>
                  </div>
                ))}
              </div>

              {/* Top candidates */}
              <div className="ep-card">
                <div className="ep-card-title">Top Candidates</div>
                {CANDIDATES.map((c) => (
                  <div className="ep-cand-item" key={c.name}>
                    <div className="ep-cand-name">{c.name}</div>
                    <div className="ep-cand-meta">
                      <span>{c.branch}</span>
                      <span>CGPA {c.cgpa}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}><IconMapPin />{c.location}</span>
                    </div>
                    <div className="ep-cand-match"><IconStar />{c.match}% match</div>
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