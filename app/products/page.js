"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const CATEGORIES = [
  { v: "shampoo", l: "シャンプー" },
  { v: "treatment", l: "トリートメント" },
  { v: "scalp", l: "頭皮ケア" },
  { v: "styling", l: "スタイリング剤" },
  { v: "oil", l: "ヘアオイル" },
  { v: "coloring", l: "カラー後のケア" },
];

const SWATCHES = ["#DCEFE3", "#F3E7DA", "#EAE3D5", "#F5EEE0", "#EFE0E0", "#E7ECEF"];

const parseVolume = (v) => {
  const m = String(v || "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
};

// 同じブランド+商品名の容量違いを1枚のカードにまとめ、在庫がある中で一番小さい容量を代表にする
const dedupeByVariantGroup = (products) => {
  const groups = new Map();
  for (const p of products) {
    const name = p.product_translations?.[0]?.name || p.id;
    const key = `${p.brand_id || "none"}::${name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  const representatives = [];
  for (const variants of groups.values()) {
    const sorted = [...variants].sort((a, b) => parseVolume(a.volume) - parseVolume(b.volume));
    const inStock = sorted.find((v) => v.stock > 0);
    const rep = inStock || sorted[0];
    representatives.push({ ...rep, allVolumes: sorted.map((v) => v.volume) });
  }
  return representatives;
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBrandId, setFilterBrandId] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: brandData } = await supabase.from("brands").select("id, name").order("name");
      setBrands(brandData || []);

      const { data: productData } = await supabase
        .from("products")
        .select("id, category, volume, price, stock, brand_id, image_url, brands(name), product_translations(name)")
        .order("created_at", { ascending: false });
      setProducts(productData || []);
      setLoading(false);
    };
    load();
  }, []);

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "");

  const filtered = dedupeByVariantGroup(products).filter((p) => {
    if (p.stock <= 0) return false;
    if (filterBrandId && p.brand_id !== filterBrandId) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  const pillStyle = (selected) => ({
    padding: "9px 16px",
    borderRadius: 999,
    border: `1px solid ${selected ? "var(--color-black)" : "var(--color-beige-border)"}`,
    background: selected ? "var(--color-black)" : "transparent",
    color: selected ? "var(--color-bg)" : "var(--color-black)",
    fontSize: 13,
    cursor: "pointer",
  });

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 640, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>商品一覧</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => setFilterBrandId("")} style={pillStyle(filterBrandId === "")}>
          すべてのブランド
        </button>
        {brands.map((b) => (
          <button key={b.id} onClick={() => setFilterBrandId(b.id)} style={pillStyle(filterBrandId === b.id)}>
            {b.name}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={() => setFilterCategory("")} style={pillStyle(filterCategory === "")}>
          すべてのカテゴリ
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.v} onClick={() => setFilterCategory(c.v)} style={pillStyle(filterCategory === c.v)}>
            {c.l}
          </button>
        ))}
      </div>

      {loading && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>}
      {!loading && filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>該当する商品がありません</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {filtered.map((p, i) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            style={{ textDecoration: "none", color: "var(--color-text)" }}
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt=""
                style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 6, marginBottom: 8, display: "block" }}
              />
            ) : (
              <div
                style={{
                  background: SWATCHES[i % SWATCHES.length],
                  borderRadius: 6,
                  aspectRatio: "1",
                  marginBottom: 8,
                }}
              />
            )}
            {p.brands?.name && (
              <div style={{ fontSize: 10.5, color: "var(--color-beige-gray)", marginBottom: 2 }}>{p.brands.name}</div>
            )}
            <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>
              {p.product_translations?.[0]?.name || "(名称未設定)"}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-beige-gray)", marginBottom: 2 }}>
              {p.allVolumes.join(" ")}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {fmt(p.price)}
              {p.allVolumes.length > 1 && "〜"}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
