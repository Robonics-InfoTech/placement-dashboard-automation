import AdminLayout from "@/components/admin/AdminLayout";
import StatsGrid from "@/components/admin/dashboard/StatsGrid";
import RecentStudents from "@/components/admin/dashboard/RecentStudents";
import PendingApprovals from "@/components/admin/dashboard/PendingApprovals";
import UpcomingDrives from "@/components/admin/dashboard/UpcomingDrives";

import {
  getDashboardStats,
  getRecentStudents,
  getPendingEmployerApprovals,
  getUpcomingDrives,
} from "@/lib/admin/dashboard";

export default async function DashboardPage() {
  const [stats, students, approvals, drives] = await Promise.all([
    getDashboardStats(),
    getRecentStudents(),
    getPendingEmployerApprovals(),
    getUpcomingDrives(),
  ]);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* KPI Cards */}
        <StatsGrid stats={stats} />

        {/* Dashboard Widgets */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Recent Students */}
          <RecentStudents students={students} />

          {/* Pending Employer Approvals */}
          <PendingApprovals approvals={approvals} />

          {/* Upcoming Placement Drives */}
          <UpcomingDrives drives={drives} />

          {/* Placement Analytics (Coming Next) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">
              Placement Analytics
            </h2>

            <p className="mt-2 text-slate-400">
              Analytics dashboard coming next. This section will display:
            </p>

            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>• Placement Percentage</li>
              <li>• Applications Submitted</li>
              <li>• Offers Received</li>
              <li>• Highest & Average Package</li>
              <li>• Branch-wise Placement Statistics</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}