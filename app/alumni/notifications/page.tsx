"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/student/notifications";

export default function AlumniNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const data = await getNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayed = filter === "unread" ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title="Notifications"
        description="Stay updated with new alumni job postings and platform activity."
        actions={
          unreadCount > 0 ? (
            <button onClick={() => markAllAsRead(userId).then(load)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-primary)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          ) : undefined
        }
      />
      <div style={{ display: "flex", gap: 8, padding: "20px 28px 0" }}>
        {(["all", "unread"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid", background: filter === f ? "var(--accent-primary)" : "var(--bg-card)", borderColor: filter === f ? "var(--accent-primary)" : "var(--border-primary)", color: filter === f ? "#fff" : "var(--text-secondary)", transition: "all var(--transition-fast)" }}>
            {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>
      <div style={{ padding: "16px 28px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <Card><div style={{ height: 60, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} /></Card>
        ) : displayed.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <BellOff size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{filter === "unread" ? "You're all caught up!" : "Activity updates will appear here."}</p>
            </div>
          </Card>
        ) : (
          displayed.map(n => (
            <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", borderRadius: "var(--radius-lg)", border: "1px solid", background: n.is_read ? "var(--bg-card)" : "var(--accent-lighter)", borderColor: n.is_read ? "var(--border-primary)" : "var(--accent-primary)", transition: "all var(--transition-fast)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.is_read ? "var(--bg-tertiary)" : "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={16} style={{ color: n.is_read ? "var(--text-muted)" : "var(--accent-text)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: n.is_read ? 500 : 700, color: "var(--text-primary)", marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              {!n.is_read && (
                <button onClick={() => markAsRead(n.id).then(load)} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", border: "1px solid var(--accent-primary)", background: "transparent", color: "var(--accent-text)", cursor: "pointer", flexShrink: 0 }}>Mark read</button>
              )}
            </div>
          ))
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
