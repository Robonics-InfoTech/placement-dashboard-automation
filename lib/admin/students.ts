import { supabaseAdmin } from "@/lib/supabase/server";

export interface Student {
  id: string;
  user_id: string;
  full_name: string;
  enrollment_number: string;
  branch: string;
  course: string;
  specialization: string;
  semester: number;
  graduation_year: number;
  cgpa: number | null;
  active_backlogs: number;
  phone: string | null;
  photo_url: string | null;
  placement_status: string;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
}

export async function getStudents() {
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select(`
      id,
      user_id,
      full_name,
      enrollment_number,
      branch,
      course,
      specialization,
      semester,
      graduation_year,
      cgpa,
      active_backlogs,
      phone,
      photo_url,
      placement_status,
      is_verified,
      is_suspended,
      created_at
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getStudents:", error);
    return [];
  }

  return data as Student[];
}

export async function verifyStudent(
  studentId: string,
  adminId: string
) {
  return await supabaseAdmin
    .from("student_profiles")
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: adminId,
    })
    .eq("id", studentId);
}

export async function suspendStudent(
  studentId: string,
  reason: string
) {
  return await supabaseAdmin
    .from("student_profiles")
    .update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspension_reason: reason,
    })
    .eq("id", studentId);
}

export async function activateStudent(studentId: string) {
  return await supabaseAdmin
    .from("student_profiles")
    .update({
      is_suspended: false,
      suspended_at: null,
      suspension_reason: null,
    })
    .eq("id", studentId);
}

export async function updatePlacementStatus(
  studentId: string,
  status: string
) {
  return await supabaseAdmin
    .from("student_profiles")
    .update({
      placement_status: status,
    })
    .eq("id", studentId);
}