import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },

        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },

        remove(name, options) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  let role: string | null = null;

if (user) {
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  role = profile?.role ?? null;
}

  const isProtectedRoute =
  path.startsWith("/student") ||
  path.startsWith("/employer") ||
  path.startsWith("/admin");

  if (!user && isProtectedRoute) {
  return NextResponse.redirect(
    new URL("/auth/login", request.url)
  );
}

if (
  (path.startsWith("/student") && role !== "student") ||
  (path.startsWith("/employer") && role !== "employer") ||
  (path.startsWith("/admin") && role !== "college_admin")
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