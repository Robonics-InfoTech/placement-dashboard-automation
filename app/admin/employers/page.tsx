import AdminLayout from "@/components/admin/AdminLayout";
import EmployersTable from "@/components/admin/employers/EmployersTable";
import EmployerTabs from "@/components/admin/employers/EmployerTabs";
import { getEmployers } from "@/lib/admin/employers";

export default async function EmployersPage() {
  const employers = await getEmployers();

  const total = employers.length;
  const verified = employers.filter((e) => e.verified).length;
  const pending = total - verified;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Employer Management
          </h1>

          <p className="mt-2 text-slate-400">
            Manage employer registrations and approvals.
          </p>

          <div className="mt-6">
            <EmployerTabs />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total Employers
            </p>

            <h2 className="mt-3 text-4xl font-bold text-blue-400">
              {total}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Active Employers
            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-400">
              {verified}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Pending Approval
            </p>

            <h2 className="mt-3 text-4xl font-bold text-yellow-400">
              {pending}
            </h2>
          </div>
        </div>

        {/* Table */}
        <EmployersTable employers={employers} />
      </div>
    </AdminLayout>
  );
}