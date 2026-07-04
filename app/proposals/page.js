"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function ProposalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/login");
        return;
      }
      const userId = userData.user.id;

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data: counselings } = await supabase
        .from("counseling_records")
        .select("id")
        .eq("customer_id", profile.id);

      const counselingIds = (counselings || []).map((c) => c.id);

      if (counselingIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: recs, error } = await supabase
        .from("stylist_recommendations")
        .select(
          "id, usage_instruction, comment, created_at, products(id, volume, price, product_translations(name, description)), stylist_profiles(display_name)"
        )
        .in("counseling_id", counselingIds)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setRecommendations(recs || []);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "");

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 32 }}>
        <p style={{ fontSize: 13, color: "#8a8478" }}>読み込み中...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "#8a8478", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>あなたへの提案</h1>

      {errorMsg && <p style={{ fontSize: 13, color: "#b00" }}>エラー: {errorMsg}</p>}

      {!errorMsg && recommendations.length === 0 && (
        <div style={{ background: "#f7f4ee", borderRadius: 6, padding: 20, fontSize: 13, color: "#8a8478", lineHeight: 1.8 }}>
          まだ提案がありません。カウンセリングを送信すると、スタイリストが確認後にここへ商品を提案します。
          <div style={{ marginTop: 14 }}>
            <Link
              href="/counseling"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "#1b1b1b",
                color: "#fff",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              カウンセリングを始める
            </Link>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {recommendations.map((r) => {
          const t = r.products?.product_translations?.[0];
          return (
            <div key={r.id} style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#b8926b", fontWeight: 600, marginBottom: 10 }}>
                {r.stylist_profiles?.display_name || "スタイリスト"} より
              </div>

              {r.comment && (
                <p style={{ fontSize: 12.5, color: "#8a8478", lineHeight: 1.7, marginBottom: 14 }}>{r.comment}</p>
              )}

              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 56, height: 56, background: "#f0ede5", borderRadius: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{t?.name || "(商品名なし)"}</div>
                  <div style={{ fontSize: 11, color: "#8a8478", marginBottom: 3 }}>{r.products?.volume}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(r.products?.price)}</div>
                </div>
              </div>

              {r.usage_instruction && (
                <div style={{ fontSize: 12, color: "#1b1b1b", background: "#f7f4ee", borderRadius: 4, padding: 10, lineHeight: 1.7, marginBottom: 12 }}>
                  <b>使用方法：</b>
                  {r.usage_instruction}
                </div>
              )}

              {r.products?.id && (
                <Link
                  href={`/products/${r.products.id}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: 12,
                    background: "#1b1b1b",
                    color: "#fff",
                    borderRadius: 4,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  商品を見る
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
