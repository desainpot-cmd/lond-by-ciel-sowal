"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

const STEPS = [
  { key: "preparing", label: "準備中" },
  { key: "shipping", label: "発送中" },
  { key: "delivered", label: "配達完了" },
];

export default function DeliveryStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, total_amount, status, created_at, order_items(quantity, unit_price, products(volume, product_translations(name)))"
        )
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setOrder(data);
      }
      setLoading(false);
    };
    if (id) load();
  }, [id, router]);

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "");

  if (loading) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (errorMsg) return <main style={{ padding: 32, color: "#b00" }}>エラー: {errorMsg}</main>;
  if (!order) return <main style={{ padding: 32 }}>注文が見つかりません</main>;

  const preShippingStatuses = ["pending_payment", "payment_reported", "paid"];
  const isPreShipping = preShippingStatuses.includes(order.status);
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/history" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← 購入履歴に戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 20, margin: "16px 0 6px" }}>配送状況</h1>
      <p style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginBottom: 24 }}>
        注文番号：{order.id}
      </p>

      {isPreShipping ? (
        <div style={{ background: "var(--color-beige-light)", borderRadius: 6, padding: 20, marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, lineHeight: 1.8 }}>
            {order.status === "pending_payment" && "お支払いをお待ちしています"}
            {order.status === "payment_reported" && "ご入金の確認を行っています。今しばらくお待ちください。"}
            {order.status === "paid" && "入金確認済みです。発送準備を行います。"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", padding: "10px 0 30px" }}>
          {STEPS.map((step, i) => {
            const active = i <= currentStepIndex;
            return (
              <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "0 0 auto" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: active ? "var(--color-black)" : "var(--color-bg)",
                      border: `1.5px solid ${active ? "var(--color-black)" : "var(--color-beige-border)"}`,
                    }}
                  />
                  <div style={{ fontSize: 10.5, marginTop: 6, color: active ? "var(--color-black)" : "var(--color-beige-gray)" }}>{step.label}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ height: 1.5, background: i < currentStepIndex ? "var(--color-black)" : "var(--color-beige-border)", flex: 1, marginTop: -18 }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 10 }}>ご注文内容</p>
        {order.order_items?.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f0ede5" }}>
            <span>
              {item.products?.product_translations?.[0]?.name || "(商品名なし)"}
              {item.products?.volume ? `（${item.products.volume}）` : ""} × {item.quantity}
            </span>
            <span>{fmt(item.unit_price * item.quantity)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, marginTop: 10 }}>
          <span>合計</span>
          <span>{fmt(order.total_amount)}</span>
        </div>
      </div>

      <p style={{ fontSize: 11, color: "var(--color-beige-gray)", textAlign: "center" }}>
        {new Date(order.created_at).toLocaleString("ja-JP")} にご注文
      </p>
    </main>
  );
}
