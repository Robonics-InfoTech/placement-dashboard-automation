"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── tiny icon SVGs ─────────────────────────────────────────────────────── */
const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBookOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 0 3-3h7z"/>
  </svg>
);
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconLogOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconTrendUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

/* ─── nav items ─────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Dashboard", icon: <IconBriefcase />, active: true },
  { label: "My Profile",  icon: <IconUser /> },
  { label: "Job Board",   icon: <IconBookOpen /> },
  { label: "Notifications", icon: <IconBell />, badge: 3 },
];

/* ─── mock stats ────────────────────────────────────────────────────────── */
const STATS = [
  { label: "Applications Sent",  value: "12", delta: "+3 this week",  color: "#6366F1" },
  { label: "Interviews Pending", value: "4",  delta: "+1 today",      color: "#8B5CF6" },
  { label: "Offers Received",    value: "1",  delta: "🎉 Congrats!",  color: "#06B6D4" },
  { label: "Profile Strength",   value: "78%", delta: "+5% this week", color: "#10B981" },
];

/* ─── mock activity ─────────────────────────────────────────────────────── */
const ACTIVITY = [
  { company: "Infosys Ltd.",      role: "SDE Intern",       status: "Interview", time: "2h ago",     color: "#6366F1" },
  { company: "TCS Digital",       role: "Graduate Trainee", status: "Applied",   time: "Yesterday",  color: "#8B5CF6" },
  { company: "Wipro NextGen",     role: "Tech Associate",   status: "Shortlisted",time: "2 days ago", color: "#10B981" },
  { company: "HCL Technologies",  role: "Junior Dev",       status: "Applied",   time: "3 days ago", color: "#F59E0B" },
];

/* ─── mock upcoming ─────────────────────────────────────────────────────── */
const UPCOMING = [
  { company: "Infosys Ltd.", date: "Jul 5, 2026", time: "10:00 AM", type: "Technical Round" },
  { company: "Google STEP",  date: "Jul 8, 2026", time: "2:00 PM",  type: "HR Interview" },
];

