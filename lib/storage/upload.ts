import { supabase } from "@/lib/supabase/client";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
    });

  if (error) throw error;

  return data;
}

export async function getFileUrl(
  bucket: string,
  path: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;

  return data.signedUrl;
}

export async function deleteFile(
  bucket: string,
  path: string
) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}