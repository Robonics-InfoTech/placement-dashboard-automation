import AdminLayout from "@/components/admin/AdminLayout";
import { getPendingEmployers } from "@/lib/admin/employers";
import EmployersTable from "@/components/admin/employers/EmployersTable";

export default async function EmployersPage() {
  const employers = await getPendingEmployers();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Employer Management
          </h1>

          <p className="mt-2 text-slate-400">
            Review and approve employer registrations.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">
            Pending Employers
          </h2>

          <p className="mt-2 text-slate-400">
             Total Pending: {employers.length}
          </p>

<EmployersTable employers={employers} />
        </div>
      </div>
    </AdminLayout>
  );
}