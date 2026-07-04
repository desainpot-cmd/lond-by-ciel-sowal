"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function CounselingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [hairType, setHairType] = useState("くせ毛");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
      } else {
        setUserId(data.user.id);
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    await supabase.from("app_users").upsert({ id: userId, role: "customer" });

    let { data: existingProfile } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let customerId = existingProfile?.id;

    if (!customerId) {
      const { data: newProfile, error: profileError } = await supabase
        .from("customer_profiles")
        .insert({ user_id: userId, name })
        .select()
        .single();

      if (profileError) {
        setMessage("エラー（プロフィール作成）: " + profileError.message);
        setLoading(false);
        return;
      }
      customerId = newProfile.id;
    }

    const hairTypeMap = { 直毛: "straight", くせ毛: "wavy", 強いくせ: "curly" };
    const { error: counselingError } = await supabase.from("counseling_records").insert({
      customer_id: customerId,
      hair_type: hairTypeMap[hairType],
    });

    if (counselingError) {
      setMessage("エラー（カウンセリング保存）: " + counselingError.message);
    } else {
      setMessage("保存できました！Supabaseの Table Editor で確認してみてください。");
    }
    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <h1 style={{ fontFamily: "serif", fontSize: 20, marginBottom: 20, textAlign: "center" }}>
          カウンセリング（動作確認）
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#8a8478" }}>お名前</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: 14,
                marginTop: 4,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#8a8478" }}>髪質</label>
            <select
              value={hairType}
              onChange={(e) => setHairType(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: 14,
                marginTop: 4,
              }}
            >
              <option>直毛</option>
              <option>くせ毛</option>
              <option>強いくせ</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !userId}
            style={{
              padding: 14,
              background: "#1b1b1b",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {loading ? "保存中..." : "送信する"}
          </button>
        </form>

        {message && <p style={{ marginTop: 16, fontSize: 13 }}>{message}</p>}
      </div>
    </main>
  );
}
