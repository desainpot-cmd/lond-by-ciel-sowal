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
          "id, total_amount, status, created_at, order_items(quantity, unit_price, products(product_translations(name)))"
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
        <p style={{ fontSize: 13, color: "#8a8478" }}>読み込み中...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "#8a8478", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>購入履歴</h1>

      {orders.length === 0 && (
        <p style={{ fontSize: 13, color: "#8a8478" }}>まだ購入履歴がありません</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/delivery/${o.id}`}
            style={{ display: "block", border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, textDecoration: "none", color: "#1b1b1b" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#8a8478" }}>{new Date(o.created_at).toLocaleDateString("ja-JP")}</span>
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: o.status === "delivered" ? "#eee" : "#1b1b1b",
                  color: o.status === "delivered" ? "#1b1b1b" : "#fff",
                }}
              >
                {STATUS_LABEL[o.status] || o.status}
              </span>
            </div>

            <div style={{ fontSize: 13, marginBottom: 8 }}>
              {o.order_items?.map((item, i) => (
                <div key={i}>
                  {item.products?.product_translations?.[0]?.name || "(商品名なし)"} × {item.quantity}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 14, fontWeight: 600 }}>合計 {fmt(o.total_amount)}</div>
            <div style={{ fontSize: 11, color: "#8a8478", marginTop: 6 }}>配送状況を見る →</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
