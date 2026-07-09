import { supabaseAdmin } from "@/lib/supabase/server";
import type { EmployerProfile } from "@/types/employer";

/**
 * Fetches the employer_profiles row for the given auth user ID.
 * Uses the service-role client to bypass RLS — call only from Server Components or API routes.
 * Returns null if no profile exists yet.
 */
export async function getEmployerProfile(
  userId: string
): Promise<EmployerProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("employer_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as EmployerProfile;
}

/**
 * Returns true only when the employer is fully approved.
 * Use this in page components to gate job-posting actions.
 */
export function isApproved(profile: EmployerProfile | null): boolean {
  return profile?.approval_status === "approved";
}
