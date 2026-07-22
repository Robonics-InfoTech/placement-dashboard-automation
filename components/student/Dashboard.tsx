"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { getDashboardStats, getAvailableJobsCount } from "@/lib/student/dashboard";

import DashboardStats from "./DashboardStats";
import RecentApplications from "./RecentApplications";
import UpcomingDeadlines from "./UpcomingDeadlines";
import ProfileStrength from "./ProfileStrength";

import Link from "next/link";
import QuickActions from "./QuickActions";


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

/* ─── nav items ─────────────────────────────────────────────────────────── */
const NAV = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: <IconBriefcase />,
  },
  {
    label: "My Profile",
    href: "/student/profile",
    icon: <IconUser />,
  },
  {
    label: "Job Board",
    href: "/student/jobs",
    icon: <IconBookOpen />,
  },
  {
    label: "Documents",
    href: "/student/documents",
    icon: <IconBookOpen />,
  },
  {
    label: "Applications",
    href: "/student/applications",
    icon: <IconBriefcase />,
  },
  {
    label: "Offers",
    href: "/student/offers",
    icon: <IconBriefcase />,
  },
  {
    label: "Notifications",
    href: "/student/notifications",
    icon: <IconBell />,
    badge: 3,
  },
];

export default function StudentDashboard() {
  const [user, setUser] = useState<{ email: string; metadata: Record<string, string> } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<{
    applied: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  } | null>(null);
  const [availableJobs, setAvailableJobs] = useState(0);
  const [profileStrength, setProfileStrength] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? "",
          metadata: (data.user.user_metadata ?? {}) as Record<string, string>,
        });

        // Fetch dashboard data once we have the user
        supabase
          .from("student_profiles")
          .select("id, full_name, phone, branch, cgpa, graduation_year, resume_url, linkedin_url, github_url, portfolio_url")
          .eq("user_id", data.user.id)
          .single()
          .then(async ({ data: profile }) => {
            // Fetch stats using student profile id
            if (profile?.id) {
              getDashboardStats(profile.id).then(setDashboardStats).catch(console.error);
            }

            // Compute profile strength (same logic as ProfileStrength component)
            const { data: skills } = await supabase
              .from("student_skills")
              .select("id")
              .eq("student_id", profile?.id);

            const checks = [
              !!profile?.full_name,
              !!profile?.phone,
              !!profile?.branch,
              profile?.cgpa != null,
              profile?.graduation_year != null,
              !!profile?.resume_url,
              !!profile?.linkedin_url,
              !!profile?.github_url,
              !!profile?.portfolio_url,
              (skills?.length ?? 0) > 0,
            ];
            setProfileStrength(checks.filter(Boolean).length * 10);
          });

        // Fetch available jobs count
        getAvailableJobsCount().then(setAvailableJobs).catch(console.error);
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
  <Link
    key={n.label}
    href={n.href}
    className="sd-nav-item"
  >
    {n.icon}
    {n.label}

    {n.badge && (
      <span className="sd-badge">
        {n.badge}
      </span>
    )}
  </Link>
))}          </nav>

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

<DashboardStats
  stats={dashboardStats}
  availableJobs={availableJobs}
  profileStrength={profileStrength}
/>

  <QuickActions />

  <div className="sd-grid2">

    <RecentApplications />

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <UpcomingDeadlines />

      <ProfileStrength />
    </div>

  </div>

</div>
        </main>
      </div>
    </>
  );
}