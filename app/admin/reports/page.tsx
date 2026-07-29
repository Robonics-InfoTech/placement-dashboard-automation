import AdminLayout from "@/components/admin/AdminLayout";

export default function ReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Reports
          </h1>

          <p className="mt-2 text-slate-400">
            Generate and export placement reports.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold text-white">
              Students Report
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Download student placement data.
            </p>

            <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold text-white">
              Employers Report
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Download employer registrations.
            </p>

            <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold text-white">
              Jobs Report
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Download all job postings.
            </p>

            <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold text-white">
              Offers Report
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Download placement offers.
            </p>

            <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Export CSV
            </button>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}