"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/lib/student/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const data = await getNotifications(user.id);

    setNotifications(data);
  }

  async function handleRead(id: string) {
    await markAsRead(id);
    loadNotifications();
  }

  async function handleReadAll() {
    await markAllAsRead(userId);
    loadNotifications();
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8">

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-semibold">
          Recent Notifications
        </h2>

        <button
          onClick={handleReadAll}
          className="rounded-lg bg-indigo-600 px-5 py-2"
        >
          Mark All Read
        </button>

      </div>

      <div className="space-y-4">

        {notifications.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
            No notifications available.
          </div>
        )}

        {notifications.map((notification) => (

          <div
            key={notification.id}
            className={`rounded-xl border p-5 ${
              notification.is_read
                ? "border-slate-700 bg-slate-800/50"
                : "border-indigo-500 bg-indigo-500/10"
            }`}
          >
            <div className="flex items-start justify-between">

              <div>

                <h3 className="text-lg font-semibold">
                  {notification.title}
                </h3>

                <p className="mt-2 text-slate-400">
                  {notification.message}
                </p>

                <p className="mt-3 text-sm text-slate-500">
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </p>

              </div>

              {!notification.is_read && (
                <button
                  onClick={() =>
                    handleRead(notification.id)
                  }
                  className="rounded-lg bg-green-600 px-4 py-2"
                >
                  Mark Read
                </button>
              )}

            </div>
          </div>

        ))}

      </div>

    </div>
  );
}