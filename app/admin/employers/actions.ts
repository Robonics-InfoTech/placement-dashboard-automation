"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function approveEmployer(id: string) {
  const { error } = await supabaseAdmin
    .from("employer_profiles")
    .update({
      verified: true,
    })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/employers");
}

export async function rejectEmployer(id: string) {
  const { error } = await supabaseAdmin
    .from("employer_profiles")
    .delete()
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/employers");
}