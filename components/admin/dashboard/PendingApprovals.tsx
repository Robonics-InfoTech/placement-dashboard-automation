import { PendingEmployerApproval } from "@/lib/admin/dashboard";
import { Building2, Clock } from "lucide-react";

interface Props {
  approvals: PendingEmployerApproval[];
}

export default function PendingApprovals({
  approvals,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white">
          Pending Employer Approvals
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Awaiting review
        </p>
      </div>

      <div className="divide-y divide-slate-800">
        {approvals.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No pending approvals 🎉
          </div>
        )}

        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-center justify-between p-5"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-slate-800 p-3">
                <Building2
                  size={22}
                  className="text-blue-400"
                />
              </div>

              <div>
                <p className="font-medium text-white">
                  {approval.employer_profiles?.company_name ??
                    "Unknown Company"}
                </p>

                <p className="text-sm text-slate-400">
                  {approval.employer_profiles?.contact_person}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock
                size={16}
                className="text-orange-400"
              />

              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}