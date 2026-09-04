"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { UserRole } from "@/types/auth";

interface Props {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
  userEmail: string;
  orgName?: string;
}

export default function AppShell({ children, role, userName, userEmail, orgName }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-secondary)" }}>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* Sidebar */}
      <Sidebar
        role={role}
        userName={userName}
        orgName={orgName}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main area: header + content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header
          userName={userName}
          userEmail={userEmail}
          role={role}
          orgName={orgName}
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main
          id="main-content"
          style={{
            flex: 1,
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
