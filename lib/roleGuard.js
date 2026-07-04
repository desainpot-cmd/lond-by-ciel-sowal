import { supabase } from "./supabaseClient";

// ログイン中のユーザーの role（customer / stylist / admin）を取得する
export async function getMyRole() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { userId: null, role: null };
  }

  const { data } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  return { userId: userData.user.id, role: data?.role || "customer" };
}
