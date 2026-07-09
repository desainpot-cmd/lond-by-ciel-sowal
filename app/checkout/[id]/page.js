"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, price, volume, product_translations(name)")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setProduct(data);
      }

      const { data: settingsData } = await supabase
        .from("salon_settings")
        .select("bank_name, bank_account_number, bank_account_holder, bank_transfer_note, payment_confirmation_zalo_url")
        .limit(1)
        .maybeSingle();
      setSettings(settingsData || null);

      setLoading(false);
    };
    if (id) load();
  }, [id]);

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "");

  const reportPaid = async (reportChannel = "app") => {
    setSaving(true);
    setErrorMsg("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      router.push("/login");
      return;
    }
    const userId = userData.user.id;

    let { data: profile } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from("customer_profiles")
        .insert({ user_id: userId })
        .select()
        .single();
      if (profileError) {
        setErrorMsg("エラー（プロフィール作成）: " + profileError.message);
        setSaving(false);
        return;
      }
      profile = newProfile;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: profile.id,
        total_amount: product.price,
        status: "payment_reported",
      })
      .select()
      .single();

    if (orderError) {
      setErrorMsg("エラー（注文作成）: " + orderError.message);
      setSaving(false);
      return;
    }

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      quantity: 1,
      unit_price: product.price,
    });

    await supabase.from("payments").insert({
      order_id: order.id,
      method: "bank_transfer",
      status: "reported",
      report_channel: reportChannel,
      customer_reported_at: new Date().toISOString(),
    });

    setOrderId(order.id);
    setDone(true);
    setSaving(false);
  };

  if (loading) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (!product) return <main style={{ padding: 32, color: "#b00" }}>{errorMsg || "商品が見つかりません"}</main>;

  if (done) {
    return (
      <main style={{ minHeight: "100vh", padding: 32, maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ marginTop: 80 }}>
          <h1 style={{ fontFamily: "serif", fontSize: 20, marginBottom: 10 }}>ご注文ありがとうございます</h1>
          <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 30 }}>注文番号：{orderId}</p>
          <p style={{ fontSize: 12.5, color: "#8a8478", lineHeight: 1.8, marginBottom: 30 }}>
            入金確認後、発送準備に進みます。今しばらくお待ちください。
          </p>
          <Link
            href="/proposals"
            style={{ display: "inline-block", padding: "12px 24px", background: "#1b1b1b", color: "#fff", borderRadius: 4, textDecoration: "none", fontSize: 13 }}
          >
            提案一覧に戻る
          </Link>
        </div>
      </main>
    );
  }

  const t = product.product_translations?.[0] || {};

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href={`/products/${id}`} style={{ fontSize: 12, color: "#8a8478", textDecoration: "none" }}>
        ← 戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 20, margin: "16px 0 20px" }}>お支払い案内</h1>

      <div style={{ borderBottom: "1px solid #e6e1d6", paddingBottom: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8a8478", marginBottom: 8 }}>
          <span>{t.name}（{product.volume}）</span>
          <span>{fmt(product.price)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 600 }}>
          <span>合計</span>
          <span>{fmt(product.price)}</span>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: "#8a8478", marginBottom: 10 }}>以下の口座にお振込みください</p>
      <div style={{ background: "#f7f4ee", borderRadius: 6, padding: 16, fontSize: 13, lineHeight: 2.1, marginBottom: 24 }}>
        <div>銀行名：<b>{settings?.bank_name || "未設定"}</b></div>
        <div>口座番号：<b>{settings?.bank_account_number || "未設定"}</b></div>
        <div>口座名義：<b>{settings?.bank_account_holder || "未設定"}</b></div>
        <div style={{ fontSize: 11, color: "#8a8478", marginTop: 6 }}>
          {settings?.bank_transfer_note || "※振込内容にお名前をご記載ください"}
        </div>
      </div>

      {errorMsg && <p style={{ fontSize: 13, color: "#b00", marginBottom: 12 }}>{errorMsg}</p>}

      <button
        onClick={() => reportPaid("app")}
        disabled={saving}
        style={{ width: "100%", padding: 15, background: "#1b1b1b", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
      >
        {saving ? "処理中..." : "アプリ内で「振込みました」と報告"}
      </button>

      {settings?.payment_confirmation_zalo_url && (
        <a
          href={settings.payment_confirmation_zalo_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => reportPaid("zalo")}
          style={{
            display: "block",
            textAlign: "center",
            padding: 13,
            marginTop: 10,
            background: "transparent",
            color: "#1b1b1b",
            border: "1.5px solid #1b1b1b",
            borderRadius: 4,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Zaloで送金確認を送る
        </a>
      )}

      <p style={{ fontSize: 11, color: "#8a8478", textAlign: "center", marginTop: 10 }}>
        どちらかで報告いただければ、確認後に発送準備に進みます
      </p>
    </main>
  );
}
