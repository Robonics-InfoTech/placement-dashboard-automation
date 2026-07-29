"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Bell,
  FileText,
  ShieldCheck,
  LogOut,
  GraduationCap,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Employers",
    href: "/admin/employers",
    icon: Building2,
  },
  {
    title: "Jobs",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    title: "Placement Calendar",
    href: "/admin/calendar",
    icon: CalendarDays,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: Bell,
  },
  {
    title: "Placement Rules",
    href: "/admin/settings/placement-rules",
    icon: ShieldCheck,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-800 bg-[#0B1120]">

      {/* Logo */}

      <div className="border-b border-slate-800 px-5 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">

            <GraduationCap
              size={20}
              className="text-white"
            />

          </div>

          <div>

            <h2 className="text-lg font-semibold text-white">
              College Admin
            </h2>

            <p className="text-xs text-slate-400">
              Placement Portal
            </p>

          </div>

        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-1 p-4">

        {menuItems.map((item) => {

          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-all duration-200

                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
            >

              <Icon
                size={18}
                className={`${
                  active
                    ? "text-white"
                    : "text-slate-500 group-hover:text-blue-400"
                }`}
              />

              {item.title}

            </Link>
          );
        })}

      </nav>

      {/* Logout */}

      <div className="border-t border-slate-800 p-4">

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-red-400 transition hover:bg-red-500/10">

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}