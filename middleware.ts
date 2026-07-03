import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

  const isProtectedRoute =
    path.startsWith("/student") ||
    path.startsWith("/employer") ||
    path.startsWith("/admin");

  // Not logged in → redirect to login
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Logged in but wrong role for the route → redirect to home
  if (
    user &&
    (
      (path.startsWith("/student")  && role !== "student") ||
      (path.startsWith("/employer") && role !== "employer") ||
      (path.startsWith("/admin")    && role !== "college_admin")
    )
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/employer/:path*",
    "/admin/:path*",
  ],
};