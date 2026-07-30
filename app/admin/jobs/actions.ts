"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function approveJob(id: string) {
  const { error } = await supabaseAdmin
    .from("jobs")
    .update({
      status: "published",
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/jobs");
}

export async function rejectJob(id: string) {
  const { error } = await supabaseAdmin
    .from("jobs")
    .update({
      status: "rejected",
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/jobs");
}