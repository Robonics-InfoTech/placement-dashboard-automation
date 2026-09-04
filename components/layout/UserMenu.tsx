"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ROLE_LABELS, type UserRole } from "@/types/auth";

interface Props {
  name: string;
  email: string;
  role: UserRole;
}

export default function UserMenu({ name, email, role }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="focus-ring"
        aria-label="User menu"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 8px 4px 4px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-primary)",
          background: "var(--bg-primary)",
          cursor: "pointer",
          transition: "all var(--transition-normal)",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-sm)",
            background: "var(--accent-primary)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
            maxWidth: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name.split(" ")[0]}
        </span>
        <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 240,
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {/* User info */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-primary)" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{name}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{email}</div>
            <span
              style={{
                display: "inline-block",
                marginTop: 6,
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                background: "var(--accent-light)",
                color: "var(--accent-text)",
              }}
            >
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px 0" }}>
            <MenuButton icon={<User size={14} />} label="Profile" />
            <MenuButton icon={<Settings size={14} />} label="Settings" />
          </div>

          <div style={{ borderTop: "1px solid var(--border-primary)", padding: "6px 0" }}>
            <MenuButton icon={<LogOut size={14} />} label="Sign out" onClick={handleLogout} danger />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 16px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 13,
        color: danger ? "var(--error)" : "var(--text-secondary)",
        fontFamily: "var(--font-sans)",
        transition: "background var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
