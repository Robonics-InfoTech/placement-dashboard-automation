"use client";

interface Employer {
  company_name: string;
  industry: string;
  website: string;
  company_size: string;
  company_description: string | null;
  contact_person: string;
  designation: string;
  phone: string;
  verified: boolean;
}

interface Props {
  employer: Employer;
  onClose: () => void;
}

export default function EmployerDetailsModal({
  employer,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {employer.company_name}
          </h2>

          <button
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400">Industry</p>
            <p className="text-white">{employer.industry}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Company Size</p>
            <p className="text-white">{employer.company_size}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Contact Person</p>
            <p className="text-white">{employer.contact_person}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Designation</p>
            <p className="text-white">{employer.designation}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Phone</p>
            <p className="text-white">{employer.phone}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Status</p>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                employer.verified
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {employer.verified ? "Verified" : "Pending"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-400">Website</p>

          <a
            href={employer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {employer.website}
          </a>
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Company Description
          </p>

          <p className="mt-2 text-slate-300">
            {employer.company_description || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}