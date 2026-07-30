"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "All",
    href: "/admin/employers",
  },
  {
    label: "Pending",
    href: "/admin/employers/pending",
  },
  {
    label: "Active",
    href: "/admin/employers/active",
  },
];

export default function EmployerTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-3">
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}