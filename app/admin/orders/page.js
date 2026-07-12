"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { getMyRole } from "../../../lib/roleGuard";

const STATUS_LABEL = {
  pending_payment: "支払い待ち",
  payment_reported: "振込報告あり",
  paid: "入金確認済み",
  preparing: "準備中",
  shipping: "発送中",
  delivered: "配達完了",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [denied, setDenied] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, total_amount, status, created_at, customer_profiles(name, phone), order_items(quantity, unit_price, products(product_translations(name))), payments(id, status, report_channel, customer_reported_at)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { userId, role } = await getMyRole();

      if (!userId) {
        router.push("/login");
        return;
      }

      if (role !== "admin") {
        setDenied(true);
        setLoading(false);
        return;
      }

      load();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmPayment = async (order) => {
    setProcessingId(order.id);
    const { data: userData } = await supabase.auth.getUser();
    const payment = order.payments?.[0];

    if (payment) {
      await supabase
        .from("payments")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          confirmed_by: userData?.user?.id || null,
        })
        .eq("id", payment.id);
    }

    await supabase.from("orders").update({ status: "preparing" }).eq("id", order.id);

    await load();
    setProcessingId(null);
  };

  const advanceShipping = async (order, nextStatus) => {
    setProcessingId(order.id);
    await supabase.from("orders").update({ status: nextStatus }).eq("id", order.id);
    await load();
    setProcessingId(null);
  };

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "");

  if (loading) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (denied)
    return (
      <main style={{ minHeight: "100vh", padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 14, marginTop: 80 }}>このページを見る権限がありません。</p>
        <Link href="/" style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>
          ホームに戻る
        </Link>
      </main>
    );
  if (errorMsg) return <main style={{ padding: 32, color: "#b00" }}>エラー: {errorMsg}</main>;

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 20 }}>注文管理</h1>

      {orders.length === 0 && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>まだ注文がありません</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((o) => {
          const payment = o.payments?.[0];
          const canConfirm = o.status === "payment_reported";
          return (
            <div key={o.id} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {o.customer_profiles?.name || "お名前未設定"}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: canConfirm ? "var(--color-black)" : "#eee",
                    color: canConfirm ? "var(--color-bg)" : "var(--color-black)",
                  }}
                >
                  {STATUS_LABEL[o.status] || o.status}
                </span>
              </div>

              <div style={{ fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 8 }}>
                {new Date(o.created_at).toLocaleString("ja-JP")}
              </div>

              <div style={{ fontSize: 13, marginBottom: 8 }}>
                {o.order_items?.map((item, i) => (
                  <div key={i}>
                    {item.products?.product_translations?.[0]?.name || "(商品名なし)"} × {item.quantity}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>合計 {fmt(o.total_amount)}</div>

              {payment && (
                <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginBottom: 10 }}>
                  報告経路：{payment.report_channel === "zalo" ? "Zalo" : "アプリ内"}
                  {payment.customer_reported_at &&
                    ` ／ 報告日時：${new Date(payment.customer_reported_at).toLocaleString("ja-JP")}`}
                </div>
              )}

              <button
                onClick={() => confirmPayment(o)}
                disabled={!canConfirm || processingId === o.id}
                style={{
                  width: "100%",
                  padding: 12,
                  background: canConfirm ? "var(--color-black)" : "#eee",
                  color: canConfirm ? "var(--color-bg)" : "var(--color-beige-gray)",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 13,
                  cursor: canConfirm ? "pointer" : "default",
                  marginBottom: o.status === "preparing" || o.status === "shipping" ? 8 : 0,
                }}
              >
                {processingId === o.id
                  ? "処理中..."
                  : canConfirm
                  ? "入金確認して発送準備にする"
                  : STATUS_LABEL[o.status] || o.status}
              </button>

              {o.status === "preparing" && (
                <button
                  onClick={() => advanceShipping(o, "shipping")}
                  disabled={processingId === o.id}
                  style={{ width: "100%", padding: 12, background: "var(--color-black)", color: "var(--color-bg)", border: "none", borderRadius: 4, fontSize: 13, cursor: "pointer" }}
                >
                  {processingId === o.id ? "処理中..." : "発送中にする"}
                </button>
              )}

              {o.status === "shipping" && (
                <button
                  onClick={() => advanceShipping(o, "delivered")}
                  disabled={processingId === o.id}
                  style={{ width: "100%", padding: 12, background: "var(--color-black)", color: "var(--color-bg)", border: "none", borderRadius: 4, fontSize: 13, cursor: "pointer" }}
                >
                  {processingId === o.id ? "処理中..." : "配達完了にする"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
