import { createClient } from "@supabase/supabase-js";

// 環境変数に余分な空白・改行が入っていても問題が起きないよう、trim()で取り除く
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
