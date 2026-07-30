import AdminLayout from "@/components/admin/AdminLayout";
import JobsTable from "@/components/admin/jobs/JobsTable";
import { getJobs } from "@/lib/admin/jobs";

export default async function JobsPage() {
  const jobs = await getJobs();

  const totalJobs = jobs.length;
  const publishedJobs = jobs.filter(
    (job) => job.status === "published"
  ).length;
  const pendingJobs = jobs.filter(
    (job) => job.status === "pending"
  ).length;
  const rejectedJobs = jobs.filter(
    (job) => job.status === "rejected"
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Jobs</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-400">
              {totalJobs}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Published</p>
            <h2 className="mt-2 text-3xl font-bold text-green-400">
              {publishedJobs}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Pending</p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-400">
              {pendingJobs}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Rejected</p>
            <h2 className="mt-2 text-3xl font-bold text-red-400">
              {rejectedJobs}
            </h2>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">
            Job Management
          </h1>

          <p className="mt-2 text-slate-400">
            Manage all job postings from employers.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Jobs
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Showing all job postings
              </p>
            </div>

            <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-400">
              Total: {totalJobs}
            </span>
          </div>

          <JobsTable jobs={jobs} />
        </div>
      </div>
    </AdminLayout>
  );
}