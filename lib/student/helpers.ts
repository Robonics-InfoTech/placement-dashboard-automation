import { supabase } from "@/lib/supabase/client";

export async function getStudentProfileId(userId: string) {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  return data.id;
}