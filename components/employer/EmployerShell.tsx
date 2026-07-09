"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Props {
  companyName: string;
  approvalStatus: "pending" | "approved" | "rejected";
  children: React.ReactNode;
}

/* ── icons ─────────────────────────────────────────────────────────────── */
const IGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const ICalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IGift = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);
const ILogOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const NAV_ITEMS = [
  { href: "/employer/dashboard", label: "Dashboard",    icon: <IGrid />,      gated: false },
  { href: "/employer/profile",   label: "Company Profile", icon: <IUser />,   gated: false },
  { href: "/employer/jobs",      label: "Job Postings", icon: <IBriefcase />, gated: true  },
  { href: "/employer/drives",    label: "Drives",       icon: <ICalendar />,  gated: true  },
  { href: "/employer/jobs/offers", label: "Offers",     icon: <IGift />,      gated: true  },
];

export default function EmployerShell({ companyName, approvalStatus, children }: Props) {
  const pathname = usePathname();
  const isApproved = approvalStatus === "approved";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #060C18; color: #E2E8F0; }

        .es-shell { display: flex; min-height: 100vh; }

        .es-sidebar {
          width: 240px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
          background: rgba(14,165,233,.04);
          border-right: 1px solid rgba(14,165,233,.1);
          display: flex; flex-direction: column; padding: 0;
          overflow: hidden;
        }
        .es-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .es-logo-mark {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg,#0EA5E9,#6366F1);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: white;
        }
        .es-logo-text { font-size: 15px; font-weight: 700; color: white; line-height: 1.2; }
        .es-logo-sub  { font-size: 10px; color: #64748B; }

        .es-nav { padding: 16px 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }

        .es-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 9px; text-decoration: none;
          font-size: 13px; font-weight: 500; color: #94A3B8; transition: all .18s;
        }
        .es-nav-link:hover:not(.es-nav-link--disabled) {
          background: rgba(14,165,233,.08); color: #E2E8F0;
        }
        .es-nav-link--active {
          background: rgba(14,165,233,.14); color: #38BDF8;
          border: 1px solid rgba(14,165,233,.18);
        }
        .es-nav-link--disabled {
          opacity: .4; cursor: not-allowed; position: relative;
        }
        .es-nav-link--disabled:hover::after {
          content: "Requires approval";
          position: absolute; left: 110%; top: 50%; transform: translateY(-50%);
          background: #1E293B; border: 1px solid rgba(255,255,255,.1);
          color: #94A3B8; font-size: 11px; padding: 4px 10px; border-radius: 6px;
          white-space: nowrap; pointer-events: none; z-index: 50;
        }

        .es-status-pill {
          margin: 0 10px 10px;
          padding: 8px 12px; border-radius: 8px;
          font-size: 11px; font-weight: 600; text-align: center;
        }
        .es-status-pill.pending  { background: rgba(245,158,11,.12); color: #FCD34D; border: 1px solid rgba(245,158,11,.2); }
        .es-status-pill.approved { background: rgba(16,185,129,.1);  color: #34D399; border: 1px solid rgba(16,185,129,.2); }
        .es-status-pill.rejected { background: rgba(239,68,68,.1);   color: #FCA5A5; border: 1px solid rgba(239,68,68,.2); }

        .es-user {
          margin: 0 10px 16px; padding: 12px;
          border-radius: 10px; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; gap: 9px;
        }
        .es-avatar {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg,#0EA5E9,#6366F1);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: white;
        }
        .es-user-name { font-size: 12px; font-weight: 600; color: #E2E8F0; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .es-logout { margin-left: auto; background: none; border: none; cursor: pointer; color: #64748B; display: flex; padding: 3px; border-radius: 5px; transition: color .2s; }
        .es-logout:hover { color: #EF4444; }

        .es-main { flex: 1; display: flex; flex-direction: column; min-height: 100vh; overflow-x: hidden; }

        @media(max-width:900px){ .es-sidebar { display: none; } }
      `}</style>

      <div className="es-shell">
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="es-sidebar">
          <div className="es-logo">
            <div className="es-logo-mark">P</div>
            <div>
              <div className="es-logo-text">PlacementHub</div>
              <div className="es-logo-sub">Employer Portal</div>
            </div>
          </div>

          <nav className="es-nav">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href + "/") &&
                  // Don't highlight a parent if a sibling nav item is a more specific match
                  !NAV_ITEMS.some(
                    (other) =>
                      other.href !== item.href &&
                      other.href.startsWith(item.href) &&
                      (pathname === other.href || pathname.startsWith(other.href + "/"))
                  ));

              const isDisabled = item.gated && !isApproved;

              const cls = [
                "es-nav-link",
                isActive   ? "es-nav-link--active"   : "",
                isDisabled ? "es-nav-link--disabled"  : "",
              ].filter(Boolean).join(" ");

              return isDisabled ? (
                <span key={item.href} className={cls} title="Account pending approval">
                  {item.icon}{item.label}
                </span>
              ) : (
                <Link key={item.href} href={item.href} className={cls}>
                  {item.icon}{item.label}
                </Link>
              );
            })}
          </nav>

          {/* User card + logout */}
          <div className="es-user">
            <div className="es-avatar">{companyName[0]?.toUpperCase()}</div>
            <div>
              <div className="es-user-name">{companyName}</div>
              <div style={{ fontSize: "11px", color: "#64748B" }}>Employer</div>
            </div>
            <button className="es-logout" title="Logout" onClick={handleLogout}>
              <ILogOut />
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="es-main">
          {children}
        </main>
      </div>
    </>
  );
}
