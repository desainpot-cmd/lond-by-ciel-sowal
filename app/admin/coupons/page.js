"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { getMyRole } from "../../../lib/roleGuard";

const EMPTY = {
  code: "",
  discount_type: "percent",
  discount_value: "",
  valid_from: "",
  valid_to: "",
  usage_limit: "",
};

export default function AdminCouponsPage() {
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const loadCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("valid_from", { ascending: false });
    setCoupons(data || []);
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
      loadCoupons();
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");

    if (!form.code.trim()) {
      setSaveMsg("クーポンコードを入力してください");
      setSaving(false);
      return;
    }
    if (!form.discount_value) {
      setSaveMsg("割引額（率）を入力してください");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
    });

    if (error) {
      setSaveMsg("エラー: " + error.message);
    } else {
      setSaveMsg("クーポンを作成しました");
      setForm(EMPTY);
      await loadCoupons();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("このクーポンを削除しますか？")) return;
    await supabase.from("coupons").delete().eq("id", id);
    await loadCoupons();
  };

  const fmtDiscount = (c) => (c.discount_type === "percent" ? `${c.discount_value}%オフ` : `${Number(c.discount_value).toLocaleString("vi-VN")} VND オフ`);
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("ja-JP") : "指定なし");

  const inputStyle = { width: "100%", padding: 12, border: "1px solid var(--color-beige-border)", borderRadius: 4, fontSize: 14, marginBottom: 16, boxSizing: "border-box" };
  const label = { fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 6, display: "block" };

  if (checking) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (denied)
    return (
      <main style={{ minHeight: "100vh", padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 14, marginTop: 80 }}>このページを見る権限がありません。</p>
        <Link href="/" style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>
          ホームに戻る
        </Link>
      </main>
    );

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 20 }}>クーポン管理</h1>

      <form onSubmit={handleSubmit} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 18, marginBottom: 30 }}>
        <label style={label}>クーポンコード</label>
        <input value={form.code} onChange={(e) => set("code", e.target.value)} style={inputStyle} placeholder="例：WELCOME10" />

        <label style={label}>割引タイプ</label>
        <select value={form.discount_type} onChange={(e) => set("discount_type", e.target.value)} style={inputStyle}>
          <option value="percent">パーセント（%）割引</option>
          <option value="fixed">固定額（VND）割引</option>
        </select>

        <label style={label}>{form.discount_type === "percent" ? "割引率（%）" : "割引額（VND）"}</label>
        <input
          value={form.discount_value}
          onChange={(e) => set("discount_value", e.target.value.replace(/[^0-9]/g, ""))}
          style={inputStyle}
          placeholder={form.discount_type === "percent" ? "例：10" : "例：50000"}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={label}>有効開始日（任意）</label>
            <input type="date" value={form.valid_from} onChange={(e) => set("valid_from", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>有効終了日（任意）</label>
            <input type="date" value={form.valid_to} onChange={(e) => set("valid_to", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <label style={label}>利用上限回数（任意・空欄で無制限）</label>
        <input
          value={form.usage_limit}
          onChange={(e) => set("usage_limit", e.target.value.replace(/[^0-9]/g, ""))}
          style={inputStyle}
          placeholder="例：100"
        />

        {saveMsg && <p style={{ fontSize: 13, color: saveMsg.startsWith("エラー") ? "#b00" : "var(--color-text)", marginBottom: 12 }}>{saveMsg}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", padding: 14, background: "var(--color-black)", color: "var(--color-bg)", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
        >
          {saving ? "作成中..." : "このクーポンを作成する"}
        </button>
      </form>

      <h2 style={{ fontFamily: "serif", fontSize: 16, marginBottom: 12 }}>登録済みのクーポン</h2>
      {loadingList && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>}
      {!loadingList && coupons.length === 0 && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>まだクーポンがありません</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {coupons.map((c) => (
          <div key={c.id} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.code}</div>
              <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginTop: 2 }}>
                {fmtDiscount(c)} ・ {fmtDate(c.valid_from)}〜{fmtDate(c.valid_to)} ・ 上限{c.usage_limit ?? "無制限"}
              </div>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
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
