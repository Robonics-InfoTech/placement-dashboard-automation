import AdminLayout from "@/components/admin/AdminLayout";
import EmployerTabs from "@/components/admin/employers/EmployerTabs";
import EmployersTable from "@/components/admin/employers/EmployersTable";
import { getEmployers } from "@/lib/admin/employers";

export default async function ActiveEmployersPage() {
  const employers = await getEmployers();

  const activeEmployers = employers.filter(
    (e) => e.verified
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Active Employers
          </h1>

          <p className="mt-2 text-slate-400">
            View and manage approved employers who are allowed to post jobs.
          </p>

          <div className="mt-6">
            <EmployerTabs />
          </div>
        </div>

        {/* Table */}
        <EmployersTable employers={activeEmployers} />
      </div>
    </AdminLayout>
  );
}