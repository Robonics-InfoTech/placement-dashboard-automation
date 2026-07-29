import AdminLayout from "@/components/admin/AdminLayout";

export default function PlacementRulesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Placement Rules
          </h1>

          <p className="mt-2 text-slate-400">
            Configure placement eligibility criteria.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Minimum CGPA
              </label>

              <input
                type="number"
                defaultValue="6"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Maximum Active Backlogs
              </label>

              <input
                type="number"
                defaultValue="0"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Resume Required
              </label>

              <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white">
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                LinkedIn Required
              </label>

              <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white">
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

          </div>

          <button className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
            Save Rules
          </button>

        </div>

      </div>
    </AdminLayout>
  );
}