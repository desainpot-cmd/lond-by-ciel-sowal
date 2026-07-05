import { supabase } from "./supabaseClient";

// ファイルをSupabase Storageにアップロードし、公開URLを返す
export async function uploadCounselingPhoto(file, userId) {
  if (!file) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from("counseling-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("counseling-photos").getPublicUrl(path);
  return data.publicUrl;
}
