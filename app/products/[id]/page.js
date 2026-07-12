"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [tab, setTab] = useState("desc");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, volume, price, stock, category, image_url, product_translations(name, description, usage_text)")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "");

  if (loading) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (errorMsg) return <main style={{ padding: 32, color: "#b00" }}>エラー: {errorMsg}</main>;
  if (!product) return <main style={{ padding: 32 }}>商品が見つかりません</main>;

  const t = product.product_translations?.[0] || {};

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/proposals" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← 戻る
      </Link>

      {product.image_url ? (
        <img
          src={product.image_url}
          alt=""
          style={{ width: "100%", aspectRatio: "1.2", objectFit: "cover", borderRadius: 6, margin: "16px 0", display: "block" }}
        />
      ) : (
        <div style={{ background: "#f0ede5", borderRadius: 6, aspectRatio: "1.2", margin: "16px 0" }} />
      )}

      <h1 style={{ fontFamily: "serif", fontSize: 21, marginBottom: 8 }}>{t.name || "(商品名なし)"}</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{fmt(product.price)}</div>
        <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)" }}>
          {product.volume} ・ {product.stock > 0 ? "在庫あり" : "在庫なし"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          ["desc", "説明"],
          ["usage", "使用方法"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 999,
              border: `1px solid ${tab === key ? "var(--color-black)" : "var(--color-beige-border)"}`,
              background: tab === key ? "var(--color-black)" : "transparent",
              color: tab === key ? "var(--color-bg)" : "var(--color-black)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: "var(--color-beige-gray)", lineHeight: 1.8, minHeight: 70, marginBottom: 24 }}>
        {tab === "desc" ? t.description : t.usage_text}
      </p>

      <button
        onClick={() => router.push(`/checkout/${product.id}`)}
        disabled={product.stock <= 0}
        style={{
          width: "100%",
          padding: 15,
          background: product.stock > 0 ? "var(--color-black)" : "var(--color-beige-border)",
          color: "var(--color-bg)",
          border: "none",
          borderRadius: 4,
          fontSize: 14,
          cursor: product.stock > 0 ? "pointer" : "default",
        }}
      >
        {product.stock > 0 ? "購入手続きに進む" : "在庫がありません"}
      </button>
    </main>
  );
}
