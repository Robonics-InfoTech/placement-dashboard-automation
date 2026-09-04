import type { UserRole } from "@/types/auth";

/**
 * Maps each role to its default dashboard path after login.
 */
export const ROLE_HOME: Record<UserRole, string> = {
  student: "/student/dashboard",
  alumni: "/alumni/dashboard",
  employer: "/employer/dashboard",
  college_admin: "/college/dashboard",
  placement_committee: "/committee/dashboard",
  super_admin: "/admin/dashboard",
};

/**
 * Get the home/dashboard path for a given user role.
 */
export function getRoleHome(role: string | null | undefined): string {
  if (!role) return "/auth/login";
  return ROLE_HOME[role as UserRole] ?? "/auth/login";
}

/**
 * Maps role to its workspace route prefix.
 */
export const ROLE_PREFIX: Record<UserRole, string> = {
  student: "/student",
  alumni: "/alumni",
  employer: "/employer",
  college_admin: "/college",
  placement_committee: "/committee",
  super_admin: "/admin",
};
