import { supabaseAdmin } from "@/lib/supabase/server";

export async function getPendingEmployers() {
  const { data, error } = await supabaseAdmin
    .from("employer_profiles")
    .select("*")
    .eq("verified", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}