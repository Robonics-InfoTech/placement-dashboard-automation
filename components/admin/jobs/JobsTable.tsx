"use client";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  status: string;
}

export default function JobsTable({
  jobs,
}: {
  jobs: Job[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full">

          <thead className="border-b border-slate-800">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Job Title
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Company
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Location
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Job Type
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {jobs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  No pending jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-slate-800"
                >

                  <td className="px-6 py-4 text-white">
                    {job.title}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {job.company_name}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {job.location}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {job.job_type}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                      Pending
                    </span>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>
      </div>
    </div>
  );
}