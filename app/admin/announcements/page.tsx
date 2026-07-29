import AdminLayout from "@/components/admin/AdminLayout";

export default function AnnouncementsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Announcements
          </h1>

          <p className="mt-2 text-slate-400">
            Publish announcements for students.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <input
            placeholder="Announcement title"
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
          />

          <textarea
            rows={6}
            placeholder="Write announcement..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
          />

          <button className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            Publish Announcement
          </button>

        </div>

      </div>
    </AdminLayout>
  );
}