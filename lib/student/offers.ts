import { supabase } from "@/lib/supabase/client";

export async function getStudentOffers(studentId: string) {
  const { data, error } = await supabase
    .from("offers")
    .select(`
      *,
      applications(
        *,
        jobs(*)
      )
    `)
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .order("offered_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function updateOfferStatus(
  offerId: string,
  status: "accepted" | "declined"
) {
  const { error } = await supabase
    .from("offers")
    .update({
      offer_status: status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", offerId);

  if (error) throw error;
}