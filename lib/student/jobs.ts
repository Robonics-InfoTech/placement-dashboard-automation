import { supabase } from "@/lib/supabase/client";

export async function getPublishedJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("application_deadline", {
      ascending: true,
    });

  if (error) throw error;

  return data;
}

export async function getStudentProfile(userId: string) {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  return data;
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}