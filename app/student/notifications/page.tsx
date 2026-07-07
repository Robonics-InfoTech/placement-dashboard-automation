"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Notification = {
  id: string;
  title: string;
  message: string;
  notification_type: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

/* ─── Notification type config ─────────────────────────────────────────── */
const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  status_change: { icon: "🔄", color: "#818CF8", bg: "rgba(99,102,241,.1)" },
  new_job:       { icon: "💼", color: "#34D399", bg: "rgba(16,185,129,.1)" },
  interview:     { icon: "📅", color: "#FCD34D", bg: "rgba(245,158,11,.1)" },
  offer:         { icon: "🎉", color: "#C084FC", bg: "rgba(139,92,246,.1)" },
  announcement:  { icon: "📢", color: "#60A5FA", bg: "rgba(59,130,246,.1)" },
  default:       { icon: "🔔", color: "#94A3B8", bg: "rgba(100,116,139,.1)" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [publicUserId, setPublicUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use auth user id directly (public.users.id mirrors auth.users.id)
      setPublicUserId(user.id);

      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, notification_type, is_read, read_at, created_at")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (data) setNotifs(data);

      // Realtime subscription
      const channel = supabase
        .channel("notifications-page")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifs((prev) => [payload.new as Notification, ...prev]);
        })
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifs((prev) => prev.map((n) => n.id === payload.new.id ? { ...n, ...(payload.new as Notification) } : n));
        })
        .subscribe();

      setLoading(false);
      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, []);

  const markRead = async (id: string) => {
    const notif = notifs.find((n) => n.id === id);
    if (!notif || notif.is_read) return;

    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);

    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!publicUserId) return;
    setMarkingAll(true);
    const unreadIds = notifs.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in("id", unreadIds);
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
    setMarkingAll(false);
  };

  const isArchived = (n: Notification) => Date.now() - new Date(n.created_at).getTime() > THIRTY_DAYS;

  const displayed = notifs.filter((n) => showArchived ? isArchived(n) : !isArchived(n));
  const unreadCount = notifs.filter((n) => !n.is_read && !isArchived(n)).length;
  const archivedCount = notifs.filter(isArchived).length;

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
        .notif-wrap { padding: 28px 32px; max-width: 760px; margin: 0 auto; }

        .notif-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .notif-mark-all {
          padding: 7px 16px; border-radius: 8px; border: 1px solid rgba(99,102,241,.2);
          background: rgba(99,102,241,.08); color: #818CF8; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .18s;
        }
        .notif-mark-all:hover:not(:disabled) { background: rgba(99,102,241,.15); }
        .notif-mark-all:disabled { opacity: .5; cursor: not-allowed; }

        /* ── Toggle tabs ── */
        .notif-toggle { display: flex; gap: 4px; background: rgba(255,255,255,.04); padding: 4px; border-radius: 10px; border: 1px solid rgba(255,255,255,.07); margin-bottom: 20px; }
        .notif-toggle-btn {
          flex: 1; padding: 7px 14px; border-radius: 7px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 600; transition: all .15s; text-align: center;
          color: #64748B; background: transparent;
        }
        .notif-toggle-btn.active { background: rgba(99,102,241,.15); color: #A5B4FC; }

        /* ── Notification item ── */
        .notif-item {
          display: flex; gap: 14px; padding: 16px; border-radius: 14px; margin-bottom: 8px;
          border: 1px solid rgba(255,255,255,.06); cursor: pointer;
          transition: all .15s; position: relative;
        }
        .notif-item:hover { background: rgba(255,255,255,.03); border-color: rgba(255,255,255,.1); }
        .notif-item.unread { background: rgba(99,102,241,.05); border-color: rgba(99,102,241,.12); }
        .notif-item.unread::before {
          content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 60%; border-radius: 2px; background: #6366F1;
        }
        .notif-icon {
          width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .notif-body { flex: 1; min-width: 0; }
        .notif-title { font-size: 14px; font-weight: 700; color: white; margin-bottom: 3px; }
        .notif-item:not(.unread) .notif-title { color: #94A3B8; font-weight: 600; }
        .notif-msg { font-size: 12.5px; color: #64748B; line-height: 1.5; }
        .notif-time { font-size: 11px; color: #475569; margin-top: 5px; }
        .notif-unread-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #6366F1;
          flex-shrink: 0; margin-top: 6px;
        }

        /* ── Empty state ── */
        .notif-empty { text-align: center; padding: 60px 0; color: #475569; }

        /* ── Date group ── */
        .notif-date-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .8px; margin: 16px 0 8px; }

        @media (max-width: 600px) { .notif-wrap { padding: 16px; } }
      `}</style>

      <div className="notif-wrap">
        <div className="notif-header">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "white" }}>Notifications</h1>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
              {unreadCount > 0 ? <><strong style={{ color: "#A5B4FC" }}>{unreadCount}</strong> unread</> : "All caught up!"}
              {archivedCount > 0 && <span style={{ marginLeft: 10, color: "#475569" }}>· {archivedCount} archived</span>}
            </p>
          </div>
          {!showArchived && unreadCount > 0 && (
            <button className="notif-mark-all" onClick={markAllRead} disabled={markingAll}>
              {markingAll ? "Marking…" : "✓ Mark all as read"}
            </button>
          )}
        </div>

        {/* Tab toggle */}
        <div className="notif-toggle">
          <button className={`notif-toggle-btn${!showArchived ? " active" : ""}`} onClick={() => setShowArchived(false)}>
            Recent {unreadCount > 0 && <span style={{ background: "#6366F1", color: "white", borderRadius: 20, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{unreadCount}</span>}
          </button>
          <button className={`notif-toggle-btn${showArchived ? " active" : ""}`} onClick={() => setShowArchived(true)}>
            Archived {archivedCount > 0 && <span style={{ background: "rgba(255,255,255,.1)", color: "#94A3B8", borderRadius: 20, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{archivedCount}</span>}
          </button>
        </div>

        {displayed.length === 0 ? (
          <div className="notif-empty">
            <div style={{ fontSize: 48, marginBottom: 14 }}>🔔</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>
              {showArchived ? "No archived notifications" : "No notifications yet"}
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {showArchived ? "Notifications older than 30 days appear here." : "You'll be notified about applications, interviews, and offers."}
            </div>
          </div>
        ) : (
          (() => {
            // Group by day
            const groups: Record<string, Notification[]> = {};
            displayed.forEach((n) => {
              const day = new Date(n.created_at).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
              if (!groups[day]) groups[day] = [];
              groups[day].push(n);
            });
            return Object.entries(groups).map(([day, items]) => (
              <div key={day}>
                <div className="notif-date-label">{day}</div>
                {items.map((n) => {
                  const cfg = TYPE_CONFIG[n.notification_type ?? "default"] ?? TYPE_CONFIG.default;
                  return (
                    <div
                      key={n.id}
                      className={`notif-item${n.is_read ? "" : " unread"}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className="notif-icon" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.icon}
                      </div>
                      <div className="notif-body">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-msg">{n.message}</div>
                        <div className="notif-time">{timeAgo(n.created_at)}</div>
                      </div>
                      {!n.is_read && <div className="notif-unread-dot" />}
                    </div>
                  );
                })}
              </div>
            ));
          })()
        )}
      </div>
    </>
  );
}
