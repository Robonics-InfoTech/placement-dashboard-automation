"use client";

import {
  Search,
  Bell,
  UserCircle2,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

interface AdminTopbarProps {
  title: string;
}

export default function AdminTopbar({
  title,
}: AdminTopbarProps) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#020817]/95 backdrop-blur">

      <div className="flex h-[72px] items-center justify-between px-8">

        {/* Left */}

        <div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>

          <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">

            <CalendarDays size={15} />

            {today}

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-4">

          {/* Search */}

          <div className="relative hidden lg:block">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search..."
              className="
                h-11
                w-80
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                pl-11
                pr-4
                text-sm
                text-white
                placeholder:text-slate-500
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />

          </div>

          {/* Notification */}

          <button
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              transition
              hover:border-blue-500
            "
          >

            <Bell
              size={19}
              className="text-slate-300"
            />

            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500"></span>

          </button>

          {/* Profile */}

          <button
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              px-3
              py-2
              transition
              hover:border-blue-500
            "
          >

            <UserCircle2
              size={40}
              className="text-blue-500"
            />

            <div className="text-left">

              <p className="text-sm font-semibold text-white">
                College Admin
              </p>

              <p className="text-xs text-slate-400">
                Administrator
              </p>

            </div>

            <ChevronDown
              size={16}
              className="text-slate-500"
            />

          </button>

        </div>

      </div>

    </header>
  );
}