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
  const [menuProposals, setMenuProposals] = useState([]);
  const [menuMap, setMenuMap] = useState({});
  const [bookingLink, setBookingLink] = useState(null);

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

      const { data: settings } = await supabase
        .from("salon_settings")
        .select("booking_link_url, booking_link_label")
        .limit(1)
        .maybeSingle();
      setBookingLink(settings || null);

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
          "id, usage_instruction, comment, created_at, products(id, volume, price, image_url, product_translations(name, description)), stylist_profiles(display_name)"
        )
        .in("counseling_id", counselingIds)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setRecommendations(recs || []);
      }

      const { data: menuProps } = await supabase
        .from("stylist_menu_proposals")
        .select("id, menu_ids, total_price, comment, created_at, stylist_profiles(display_name)")
        .in("counseling_id", counselingIds)
        .order("created_at", { ascending: false });
      setMenuProposals(menuProps || []);

      const { data: allMenus } = await supabase.from("menus").select("id, name, category, price");
      const map = {};
      (allMenus || []).forEach((m) => {
        map[m.id] = m;
      });
      setMenuMap(map);

      setLoading(false);
    };
    load();
  }, [router]);

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "");

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 32 }}>
        <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>
      </main>
    );
  }

  const hasAnyProposal = recommendations.length > 0 || menuProposals.length > 0;

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>あなたへの提案</h1>

      {errorMsg && <p style={{ fontSize: 13, color: "#b00" }}>エラー: {errorMsg}</p>}

      {!errorMsg && !hasAnyProposal && (
        <div style={{ background: "var(--color-beige-light)", borderRadius: 6, padding: 20, fontSize: 13, color: "var(--color-beige-gray)", lineHeight: 1.8 }}>
          まだ提案がありません。カウンセリングを送信すると、スタイリストが確認後にここへ提案します。
          <div style={{ marginTop: 14 }}>
            <Link
              href="/counseling"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "var(--color-black)",
                color: "var(--color-bg)",
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

      {menuProposals.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "serif", fontSize: 16, marginBottom: 12 }}>髪型メニューのご提案</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {menuProposals.map((p) => (
              <div key={p.id} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 16 }}>
                <div style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 600, marginBottom: 10 }}>
                  {p.stylist_profiles?.display_name || "スタイリスト"} より
                </div>
                {p.comment && (
                  <p style={{ fontSize: 12.5, color: "var(--color-beige-gray)", lineHeight: 1.7, marginBottom: 14 }}>{p.comment}</p>
                )}
                <div style={{ marginBottom: 12 }}>
                  {p.menu_ids?.map((mid) => (
                    <div key={mid} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f0ede5" }}>
                      <span>{menuMap[mid]?.name || "(メニュー)"}</span>
                      <span>{fmt(menuMap[mid]?.price)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
                  <span>合計</span>
                  <span>{fmt(p.total_price)}</span>
                </div>

                {bookingLink?.booking_link_url ? (
                  <a
                    href={bookingLink.booking_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: 12,
                      background: "var(--color-black)",
                      color: "var(--color-bg)",
                      borderRadius: 4,
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    {bookingLink.booking_link_label || "オンラインブッキングへ進む"}
                  </a>
                ) : (
                  <p style={{ fontSize: 11, color: "var(--color-beige-gray)", textAlign: "center" }}>
                    予約リンクは準備中です。サロンまで直接お問い合わせください。
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "serif", fontSize: 16, marginBottom: 12 }}>商品のご提案</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {recommendations.map((r) => {
              const t = r.products?.product_translations?.[0];
              return (
                <div key={r.id} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 600, marginBottom: 10 }}>
                    {r.stylist_profiles?.display_name || "スタイリスト"} より
                  </div>

                  {r.comment && (
                    <p style={{ fontSize: 12.5, color: "var(--color-beige-gray)", lineHeight: 1.7, marginBottom: 14 }}>{r.comment}</p>
                  )}

                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    {r.products?.image_url ? (
                      <img
                        src={r.products.image_url}
                        alt=""
                        style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: 56, height: 56, background: "#f0ede5", borderRadius: 6, flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{t?.name || "(商品名なし)"}</div>
                      <div style={{ fontSize: 11, color: "var(--color-beige-gray)", marginBottom: 3 }}>{r.products?.volume}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(r.products?.price)}</div>
                    </div>
                  </div>

                  {r.usage_instruction && (
                    <div style={{ fontSize: 12, color: "var(--color-text)", background: "var(--color-beige-light)", borderRadius: 4, padding: 10, lineHeight: 1.7, marginBottom: 12 }}>
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
                        background: "var(--color-black)",
                        color: "var(--color-bg)",
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
        </div>
      )}
    </main>
  );
}
