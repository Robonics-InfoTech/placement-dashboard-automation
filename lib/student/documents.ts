import { supabase } from "@/lib/supabase/client";

export async function getDocuments(userId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function uploadDocument(document: {
  user_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}) {
  const { error } = await supabase
    .from("documents")
    .insert(document);

  if (error) throw error;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function setPrimaryResume(
  userId: string,
  documentId: string
) {
  // Remove current primary resume
  await supabase
    .from("documents")
    .update({ is_primary: false })
    .eq("user_id", userId)
    .eq("document_type", "resume");

  // Set selected resume
  const { error } = await supabase
    .from("documents")
    .update({ is_primary: true })
    .eq("id", documentId);

  if (error) throw error;
}