export default function StudentDashboard() {
  const [user, setUser] = useState<{ email: string; metadata: Record<string, string> } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? "",
          metadata: (data.user.user_metadata ?? {}) as Record<string, string>,
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const name = user?.metadata?.full_name ?? user?.email?.split("@")[0] ?? "Student";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #070D1B; color: #E2E8F0; }

        .sd-shell { display: flex; min-height: 100vh; }

        /* ── Sidebar ── */
        .sd-sidebar {
          width: 240px; flex-shrink: 0;
          background: rgba(255,255,255,.04);
          border-right: 1px solid rgba(255,255,255,.07);
          display: flex; flex-direction: column;
          padding: 28px 0; transition: width .3s;
          position: sticky; top: 0; height: 100vh;
        }
        .sd-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 0 24px 28px;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .sd-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg,#6366F1,#8B5CF6);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: white;
        }
        .sd-logo-text { font-size: 16px; font-weight: 700; color: white; }
        .sd-logo-sub { font-size: 10px; color: #64748B; font-weight: 500; }

        .sd-nav { padding: 20px 12px; flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .sd-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 14px; font-weight: 500; color: #94A3B8;
          cursor: pointer; transition: all .2s; text-decoration: none;
          position: relative;
        }
        .sd-nav-item:hover { background: rgba(255,255,255,.06); color: #E2E8F0; }
        .sd-nav-item.active {
          background: rgba(99,102,241,.15); color: #818CF8;
          border: 1px solid rgba(99,102,241,.2);
        }
        .sd-badge {
          margin-left: auto; background: #6366F1; color: white;
          font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px;
        }

        .sd-user {
          margin: 0 12px; padding: 14px; border-radius: 12px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .sd-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#6366F1,#8B5CF6);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .sd-user-name { font-size: 13px; font-weight: 600; color: #E2E8F0; }
        .sd-user-role { font-size: 11px; color: #64748B; }
        .sd-logout-btn {
          margin-left: auto; background: transparent; border: none; cursor: pointer;
          color: #64748B; display: flex; transition: color .2s; padding: 4px;
        }
        .sd-logout-btn:hover { color: #EF4444; }

        /* ── Main ── */
        .sd-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        .sd-topbar {
          padding: 20px 32px; display: flex; align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.02);
        }
        .sd-greeting h2 { font-size: 20px; font-weight: 700; color: white; }
        .sd-greeting p { font-size: 13px; color: #64748B; margin-top: 2px; }
        .sd-topbar-actions { display: flex; gap: 10px; }
        .sd-pill-btn {
          padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: none; transition: all .2s;
        }
        .sd-pill-btn.primary {
          background: linear-gradient(135deg,#6366F1,#8B5CF6); color: white;
        }
        .sd-pill-btn.primary:hover { opacity: .88; transform: translateY(-1px); }

        .sd-content { padding: 28px 32px; overflow-y: auto; flex: 1; }

        /* Stats */
        .sd-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
        .sd-stat-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 20px; transition: transform .2s;
        }
        .sd-stat-card:hover { transform: translateY(-3px); }
        .sd-stat-dot { width: 8px; height: 8px; border-radius: 50%; margin-bottom: 12px; }
        .sd-stat-value { font-size: 28px; font-weight: 800; color: white; }
        .sd-stat-label { font-size: 12px; color: #64748B; font-weight: 500; margin-top: 4px; }
        .sd-stat-delta {
          margin-top: 10px; font-size: 11px; font-weight: 600; color: #10B981;
          display: flex; align-items: center; gap: 4px;
        }

        /* Bottom grid */
        .sd-grid2 { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }

        .sd-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 24px;
        }
        .sd-card-title {
          font-size: 15px; font-weight: 700; color: white; margin-bottom: 18px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sd-card-title span { font-size: 12px; font-weight: 500; color: #6366F1; cursor: pointer; }

        /* Activity */
        .sd-activity-item {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .sd-activity-item:last-child { border-bottom: none; }
        .sd-co-logo {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: white; flex-shrink: 0;
        }
        .sd-activity-info { flex: 1; }
        .sd-activity-company { font-size: 14px; font-weight: 600; color: #E2E8F0; }
        .sd-activity-role { font-size: 12px; color: #64748B; margin-top: 2px; }
        .sd-status-chip {
          font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;
        }
        .sd-status-chip.interview { background: rgba(99,102,241,.15); color: #818CF8; }
        .sd-status-chip.applied    { background: rgba(100,116,139,.15); color: #94A3B8; }
        .sd-status-chip.shortlisted{ background: rgba(16,185,129,.15);  color: #34D399; }
        .sd-activity-time { font-size: 11px; color: #475569; margin-top: 2px; text-align: right; }

        /* Upcoming */
        .sd-upcoming-item {
          padding: 14px; border-radius: 12px;
          background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.15);
          margin-bottom: 10px;
        }
        .sd-upcoming-company { font-size: 14px; font-weight: 600; color: white; }
        .sd-upcoming-type { font-size: 12px; color: #818CF8; margin-top: 2px; }
        .sd-upcoming-time {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #64748B; margin-top: 8px;
        }

        /* Profile strength bar */
        .sd-profile-bar-wrap {
          background: rgba(255,255,255,.06); border-radius: 20px;
          height: 6px; margin-top: 8px; overflow: hidden;
        }
        .sd-profile-bar { height: 100%; border-radius: 20px; background: linear-gradient(90deg,#6366F1,#06B6D4); }

        @media(max-width:900px){
          .sd-stats { grid-template-columns: repeat(2,1fr); }
          .sd-grid2  { grid-template-columns: 1fr; }
          .sd-sidebar{ display: none; }
        }
      `}</style>

      <div className="sd-shell">
        {/* ── Sidebar ── */}
        <aside className="sd-sidebar">
          <div className="sd-logo">
            <div className="sd-logo-icon">P</div>
            <div>
              <div className="sd-logo-text">PlacementHub</div>
              <div className="sd-logo-sub">Student Portal</div>
            </div>
          </div>

          <nav className="sd-nav">
            {NAV.map((n) => (
              <div key={n.label} className={`sd-nav-item${n.active ? " active" : ""}`}>
                {n.icon}
                {n.label}
                {n.badge && <span className="sd-badge">{n.badge}</span>}
              </div>
            ))}
          </nav>

          <div style={{ padding: "0 0 12px" }}>
            <div className="sd-user">
              <div className="sd-avatar">{name[0]?.toUpperCase()}</div>
              <div>
                <div className="sd-user-name">{name}</div>
                <div className="sd-user-role">Student</div>
              </div>
              <button className="sd-logout-btn" onClick={handleLogout} title="Logout">
                <IconLogOut />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="sd-main">
          {/* Topbar */}
          <div className="sd-topbar">
            <div className="sd-greeting">
              <h2>Welcome back, {name.split(" ")[0]} 👋</h2>
              <p>Here's what's happening with your placements today.</p>
            </div>
            <div className="sd-topbar-actions">
              <button className="sd-pill-btn primary">Browse Jobs</button>
            </div>
          </div>

          {/* Content */}
          <div className="sd-content">
            {/* Stats */}
            <div className="sd-stats">
              {STATS.map((s) => (
                <div className="sd-stat-card" key={s.label}>
                  <div className="sd-stat-dot" style={{ background: s.color }} />
                  <div className="sd-stat-value">{s.value}</div>
                  <div className="sd-stat-label">{s.label}</div>
                  <div className="sd-stat-delta"><IconTrendUp />{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Bottom grid */}
            <div className="sd-grid2">
              {/* Recent Applications */}
              <div className="sd-card">
                <div className="sd-card-title">
                  Recent Applications
                  <span>View all →</span>
                </div>
                {ACTIVITY.map((a) => (
                  <div className="sd-activity-item" key={a.company}>
                    <div className="sd-co-logo" style={{ background: a.color }}>
                      {a.company[0]}
                    </div>
                    <div className="sd-activity-info">
                      <div className="sd-activity-company">{a.company}</div>
                      <div className="sd-activity-role">{a.role}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className={`sd-status-chip ${a.status.toLowerCase()}`}>{a.status}</div>
                      <div className="sd-activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Upcoming Interviews */}
                <div className="sd-card">
                  <div className="sd-card-title">Upcoming Interviews</div>
                  {UPCOMING.map((u) => (
                    <div className="sd-upcoming-item" key={u.company}>
                      <div className="sd-upcoming-company">{u.company}</div>
                      <div className="sd-upcoming-type">{u.type}</div>
                      <div className="sd-upcoming-time">
                        <IconClock />{u.date} · {u.time}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Profile Strength */}
                <div className="sd-card">
                  <div className="sd-card-title">Profile Strength</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "white" }}>78%</div>
                  <div className="sd-profile-bar-wrap">
                    <div className="sd-profile-bar" style={{ width: "78%" }} />
                  </div>
                  <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {["Resume uploaded", "LinkedIn linked", "Add 2 more skills"].map((item, i) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: i < 2 ? "#10B981" : "#F59E0B" }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: i < 2 ? "rgba(16,185,129,.15)" : "rgba(245,158,11,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {i < 2 ? <IconCheck /> : "!"}
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}