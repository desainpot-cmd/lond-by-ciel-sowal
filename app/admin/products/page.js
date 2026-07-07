"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { getMyRole } from "../../../lib/roleGuard";

const CATEGORIES = [
  { v: "shampoo", l: "シャンプー" },
  { v: "treatment", l: "トリートメント" },
  { v: "scalp", l: "頭皮ケア" },
  { v: "styling", l: "スタイリング剤" },
  { v: "oil", l: "ヘアオイル" },
  { v: "coloring", l: "カラー後のケア" },
];

const EMPTY = {
  name: "",
  description: "",
  usage_text: "",
  category: "shampoo",
  volume: "",
  price: "",
  stock: "",
};

export default function AdminProductsPage() {
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, category, volume, price, stock, created_at, product_translations(name)")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoadingList(false);
  };

  useEffect(() => {
    const init = async () => {
      const { userId, role } = await getMyRole();
      if (!userId) {
        window.location.href = "/login";
        return;
      }
      if (role !== "admin") {
        setDenied(true);
        setChecking(false);
        return;
      }
      setChecking(false);
      loadProducts();
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");

    if (!form.name.trim()) {
      setSaveMsg("商品名を入力してください");
      setSaving(false);
      return;
    }

    const { data: newProduct, error: productError } = await supabase
      .from("products")
      .insert({
        category: form.category,
        volume: form.volume,
        price: form.price ? Number(form.price) : 0,
        stock: form.stock ? Number(form.stock) : 0,
      })
      .select()
      .single();

    if (productError) {
      setSaveMsg("エラー（商品作成）: " + productError.message);
      setSaving(false);
      return;
    }

    const { error: translationError } = await supabase.from("product_translations").insert({
      product_id: newProduct.id,
      locale: "vi",
      name: form.name,
      description: form.description,
      usage_text: form.usage_text,
    });

    if (translationError) {
      setSaveMsg("エラー（商品情報の保存）: " + translationError.message);
      setSaving(false);
      return;
    }

    setSaveMsg("商品を登録しました");
    setForm(EMPTY);
    await loadProducts();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("この商品を削除しますか？")) return;
    await supabase.from("products").delete().eq("id", id);
    await loadProducts();
  };

  const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "0 VND");

  const inputStyle = { width: "100%", padding: 12, border: "1px solid #ccc", borderRadius: 4, fontSize: 14, marginBottom: 16, boxSizing: "border-box" };
  const label = { fontSize: 12, color: "#8a8478", marginBottom: 6, display: "block" };

  if (checking) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (denied)
    return (
      <main style={{ minHeight: "100vh", padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 14, marginTop: 80 }}>このページを見る権限がありません。</p>
        <Link href="/" style={{ fontSize: 13, color: "#8a8478" }}>
          ホームに戻る
        </Link>
      </main>
    );

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 20 }}>商品登録</h1>

      <form onSubmit={handleSubmit} style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 18, marginBottom: 30 }}>
        <label style={label}>カテゴリ</label>
        <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
          {CATEGORIES.map((c) => (
            <option key={c.v} value={c.v}>
              {c.l}
            </option>
          ))}
        </select>

        <label style={label}>商品名</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} placeholder="例：モイストリペア シャンプー" />

        <label style={label}>商品説明</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
          placeholder="どんな商品か、簡単に説明してください"
        />

        <label style={label}>使用方法</label>
        <textarea
          value={form.usage_text}
          onChange={(e) => set("usage_text", e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
          placeholder="標準的な使い方（スタイリストが提案時に編集できます）"
        />

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={label}>容量</label>
            <input value={form.volume} onChange={(e) => set("volume", e.target.value)} style={inputStyle} placeholder="例：250ml" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>価格（VND）</label>
            <input
              value={form.price}
              onChange={(e) => set("price", e.target.value.replace(/[^0-9]/g, ""))}
              style={inputStyle}
              placeholder="例：320000"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>在庫数</label>
            <input
              value={form.stock}
              onChange={(e) => set("stock", e.target.value.replace(/[^0-9]/g, ""))}
              style={inputStyle}
              placeholder="例：10"
            />
          </div>
        </div>

        {saveMsg && <p style={{ fontSize: 13, color: saveMsg.startsWith("エラー") ? "#b00" : "#1b1b1b", marginBottom: 12 }}>{saveMsg}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", padding: 14, background: "#1b1b1b", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
        >
          {saving ? "登録中..." : "この商品を登録する"}
        </button>
      </form>

      <h2 style={{ fontFamily: "serif", fontSize: 16, marginBottom: 12 }}>登録済みの商品</h2>
      {loadingList && <p style={{ fontSize: 13, color: "#8a8478" }}>読み込み中...</p>}
      {!loadingList && products.length === 0 && <p style={{ fontSize: 13, color: "#8a8478" }}>まだ商品が登録されていません</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.product_translations?.[0]?.name || "(名称未設定)"}</div>
              <div style={{ fontSize: 11.5, color: "#8a8478", marginTop: 2 }}>
                {p.volume} ・ {fmt(p.price)} ・ 在庫{p.stock}
              </div>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              style={{ fontSize: 11.5, color: "#b00", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
