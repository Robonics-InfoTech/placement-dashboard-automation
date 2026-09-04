import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import EmployerJobsList from "@/components/employer/EmployerJobsList";

export default async function EmployerJobsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id, approval_status")
    .eq("user_id", user.id)
    .single();

  const isApproved = profile?.approval_status === "approved";

  return <EmployerJobsList employerProfileId={profile?.id ?? ""} isApproved={isApproved} />;
}
