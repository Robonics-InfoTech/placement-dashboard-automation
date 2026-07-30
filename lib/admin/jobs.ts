import { supabaseAdmin } from "@/lib/supabase/server";

export async function getJobs() {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}