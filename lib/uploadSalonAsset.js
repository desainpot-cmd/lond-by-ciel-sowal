import { supabase } from "./supabaseClient";

// サロン設定用の画像（QRコード等）をアップロードし、公開URLを返す
export async function uploadSalonAsset(file) {
  if (!file) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from("salon-assets").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("salon-assets").getPublicUrl(path);
  return data.publicUrl;
}
