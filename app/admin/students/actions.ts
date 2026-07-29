"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function verifyStudent(studentId: string) {
  const { error } = await supabaseAdmin
    .from("student_profiles")
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
    })
    .eq("id", studentId);

  if (error) {
    console.error(error);
    throw new Error("Failed to verify student");
  }

  revalidatePath("/admin/students");
}

export async function suspendStudent(
  studentId: string,
  reason = "Suspended by admin"
) {
  const { error } = await supabaseAdmin
    .from("student_profiles")
    .update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspension_reason: reason,
    })
    .eq("id", studentId);

  if (error) {
    console.error(error);
    throw new Error("Failed to suspend student");
  }

  revalidatePath("/admin/students");
}

export async function bulkVerifyStudents(
  studentIds: string[]
) {
  const { error } = await supabaseAdmin
    .from("student_profiles")
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
    })
    .in("id", studentIds);

  if (error) {
    console.error(error);
    throw new Error("Failed to verify students");
  }

  revalidatePath("/admin/students");
}

export async function bulkSuspendStudents(
  studentIds: string[],
  reason = "Suspended by admin"
) {
  const { error } = await supabaseAdmin
    .from("student_profiles")
    .update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspension_reason: reason,
    })
    .in("id", studentIds);

  if (error) {
    console.error(error);
    throw new Error("Failed to suspend students");
  }

  revalidatePath("/admin/students");
}
