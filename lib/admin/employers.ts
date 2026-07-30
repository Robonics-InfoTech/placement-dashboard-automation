import { supabaseAdmin } from "@/lib/supabase/server";

export async function getEmployers() {
  const { data, error } = await supabaseAdmin
    .from("employer_profiles")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}