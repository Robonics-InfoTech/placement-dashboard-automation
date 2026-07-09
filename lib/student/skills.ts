import { supabase } from "@/lib/supabase/client";

export async function getStudentSkills(studentId: string) {
  const { data, error } = await supabase
    .from("student_skills")
    .select("*")
    .eq("student_id", studentId);

  if (error) throw error;

  return data;
}

export async function addStudentSkill(
  studentId: string,
  skill: string
) {
  const { error } = await supabase
    .from("student_skills")
    .insert({
      student_id: studentId,
      skill_name: skill,
    });

  if (error) throw error;
}

export async function deleteStudentSkill(id: string) {
  const { error } = await supabase
    .from("student_skills")
    .delete()
    .eq("id", id);

  if (error) throw error;
}