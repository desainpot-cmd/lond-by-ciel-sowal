"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const STATUS_LABEL = {
  pending_payment: "支払い待ち",
  payment_reported: "振込確認中",
  paid: "入金確認済み",
  preparing: "準備中",
  shipping: "発送中",
  delivered: "配達完了",
};

export default function HistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select(
          "id, total_amount, status, created_at, order_items(quantity, unit_price, products(image_url, product_translations(name)))"
        )
        .eq("customer_id", profile.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
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

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>購入履歴</h1>

      {orders.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>まだ購入履歴がありません</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/delivery/${o.id}`}
            style={{ display: "block", border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 16, textDecoration: "none", color: "var(--color-text)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--color-beige-gray)" }}>{new Date(o.created_at).toLocaleDateString("ja-JP")}</span>
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: o.status === "delivered" ? "#eee" : "var(--color-black)",
                  color: o.status === "delivered" ? "var(--color-text)" : "var(--color-bg)",
                }}
              >
                {STATUS_LABEL[o.status] || o.status}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
              {o.order_items?.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {item.products?.image_url ? (
                    <img
                      src={item.products.image_url}
                      alt=""
                      style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, background: "#f0ede5", borderRadius: 4, flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 13 }}>
                    {item.products?.product_translations?.[0]?.name || "(商品名なし)"} × {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 14, fontWeight: 600 }}>合計 {fmt(o.total_amount)}</div>
            <div style={{ fontSize: 11, color: "var(--color-beige-gray)", marginTop: 6 }}>配送状況を見る →</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
