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

  const filtered = products.filter((p) => {
    if (filterBrandId && p.brand_id !== filterBrandId) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  const selectStyle = {
    flex: 1,
    padding: 11,
    border: "1px solid var(--color-beige-border)",
    borderRadius: 4,
    fontSize: 13,
    background: "var(--color-bg)",
  };

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 640, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>商品一覧</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <select value={filterBrandId} onChange={(e) => setFilterBrandId(e.target.value)} style={selectStyle}>
          <option value="">すべてのブランド</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={selectStyle}>
          <option value="">すべてのカテゴリ</option>
          {CATEGORIES.map((c) => (
            <option key={c.v} value={c.v}>
              {c.l}
            </option>
          ))}
        </select>
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
            <div style={{ fontSize: 11, color: "var(--color-beige-gray)", marginBottom: 2 }}>{p.volume}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(p.price)}</div>
            {p.stock <= 0 && (
              <div style={{ fontSize: 10.5, color: "#b00", marginTop: 2 }}>在庫なし</div>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
