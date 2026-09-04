import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Static page registry for search
const PAGES = [
  { title: "Dashboard", href: "/student/dashboard", roles: ["student"] },
  { title: "Browse Drives", href: "/student/drives", roles: ["student"] },
  { title: "My Applications", href: "/student/applications", roles: ["student"] },
  { title: "My Offers", href: "/student/offers", roles: ["student"] },
  { title: "My Profile", href: "/student/profile", roles: ["student"] },
  { title: "Documents", href: "/student/documents", roles: ["student"] },
  { title: "Notifications", href: "/student/notifications", roles: ["student"] },
  { title: "Job Board", href: "/student/jobs", roles: ["student"] },
  { title: "Alumni Dashboard", href: "/alumni/dashboard", roles: ["alumni"] },
  { title: "Alumni Jobs", href: "/alumni/jobs", roles: ["alumni"] },
  { title: "Employer Dashboard", href: "/employer/dashboard", roles: ["employer"] },
  { title: "Job Postings", href: "/employer/jobs", roles: ["employer"] },
  { title: "Placement Drives", href: "/employer/drives", roles: ["employer"] },
  { title: "Company Profile", href: "/employer/profile", roles: ["employer"] },
  { title: "Employer Offers", href: "/employer/offers", roles: ["employer"] },
  { title: "College Dashboard", href: "/college/dashboard", roles: ["college_admin"] },
  { title: "Student Directory", href: "/college/students", roles: ["college_admin"] },
  { title: "Employer Approvals", href: "/college/employer-approvals", roles: ["college_admin"] },
  { title: "Analytics", href: "/college/analytics", roles: ["college_admin"] },
  { title: "Committee Dashboard", href: "/committee/dashboard", roles: ["placement_committee"] },
  { title: "Platform Overview", href: "/admin/dashboard", roles: ["super_admin"] },
  { title: "Colleges", href: "/admin/colleges", roles: ["super_admin"] },
  { title: "Users", href: "/admin/users", roles: ["super_admin"] },
];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as string) ?? "";

  // Filter pages by role
  const pageResults = PAGES
    .filter((p) => p.roles.includes(role) && p.title.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({ type: "page" as const, title: p.title, href: p.href }));

  // Search jobs if employer or student
  let jobResults: { type: "job"; title: string; href: string }[] = [];
  if (["student", "employer", "alumni"].includes(role)) {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title")
      .ilike("title", `%${q}%`)
      .limit(3);

    jobResults = (jobs ?? []).map((j) => ({
      type: "job" as const,
      title: j.title,
      href: role === "employer" ? `/employer/jobs` : `/student/jobs`,
    }));
  }

  return NextResponse.json({
    results: [...pageResults, ...jobResults],
  });
}
