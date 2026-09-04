"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/auth";
import type { RoleNavigation } from "@/types/navigation";
import { ROLE_NAVIGATION } from "@/config/navigation";
import {
  LayoutDashboard, Rocket, Download, Target, GraduationCap, FolderKanban,
  Trophy, FileText, Briefcase, Video, Gift, Users, FileSearch, Bell,
  Megaphone, MessageSquare, User, FolderOpen, Handshake, CheckCircle,
  FileBox, BarChart3, Calendar, Building2, Building, ShieldCheck,
  Award, PieChart, Settings, Store, Mail, Inbox, UserPlus, AlertTriangle,
  Shield, UserCheck, ChevronLeft, ChevronRight, X,
} from "lucide-react";

// Map icon name strings to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, Rocket, Download, Target, GraduationCap, FolderKanban,
  Trophy, FileText, Briefcase, Video, Gift, Users, FileSearch, Bell,
  Megaphone, MessageSquare, User, FolderOpen, Handshake, CheckCircle,
  FileBox, BarChart3, Calendar, Building2, Building, ShieldCheck,
  Award, PieChart, Settings, Store, Mail, Inbox, UserPlus, AlertTriangle,
  Shield, UserCheck,
};

interface Props {
  role: UserRole;
  userName: string;
  orgName?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  role,
  userName,
  orgName,
  collapsed = false,
  onCollapse,
  mobileOpen = false,
  onMobileClose,
}: Props) {
  const pathname = usePathname();
  const nav: RoleNavigation = ROLE_NAVIGATION[role];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebarWidth = collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)";

  const sidebarContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-primary)",
        width: isMobile ? "var(--sidebar-width)" : sidebarWidth,
        transition: "width var(--transition-slow)",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "20px 14px" : "20px 20px",
          borderBottom: "1px solid var(--border-primary)",
          minHeight: 64,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: "white",
            flexShrink: 0,
          }}
        >
          P
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              PlacementHub
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              {nav.portalLabel}
            </div>
          </div>
        )}

        {/* Collapse / close button */}
        {isMobile ? (
          <button
            onClick={onMobileClose}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              padding: 4,
            }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        ) : (
          !collapsed && (
            <button
              onClick={() => onCollapse?.(!collapsed)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "flex",
                padding: 4,
                borderRadius: "var(--radius-sm)",
                transition: "color var(--transition-fast)",
              }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft size={16} />
            </button>
          )
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && !isMobile && (
        <button
          onClick={() => onCollapse?.(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
          aria-label="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Navigation sections */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: collapsed ? "12px 8px" : "12px 12px",
        }}
        className="custom-scrollbar"
        aria-label="Main navigation"
      >
        {nav.sections.map((section) => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.5px",
                  padding: "0 10px 6px",
                  textTransform: "uppercase",
                }}
              >
                {section.label}
              </div>
            )}

            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href + "/") &&
                  !nav.sections.some((s) =>
                    s.items.some(
                      (other) =>
                        other.href !== item.href &&
                        other.href.startsWith(item.href) &&
                        (pathname === other.href || pathname.startsWith(other.href + "/"))
                    )
                  ));

              const IconComponent = ICON_MAP[item.icon] ?? LayoutDashboard;
              const isDisabled = item.disabled || item.comingSoon;

              const baseStyle: React.CSSProperties = {
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "10px 0" : "8px 10px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: 500,
                color: isActive
                  ? "var(--accent-text)"
                  : isDisabled
                  ? "var(--text-disabled)"
                  : "var(--text-secondary)",
                background: isActive ? "var(--accent-light)" : "transparent",
                borderLeft: isActive ? "3px solid var(--accent-primary)" : "3px solid transparent",
                textDecoration: "none",
                cursor: isDisabled ? "default" : "pointer",
                transition: "all var(--transition-fast)",
                opacity: isDisabled ? 0.5 : 1,
                position: "relative",
              };

              const content = (
                <>
                  <IconComponent size={16} />
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--accent-primary)",
                            color: "white",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.comingSoon && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: "1px 5px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--bg-tertiary)",
                            color: "var(--text-muted)",
                          }}
                        >
                          Soon
                        </span>
                      )}
                    </>
                  )}
                </>
              );

              if (isDisabled) {
                return (
                  <span key={item.href} style={baseStyle} title={item.disabledReason ?? "Coming soon"}>
                    {content}
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={baseStyle}
                  onClick={() => isMobile && onMobileClose?.()}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card at bottom */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px",
          borderTop: "1px solid var(--border-primary)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: collapsed ? "8px 0" : "10px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-secondary)",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
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
            {userName[0]?.toUpperCase() ?? "?"}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div
                className="truncate-text"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  maxWidth: 140,
                }}
              >
                {userName}
              </div>
              {orgName && (
                <div
                  className="truncate-text"
                  style={{ fontSize: 10, color: "var(--text-muted)", maxWidth: 140 }}
                >
                  {orgName}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile: render as overlay drawer
  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 998,
              background: "var(--bg-overlay)",
            }}
            onClick={onMobileClose}
          />
        )}
        <aside
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            zIndex: 999,
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform var(--transition-slow)",
          }}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: persistent sidebar
  return (
    <aside
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
        zIndex: 50,
      }}
      className="sidebar-transition"
    >
      {sidebarContent}
    </aside>
  );
}
