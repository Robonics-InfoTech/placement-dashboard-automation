"use client";

import { Menu } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import type { UserRole } from "@/types/auth";
import { ROLE_LABELS } from "@/types/auth";

interface Props {
  userName: string;
  userEmail: string;
  role: UserRole;
  orgName?: string;
  onMenuClick?: () => void;
}

export default function Header({ userName, userEmail, role, orgName, onMenuClick }: Props) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 20px",
        height: "var(--header-height)",
        background: "var(--bg-header)",
        borderBottom: "1px solid var(--border-primary)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="focus-ring"
        aria-label="Toggle sidebar menu"
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-primary)",
          background: "var(--bg-primary)",
          cursor: "pointer",
          color: "var(--text-secondary)",
        }}
        id="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Org / workspace info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {orgName && (
          <div className="truncate-text" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            {orgName}
          </div>
        )}
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{ROLE_LABELS[role]}</div>
      </div>

      {/* Search */}
      <div style={{ flex: "0 1 360px" }} id="header-search-container">
        <GlobalSearch />
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <NotificationBell />
        <ThemeToggle />
        <UserMenu name={userName} email={userEmail} role={role} />
      </div>

      {/* Responsive: show mobile menu button */}
      <style>{`
        @media (max-width: 1023px) {
          #mobile-menu-btn { display: flex !important; }
          #header-search-container { display: none; }
        }
      `}</style>
    </header>
  );
}
