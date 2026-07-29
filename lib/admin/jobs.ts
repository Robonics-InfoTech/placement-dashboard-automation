import { supabaseAdmin } from "@/lib/supabase/server";

export async function getPendingJobs() {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}