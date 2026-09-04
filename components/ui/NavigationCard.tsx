import Link from "next/link";
import {
  LayoutDashboard, Rocket, Download, Target, GraduationCap, FolderKanban,
  Trophy, FileText, Briefcase, Video, Gift, Users, FileSearch, Bell,
  Megaphone, MessageSquare, User, FolderOpen, Handshake, CheckCircle,
  FileBox, BarChart3, Calendar, Building2, Building, ShieldCheck,
  Award, PieChart, Settings, Store, Mail, Inbox, UserPlus, AlertTriangle,
  Shield, UserCheck, ArrowRight,
} from "lucide-react";
import type { ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
  LayoutDashboard, Rocket, Download, Target, GraduationCap, FolderKanban,
  Trophy, FileText, Briefcase, Video, Gift, Users, FileSearch, Bell,
  Megaphone, MessageSquare, User, FolderOpen, Handshake, CheckCircle,
  FileBox, BarChart3, Calendar, Building2, Building, ShieldCheck,
  Award, PieChart, Settings, Store, Mail, Inbox, UserPlus, AlertTriangle,
  Shield, UserCheck,
};

interface Props {
  title: string;
  description?: string;
  href: string;
  icon: string;
  disabled?: boolean;
}

export default function NavigationCard({ title, description, href, icon, disabled }: Props) {
  const IconComponent = ICON_MAP[icon] ?? LayoutDashboard;

  const content = (
    <div
      className={disabled ? "" : "card-hover"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xs)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        textDecoration: "none",
        color: "inherit",
        transition: "all var(--transition-normal)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: "var(--accent-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent-text)",
          flexShrink: 0,
        }}
      >
        <IconComponent size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
        {description && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>
            {description}
          </div>
        )}
      </div>
      {!disabled && <ArrowRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
      {disabled && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-tertiary)",
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          Soon
        </span>
      )}
    </div>
  );

  if (disabled) return content;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {content}
    </Link>
  );
}
