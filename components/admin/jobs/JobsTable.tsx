"use client";

import { useMemo, useState } from "react";
import ViewButton from "./ViewButton";
import ApproveButton from "./ApproveButton";
import RejectButton from "./RejectButton";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  employment_type: string;
  salary_package: number;
  application_deadline: string;
  status: string;

  description: string;
  minimum_cgpa: number;
  maximum_backlogs: number;
  eligible_branches: string[];
  required_skills: string[];
  required_documents: string[];
  application_instructions: string;
}

interface JobsTableProps {
  jobs: Job[];
}

export default function JobsTable({
  jobs,
}: JobsTableProps) {
  const [search, setSearch] = useState("");

  const filteredJobs = useMemo(() => {
    const term = search.toLowerCase();

    return jobs.filter((job) =>
      [
        job.title,
        job.company_name,
        job.location,
        job.job_type,
        job.employment_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [jobs, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
            Published
          </span>
        );

      case "pending":
        return (
          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
            Pending
          </span>
        );

      case "rejected":
        return (
          <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
            Rejected
          </span>
        );

      default:
        return (
          <span className="rounded-full bg-slate-500/20 px-3 py-1 text-xs font-medium text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

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
                Package
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Deadline
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  <div className="py-10">
                    <p className="text-lg font-medium text-slate-300">
                      No Jobs Found
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Try changing your search.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-slate-800 transition-colors hover:bg-slate-800/40"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {job.title}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {job.company_name}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {job.location}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    ₹{Number(job.salary_package).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {job.application_deadline}
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(job.status)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ViewButton job={job} />

                      {job.status === "pending" && (
                        <ApproveButton id={job.id} />
                      )}

                      {job.status !== "rejected" && (
                        <RejectButton id={job.id} />
                      )}
                    </div>
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