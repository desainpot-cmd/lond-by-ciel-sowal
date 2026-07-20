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

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");

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
        .select("bank_name, bank_account_number, bank_account_holder, bank_transfer_note, payment_confirmation_zalo_url, qr_code_image_url")
        .limit(1)
        .maybeSingle();
      setSettings(settingsData || null);

      setLoading(false);
    };
    if (id) load();
  }, [id]);

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "");

  const finalPrice = (() => {
    if (!product) return 0;
    if (!appliedCoupon) return product.price;
    if (appliedCoupon.discount_type === "percent") {
      const discounted = product.price - Math.round((product.price * appliedCoupon.discount_value) / 100);
      return Math.max(discounted, 0);
    }
    return Math.max(product.price - appliedCoupon.discount_value, 0);
  })();

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponMsg("");

    const code = couponInput.trim().toUpperCase();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !coupon) {
      setCouponMsg("そのクーポンコードは見つかりませんでした");
      setApplyingCoupon(false);
      return;
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      setCouponMsg("このクーポンはまだ利用開始前です");
      setApplyingCoupon(false);
      return;
    }
    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      setCouponMsg("このクーポンの有効期限が切れています");
      setApplyingCoupon(false);
      return;
    }

    if (coupon.usage_limit) {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id);
      if ((count || 0) >= coupon.usage_limit) {
        setCouponMsg("このクーポンは利用上限に達しています");
        setApplyingCoupon(false);
        return;
      }
    }

    setAppliedCoupon(coupon);
    setCouponMsg("クーポンを適用しました");
    setApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMsg("");
  };

  const reportPaid = async (reportChannel = "app") => {
    setErrorMsg("");

    if (deliveryMethod === "delivery") {
      if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
        setErrorMsg("配送先のお名前・電話番号・住所をすべて入力してください");
        return;
      }
    }

    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      router.push("/login");
      return;
    }
    const userId = userData.user.id;

    const { data: existingAppUser } = await supabase
      .from("app_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingAppUser) {
      await supabase.from("app_users").insert({ id: userId, role: "customer" });
    }

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
        total_amount: finalPrice,
        status: "payment_reported",
        coupon_id: appliedCoupon?.id || null,
        delivery_method: deliveryMethod,
        shipping_name: deliveryMethod === "delivery" ? shippingName.trim() : null,
        shipping_phone: deliveryMethod === "delivery" ? shippingPhone.trim() : null,
        shipping_address: deliveryMethod === "delivery" ? shippingAddress.trim() : null,
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
      unit_price: finalPrice,
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
          <p style={{ fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 30 }}>注文番号：{orderId}</p>
          <p style={{ fontSize: 12.5, color: "var(--color-beige-gray)", lineHeight: 1.8, marginBottom: 30 }}>
            入金確認後、発送準備に進みます。今しばらくお待ちください。
          </p>
          <Link
            href={`/delivery/${orderId}`}
            style={{ display: "block", padding: "12px 24px", background: "var(--color-black)", color: "var(--color-bg)", borderRadius: 4, textDecoration: "none", fontSize: 13, marginBottom: 10 }}
          >
            配送状況を見る
          </Link>
          <Link
            href="/proposals"
            style={{ display: "block", padding: "12px 24px", background: "transparent", color: "var(--color-black)", border: "1.5px solid var(--color-black)", borderRadius: 4, textDecoration: "none", fontSize: 13 }}
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
      <Link href={`/products/${id}`} style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← 戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 20, margin: "16px 0 20px" }}>お支払い案内</h1>

      <div style={{ borderBottom: "1px solid var(--color-beige-border)", paddingBottom: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-beige-gray)", marginBottom: 8 }}>
          <span>{t.name}（{product.volume}）</span>
          <span>{fmt(product.price)}</span>
        </div>
        {appliedCoupon && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-accent)", marginBottom: 8 }}>
            <span>クーポン（{appliedCoupon.code}）</span>
            <span>−{fmt(product.price - finalPrice)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 600 }}>
          <span>合計</span>
          <span>{fmt(finalPrice)}</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12.5, color: "var(--color-beige-gray)", marginBottom: 10 }}>受け取り方法</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          {[
            ["pickup", "店頭受け取り"],
            ["delivery", "配送"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDeliveryMethod(value)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 4,
                border: `1.5px solid ${deliveryMethod === value ? "var(--color-black)" : "var(--color-beige-border)"}`,
                background: deliveryMethod === value ? "var(--color-black)" : "transparent",
                color: deliveryMethod === value ? "var(--color-bg)" : "var(--color-black)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {deliveryMethod === "delivery" && (
          <div style={{ marginBottom: 4 }}>
            <p
              style={{
                fontSize: 11.5,
                color: finalPrice >= 500000 ? "var(--color-text)" : "#b00",
                marginBottom: 12,
              }}
            >
              {finalPrice >= 500000 ? "送料無料" : "送料は着払いとなります"}
            </p>

            <input
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              placeholder="お名前"
              style={{ width: "100%", padding: 11, border: "1px solid var(--color-beige-border)", borderRadius: 4, fontSize: 13, boxSizing: "border-box", marginBottom: 10 }}
            />
            <input
              value={shippingPhone}
              onChange={(e) => setShippingPhone(e.target.value)}
              placeholder="電話番号"
              style={{ width: "100%", padding: 11, border: "1px solid var(--color-beige-border)", borderRadius: 4, fontSize: 13, boxSizing: "border-box", marginBottom: 10 }}
            />
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="配送先住所"
              rows={3}
              style={{ width: "100%", padding: 11, border: "1px solid var(--color-beige-border)", borderRadius: 4, fontSize: 13, boxSizing: "border-box", resize: "none" }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        {appliedCoupon ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-beige-light)", borderRadius: 4, padding: "10px 14px" }}>
            <span style={{ fontSize: 13 }}>「{appliedCoupon.code}」を適用中</span>
            <button
              onClick={removeCoupon}
              style={{ fontSize: 12, color: "var(--color-beige-gray)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
            >
              削除
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="クーポンコードをお持ちの方"
              style={{ flex: 1, padding: 11, border: "1px solid var(--color-beige-border)", borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
            />
            <button
              onClick={applyCoupon}
              disabled={applyingCoupon}
              style={{ padding: "0 18px", background: "var(--color-black)", color: "var(--color-bg)", border: "none", borderRadius: 4, fontSize: 13, cursor: "pointer" }}
            >
              {applyingCoupon ? "確認中..." : "適用"}
            </button>
          </div>
        )}
        {couponMsg && <p style={{ fontSize: 11.5, color: appliedCoupon ? "var(--color-text)" : "#b00", marginTop: 6 }}>{couponMsg}</p>}
      </div>

      <p style={{ fontSize: 12.5, color: "var(--color-beige-gray)", marginBottom: 10 }}>以下の口座にお振込みください</p>
      <div style={{ background: "var(--color-beige-light)", borderRadius: 6, padding: 16, fontSize: 13, lineHeight: 2.1, marginBottom: 24 }}>
        <div>銀行名：<b>{settings?.bank_name || "未設定"}</b></div>
        <div>口座番号：<b>{settings?.bank_account_number || "未設定"}</b></div>
        <div>口座名義：<b>{settings?.bank_account_holder || "未設定"}</b></div>
        <div style={{ fontSize: 11, color: "var(--color-beige-gray)", marginTop: 6 }}>
          {settings?.bank_transfer_note || "※振込内容にお名前をご記載ください"}
        </div>
      </div>

      {settings?.qr_code_image_url && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src={settings.qr_code_image_url}
            alt="振込用QRコード"
            style={{ width: 180, height: 180, objectFit: "contain", border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 8 }}
          />
          <p style={{ fontSize: 11, color: "var(--color-beige-gray)", marginTop: 8 }}>QRコードを読み取ってお振込みいただくこともできます</p>
        </div>
      )}

      {errorMsg && <p style={{ fontSize: 13, color: "#b00", marginBottom: 12 }}>{errorMsg}</p>}

      <button
        onClick={() => reportPaid("app")}
        disabled={saving}
        style={{ width: "100%", padding: 15, background: "var(--color-black)", color: "var(--color-bg)", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
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
            color: "var(--color-black)",
            border: "1.5px solid var(--color-black)",
            borderRadius: 4,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Zaloで送金確認を送る
        </a>
      )}

      <p style={{ fontSize: 11, color: "var(--color-beige-gray)", textAlign: "center", marginTop: 10 }}>
        どちらかで報告いただければ、確認後に発送準備に進みます
      </p>
    </main>
  );
}
