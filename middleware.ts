import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Role → route prefix mapping.
 * Each protected route prefix is only accessible by the specified role(s).
 */
const ROUTE_ROLE_MAP: Record<string, string[]> = {
  "/student": ["student"],
  "/alumni": ["alumni"],
  "/employer": ["employer"],
  "/college": ["college_admin"],
  "/committee": ["placement_committee"],
  "/admin": ["super_admin"],
};

/** Role → default dashboard redirect */
const ROLE_HOME: Record<string, string> = {
  student: "/student/dashboard",
  alumni: "/alumni/dashboard",
  employer: "/employer/dashboard",
  college_admin: "/college/dashboard",
  placement_committee: "/committee/dashboard",
  super_admin: "/admin/dashboard",
};

export async function middleware(request: NextRequest) {

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  // Verify the JWT with Supabase — role is stored in user_metadata at signup.
  // This avoids a DB round-trip and any RLS timing issues.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Read role from the JWT user_metadata (set during admin.createUser at signup)
  const role = (user?.user_metadata?.role as string | undefined) ?? null;

  // Determine if the current path is protected
  const matchedPrefix = Object.keys(ROUTE_ROLE_MAP).find((prefix) =>
    path.startsWith(prefix)
  );

  if (!matchedPrefix) {
    // Not a protected route — allow
    return response;
  }

  // Not logged in → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Logged in but wrong role for the route → redirect to their own dashboard
  const allowedRoles = ROUTE_ROLE_MAP[matchedPrefix];
  if (role && !allowedRoles.includes(role)) {
    const homePath = ROLE_HOME[role] ?? "/auth/login";
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  // No role at all → redirect to login
  if (!role) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/alumni/:path*",
    "/employer/:path*",
    "/college/:path*",
    "/committee/:path*",
    "/admin/:path*",
  ],
};