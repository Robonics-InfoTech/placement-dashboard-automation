import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AppShell from "@/components/layout/AppShell";
import type { UserRole } from "@/types/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const role = (user.user_metadata?.role as UserRole) ?? "student";
  const fullName = (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "Student";
  const email = user.email ?? "";
  const orgName = (user.user_metadata?.college_name as string) ?? undefined;

  return (
    <AppShell role={role} userName={fullName} userEmail={email} orgName={orgName}>
      {children}
    </AppShell>
  );
}
