"use client";

import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
}

export default function AdminLayout({
  title,
  children,
}: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-72">
        <AdminSidebar />
      </aside>

      {/* Main Area */}
      <div className="ml-72 flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30">
          <AdminTopbar title={title} />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-950 p-6">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}