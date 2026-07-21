import { supabase } from "./supabaseClient";

// 髪型スタイル写真をアップロードし、公開URLを返す
export async function uploadStylePhoto(file) {
  if (!file) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from("style-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("style-photos").getPublicUrl(path);
  return data.publicUrl;
}
