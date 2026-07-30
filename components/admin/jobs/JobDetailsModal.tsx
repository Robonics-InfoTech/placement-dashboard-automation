"use client";

interface Props {
  job: any;
  onClose: () => void;
}

export default function JobDetailsModal({
  job,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-900 p-6">

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {job.title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">

          <div>
            <p className="text-sm text-slate-400">Company</p>
            <p className="text-white">{job.company_name}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Location</p>
            <p className="text-white">{job.location}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Package</p>
            <p className="text-white">
              ₹{Number(job.salary_package).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Employment Type</p>
            <p className="text-white">{job.employment_type}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Minimum CGPA</p>
            <p className="text-white">{job.minimum_cgpa}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Maximum Backlogs</p>
            <p className="text-white">{job.maximum_backlogs}</p>
          </div>

        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Eligible Branches
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {job.eligible_branches?.map((branch: string) => (
              <span
                key={branch}
                className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400"
              >
                {branch}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Required Skills
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {job.required_skills?.map((skill: string) => (
              <span
                key={skill}
                className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Required Documents
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {job.required_documents?.map((doc: string) => (
              <span
                key={doc}
                className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-400"
              >
                {doc}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Description
          </p>

          <p className="mt-2 text-slate-300">
            {job.description}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Instructions
          </p>

          <p className="mt-2 text-slate-300">
            {job.application_instructions}
          </p>
        </div>

      </div>
    </div>
  );
}