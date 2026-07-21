"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { getMyRole } from "../../../lib/roleGuard";
import { uploadStylePhoto } from "../../../lib/uploadStylePhoto";

const LENGTHS = [
  { v: "short", l: "ショート" },
  { v: "medium", l: "ミディアム" },
  { v: "long", l: "ロング" },
];

const EMPTY = {
  name: "",
  description: "",
  price_note: "",
  length_category: "short",
  imageUrl: "",
};

export default function AdminStylesPage() {
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [styles, setStyles] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filterLength, setFilterLength] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleImageChange = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    setSaveMsg("");
    try {
      const url = await uploadStylePhoto(file);
      set("imageUrl", url);
    } catch (err) {
      setSaveMsg("エラー（画像アップロード）: " + err.message);
    }
    setUploadingImage(false);
  };

  const loadStyles = async () => {
    const { data } = await supabase
      .from("hairstyles")
      .select("id, name, description, price_note, length_category, image_url, created_at")
      .order("created_at", { ascending: false });
    setStyles(data || []);
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
      loadStyles();
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");

    if (!form.name.trim()) {
      setSaveMsg("スタイル名を入力してください");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("hairstyles").insert({
      name: form.name.trim(),
      description: form.description || null,
      price_note: form.price_note || null,
      length_category: form.length_category,
      image_url: form.imageUrl || null,
    });

    if (error) {
      setSaveMsg("エラー（スタイル登録）: " + error.message);
      setSaving(false);
      return;
    }

    setSaveMsg("スタイルを登録しました");
    setForm(EMPTY);
    await loadStyles();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("このスタイルを削除しますか？")) return;
    await supabase.from("hairstyles").delete().eq("id", id);
    await loadStyles();
  };

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

  const filteredStyles = styles.filter((s) => {
    if (filterLength && s.length_category !== filterLength) return false;
    return true;
  });

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 20 }}>スタイル登録</h1>

      <form onSubmit={handleSubmit} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 18, marginBottom: 30 }}>
        <label style={label}>スタイル写真</label>
        {form.imageUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <img src={form.imageUrl} alt="スタイル写真" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }} />
            <button
              type="button"
              onClick={() => set("imageUrl", "")}
              style={{ fontSize: 12, color: "var(--color-beige-gray)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
            >
              削除してやり直す
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0])}
            disabled={uploadingImage}
            style={{ fontSize: 12, marginBottom: 16 }}
          />
        )}
        {uploadingImage && <p style={{ fontSize: 11, color: "var(--color-beige-gray)", marginBottom: 16 }}>アップロード中...</p>}

        <label style={label}>長さ区分</label>
        <select value={form.length_category} onChange={(e) => set("length_category", e.target.value)} style={inputStyle}>
          {LENGTHS.map((l) => (
            <option key={l.v} value={l.v}>
              {l.l}
            </option>
          ))}
        </select>

        <label style={label}>スタイル名</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} placeholder="例：ゆるふわウェーブボブ" />

        <label style={label}>説明</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
          placeholder="どんなスタイルか、簡単に説明してください"
        />

        <label style={label}>料金目安</label>
        <input
          value={form.price_note}
          onChange={(e) => set("price_note", e.target.value)}
          style={inputStyle}
          placeholder="例：60万〜80万VND"
        />

        {saveMsg && <p style={{ fontSize: 13, color: saveMsg.startsWith("エラー") ? "#b00" : "var(--color-text)", marginBottom: 12 }}>{saveMsg}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", padding: 14, background: "var(--color-black)", color: "var(--color-bg)", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
        >
          {saving ? "登録中..." : "このスタイルを登録する"}
        </button>
      </form>

      <h2 style={{ fontFamily: "serif", fontSize: 16, marginBottom: 12 }}>登録済みのスタイル</h2>

      <div style={{ marginBottom: 16 }}>
        <select value={filterLength} onChange={(e) => setFilterLength(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }}>
          <option value="">すべての長さ</option>
          {LENGTHS.map((l) => (
            <option key={l.v} value={l.v}>
              {l.l}
            </option>
          ))}
        </select>
      </div>

      {loadingList && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>}
      {!loadingList && filteredStyles.length === 0 && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>該当するスタイルがありません</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredStyles.map((s) => (
          <div key={s.id} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {s.image_url && (
                <img src={s.image_url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name || "(名称未設定)"}</div>
                <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginTop: 2 }}>
                  {LENGTHS.find((l) => l.v === s.length_category)?.l || s.length_category}
                  {s.price_note ? ` ・ ${s.price_note}` : ""}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
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
