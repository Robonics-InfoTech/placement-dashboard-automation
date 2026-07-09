import { supabase } from "@/lib/supabase/client";

export async function getStudentProfile(userId: string) {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId);

  console.log("PROFILE DATA:", data);
  console.log("PROFILE ERROR:", error);

  if (error) throw error;

  return data?.[0] ?? null;
}

export async function updateStudentProfile(
  userId: string,
  updates: {
    full_name?: string;
    phone?: string;
    dob?: string;
    photo_url?: string;
    branch?: string;
    course?: string;
    specialization?: string;
    semester?: number;
    graduation_year?: number;
    cgpa?: number;
    active_backlogs?: number;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
  }
) {
  const { data, error } = await supabase
    .from("student_profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}