import type { UserRole } from "@/types/auth";

/**
 * Check if a user's role is in the list of allowed roles.
 */
export function authorize(userRole: UserRole | string | null | undefined, allowed: UserRole[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as UserRole);
}

/**
 * Placement committee members have read-only access.
 */
export function isReadOnly(userRole: UserRole | string | null | undefined): boolean {
  return userRole === "placement_committee";
}

/**
 * Check if a user role can access a specific route prefix.
 */
export const ROUTE_ROLE_MAP: Record<string, UserRole[]> = {
  "/student": ["student"],
  "/alumni": ["alumni"],
  "/employer": ["employer"],
  "/college": ["college_admin"],
  "/committee": ["placement_committee"],
  "/admin": ["super_admin"],
};

/**
 * Get the allowed roles for a given route.
 */
export function getAllowedRolesForRoute(pathname: string): UserRole[] | null {
  for (const [prefix, roles] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname.startsWith(prefix)) {
      return roles;
    }
  }
  return null;
}
