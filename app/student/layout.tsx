"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const IconGift = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconLogOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ─── Nav config ──────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Dashboard",    href: "/student/dashboard",      icon: <IconGrid /> },
  { label: "My Profile",   href: "/student/profile",        icon: <IconUser /> },
  { label: "Documents",    href: "/student/documents",      icon: <IconFileText /> },
  { label: "Browse Jobs",  href: "/student/jobs",           icon: <IconBriefcase /> },
  { label: "Applications", href: "/student/applications",   icon: <IconClipboard /> },
  { label: "Offers",       href: "/student/offers",         icon: <IconGift /> },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<Array<{ id: string; title: string; message: string; is_read: boolean; created_at: string; notification_type: string }>>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? "",
          name: data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0] ?? "Student",
        });
        fetchNotifications(data.user.id);

        // Realtime subscription for new notifications
        const channel = supabase
          .channel("notifications")
          .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${data.user.id}`,
          }, () => {
            fetchNotifications(data.user.id);
          })
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      }
    });
  }, []);

  const fetchNotifications = async (userId: string) => {
    // Get from public.users first to resolve the public user id
    const { data: publicUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!publicUser) return;

    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at, notification_type")
      .eq("user_id", publicUser.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setRecentNotifs(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const markAsRead = async (notifId: string) => {
    await supabase.from("notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", notifId);
    setRecentNotifs((prev) => prev.map((n) => n.id === notifId ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const name = user?.name ?? "Student";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'Inter', sans-serif; background: #070D1B; color: #E2E8F0; height: 100%; }

        /* ── Shell ── */
        .sl-shell { display: flex; min-height: 100vh; }

        /* ── Sidebar ── */
        .sl-sidebar {
          width: 240px; flex-shrink: 0;
          background: linear-gradient(180deg, rgba(99,102,241,.06) 0%, rgba(139,92,246,.03) 100%);
          border-right: 1px solid rgba(99,102,241,.12);
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh; z-index: 40;
          transition: transform .3s cubic-bezier(.4,0,.2,1);
        }
        /* mobile-closed only applies on mobile — see @media below */

        .sl-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 24px 20px 22px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .sl-logo-icon {
          width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg,#6366F1,#8B5CF6);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; font-weight: 800; color: white;
          box-shadow: 0 4px 14px rgba(99,102,241,.4);
        }
        .sl-logo-text { font-size: 15px; font-weight: 700; color: white; letter-spacing: -.3px; }
        .sl-logo-sub  { font-size: 10px; color: #64748B; font-weight: 500; margin-top: 1px; }

        .sl-nav { padding: 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }

        .sl-nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 13.5px; font-weight: 500; color: #64748B;
          cursor: pointer; transition: all .18s ease; text-decoration: none;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .sl-nav-item:hover { background: rgba(255,255,255,.05); color: #CBD5E1; }
        .sl-nav-item.active {
          background: rgba(99,102,241,.14); color: #A5B4FC;
          border-color: rgba(99,102,241,.2);
        }
        .sl-nav-icon { opacity: .7; flex-shrink: 0; }
        .sl-nav-item.active .sl-nav-icon { opacity: 1; }

        /* ── Nav badge ── */
        .sl-nav-badge {
          margin-left: auto; background: #6366F1; color: white;
          font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px;
          min-width: 18px; text-align: center;
        }

        /* ── User tile ── */
        .sl-user {
          margin: 0 12px 16px; padding: 12px; border-radius: 12px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .sl-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg,#6366F1,#8B5CF6);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: white;
        }
        .sl-user-name { font-size: 12.5px; font-weight: 600; color: #E2E8F0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px; }
        .sl-user-role { font-size: 10.5px; color: #64748B; }
        .sl-logout-btn { margin-left: auto; background: transparent; border: none; cursor: pointer; color: #64748B; display: flex; transition: color .2s; padding: 4px; flex-shrink: 0; }
        .sl-logout-btn:hover { color: #F87171; }

        /* ── Main ── */
        .sl-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

        /* ── Topbar ── */
        .sl-topbar {
          height: 60px; flex-shrink: 0;
          padding: 0 24px; display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,.06);
          background: rgba(7,13,27,.8);
          backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 30;
        }
        .sl-hamburger {
          display: none; background: transparent; border: none; cursor: pointer;
          color: #94A3B8; padding: 6px; border-radius: 8px; transition: all .2s;
        }
        .sl-hamburger:hover { background: rgba(255,255,255,.06); color: #E2E8F0; }

        .sl-topbar-title { font-size: 15px; font-weight: 600; color: #E2E8F0; flex: 1; }

        /* ── Notification bell ── */
        .sl-bell-wrap { position: relative; }
        .sl-bell-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 10px; border: none; cursor: pointer;
          background: rgba(255,255,255,.05); color: #94A3B8;
          transition: all .2s; position: relative;
        }
        .sl-bell-btn:hover { background: rgba(99,102,241,.15); color: #A5B4FC; }
        .sl-bell-badge {
          position: absolute; top: -4px; right: -4px;
          background: #EF4444; color: white;
          font-size: 9px; font-weight: 700; min-width: 16px; height: 16px;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          padding: 0 3px; border: 2px solid #070D1B;
          animation: sl-pulse .6s ease-out;
        }
        @keyframes sl-pulse { 0% { transform: scale(1.4); } 100% { transform: scale(1); } }

        /* ── Notif dropdown ── */
        .sl-notif-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 340px; border-radius: 14px;
          background: #0E1629; border: 1px solid rgba(99,102,241,.18);
          box-shadow: 0 20px 60px rgba(0,0,0,.5);
          z-index: 100; overflow: hidden;
          animation: sl-dropdown-in .18s ease;
        }
        @keyframes sl-dropdown-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .sl-nd-header {
          padding: 14px 16px 10px; border-bottom: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sl-nd-title { font-size: 13px; font-weight: 700; color: #E2E8F0; }
        .sl-nd-see-all { font-size: 11px; color: #818CF8; cursor: pointer; font-weight: 600; }
        .sl-nd-see-all:hover { color: #A5B4FC; }
        .sl-nd-item {
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.04);
          cursor: pointer; transition: background .15s;
          display: flex; gap: 10px;
        }
        .sl-nd-item:hover { background: rgba(255,255,255,.04); }
        .sl-nd-item.unread { background: rgba(99,102,241,.06); }
        .sl-nd-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #6366F1;
          flex-shrink: 0; margin-top: 5px;
        }
        .sl-nd-item.read .sl-nd-dot { opacity: 0; }
        .sl-nd-content { flex: 1; min-width: 0; }
        .sl-nd-ntitle { font-size: 12.5px; font-weight: 600; color: #E2E8F0; margin-bottom: 2px; }
        .sl-nd-msg { font-size: 11.5px; color: #64748B; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sl-nd-time { font-size: 10.5px; color: #475569; margin-top: 3px; }
        .sl-nd-empty { padding: 28px; text-align: center; color: #475569; font-size: 13px; }
        .sl-nd-footer { padding: 10px 16px; border-top: 1px solid rgba(255,255,255,.06); }
        .sl-nd-view-all {
          width: 100%; padding: 8px; border-radius: 8px; border: none; cursor: pointer;
          background: rgba(99,102,241,.1); color: #818CF8;
          font-size: 12px; font-weight: 600; transition: background .2s;
        }
        .sl-nd-view-all:hover { background: rgba(99,102,241,.18); }

        /* ── Page content ── */
        .sl-content { flex: 1; overflow-y: auto; }

        /* ── Mobile overlay ── */
        .sl-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,.6); z-index: 35;
          backdrop-filter: blur(2px);
        }
        .sl-overlay.open { display: block; }

        @media (min-width: 901px) {
          /* Always show sidebar on desktop regardless of open state */
          .sl-sidebar { transform: none !important; }
        }
        @media (max-width: 900px) {
          .sl-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            z-index: 40;
          }
          .sl-sidebar.mobile-closed { transform: translateX(-100%); }
          .sl-hamburger { display: flex; }
        }
      `}</style>

      <div className="sl-shell">
        {/* Mobile overlay */}
        <div className={`sl-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ── Sidebar ── */}
        <aside className={`sl-sidebar${sidebarOpen ? "" : " mobile-closed"}`} suppressHydrationWarning>
          <div className="sl-logo">
            <div className="sl-logo-icon">P</div>
            <div>
              <div className="sl-logo-text">PlacementHub</div>
              <div className="sl-logo-sub">Student Portal</div>
            </div>
          </div>

          <nav className="sl-nav">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`sl-nav-item${active ? " active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sl-nav-icon">{item.icon}</span>
                  {item.label}
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <span className="sl-nav-badge">{unreadCount}</span>
                  )}
                </a>
              );
            })}
          </nav>

          <div className="sl-user">
            <div className="sl-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sl-user-name">{name}</div>
              <div className="sl-user-role">Student</div>
            </div>
            <button className="sl-logout-btn" onClick={handleLogout} title="Logout">
              <IconLogOut />
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="sl-main">
          {/* Topbar */}
          <header className="sl-topbar">
            <button className="sl-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <IconX /> : <IconMenu />}
            </button>

            <div className="sl-topbar-title">
              {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "Student Portal"}
            </div>

            {/* Notification Bell */}
            <div className="sl-bell-wrap" ref={notifRef}>
              <button
                className="sl-bell-btn"
                onClick={() => setNotifOpen((o) => !o)}
                title="Notifications"
              >
                <IconBell />
                {unreadCount > 0 && (
                  <span className="sl-bell-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="sl-notif-dropdown">
                  <div className="sl-nd-header">
                    <span className="sl-nd-title">Notifications</span>
                    <span
                      className="sl-nd-see-all"
                      onClick={() => { setNotifOpen(false); router.push("/student/notifications"); }}
                    >
                      View all →
                    </span>
                  </div>

                  {recentNotifs.length === 0 ? (
                    <div className="sl-nd-empty">No notifications yet</div>
                  ) : (
                    recentNotifs.map((n) => (
                      <div
                        key={n.id}
                        className={`sl-nd-item ${n.is_read ? "read" : "unread"}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="sl-nd-dot" />
                        <div className="sl-nd-content">
                          <div className="sl-nd-ntitle">{n.title}</div>
                          <div className="sl-nd-msg">{n.message}</div>
                          <div className="sl-nd-time">{timeAgo(n.created_at)}</div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="sl-nd-footer">
                    <button
                      className="sl-nd-view-all"
                      onClick={() => { setNotifOpen(false); router.push("/student/notifications"); }}
                    >
                      Open Notification Centre
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Page content */}
          <div className="sl-content">{children}</div>
        </div>
      </div>
    </>
  );
}
