import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import EmployerShell from "@/components/employer/EmployerShell";

/**
 * Shared layout for all /employer/* pages.
 * Runs on the server — fetches approval status once per navigation.
 * Unauthenticated requests are bounced to /auth/login (middleware handles this,
 * but we guard here too for defence-in-depth).
 */
export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        // Layout is read-only — no mutations needed
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch employer profile for approval status + company name
  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("company_name, approval_status, hr_contact_name")
    .eq("user_id", user.id)
    .single();

  const companyName =
    profile?.company_name ??
    profile?.hr_contact_name ??
    user.email?.split("@")[0] ??
    "Employer";

  const approvalStatus: "pending" | "approved" | "rejected" =
    // TODO: Remove this override when testing is done — restore DB value below
    "approved";
    // (profile?.approval_status as "pending" | "approved" | "rejected") ?? "pending";


  return (
    <EmployerShell companyName={companyName} approvalStatus={approvalStatus}>
      {children}
    </EmployerShell>
  );
}
