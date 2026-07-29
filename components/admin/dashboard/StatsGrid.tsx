import {
  Users,
  UserCheck,
  UserX,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
} from "lucide-react";

import StatCard from "./StatCard";
import { DashboardStats } from "@/lib/admin/dashboard";

interface StatsGridProps {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        subtitle="Registered Students"
        icon={Users}
        iconColor="text-blue-400"
      />

      <StatCard
        title="Verified Students"
        value={stats.verifiedStudents}
        subtitle="Eligible to Apply"
        icon={UserCheck}
        iconColor="text-green-400"
      />

      <StatCard
        title="Suspended Students"
        value={stats.suspendedStudents}
        subtitle="Access Restricted"
        icon={UserX}
        iconColor="text-red-400"
      />

      <StatCard
        title="Active Jobs"
        value={stats.activeJobs}
        subtitle="Currently Open"
        icon={BriefcaseBusiness}
        iconColor="text-purple-400"
      />

      <StatCard
        title="Pending Employers"
        value={stats.pendingEmployers}
        subtitle="Awaiting Approval"
        icon={Building2}
        iconColor="text-orange-400"
      />

      <StatCard
        title="Upcoming Drives"
        value={stats.upcomingDrives}
        subtitle="Scheduled"
        icon={CalendarDays}
        iconColor="text-cyan-400"
      />
    </section>
  );
}