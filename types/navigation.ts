import type { UserRole } from "./auth";

/** A single sidebar navigation item */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // Lucide icon name (e.g. "LayoutDashboard")
  badge?: number | string;
  disabled?: boolean;
  disabledReason?: string;
  /** If true, item is shown but not yet functional */
  comingSoon?: boolean;
}

/** A labeled group of nav items in the sidebar */
export interface NavSection {
  label: string;
  items: NavItem[];
}

/** Complete sidebar config for a role */
export interface RoleNavigation {
  role: UserRole;
  portalLabel: string; // e.g. "Student Portal"
  sections: NavSection[];
}

/** Quick action button on dashboard */
export interface QuickAction {
  label: string;
  href: string;
  icon: string;
  variant?: "primary" | "secondary" | "ghost";
}

/** Dashboard navigation card */
export interface DashboardCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  disabled?: boolean;
}
