import AdminLayout from "@/components/admin/AdminLayout";
import { getPendingJobs } from "@/lib/admin/jobs";
import JobsTable from "@/components/admin/jobs/JobsTable";

export default async function JobsPage() {
  const jobs = await getPendingJobs();

  return (
    <AdminLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Job Management
          </h1>

          <p className="mt-2 text-slate-400">
            Review and approve job postings.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <h2 className="text-lg font-semibold text-white">
            Pending Jobs
          </h2>

          <p className="mt-2 text-slate-400">
            Total Pending: {jobs.length}
          </p>

<JobsTable jobs={jobs} />

        </div>

      </div>
    </AdminLayout>
  );
}