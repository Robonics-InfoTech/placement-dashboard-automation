import NotificationsPage from "@/components/student/NotificationsPage";

export default function StudentNotificationsPage() {
  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <div className="mx-auto max-w-7xl p-8">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Notifications
          </h1>

          <p className="mt-2 text-slate-400">
            Stay updated with your placement activities.
          </p>
        </div>

        <NotificationsPage />

      </div>
    </main>
  );
}