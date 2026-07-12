"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { getMyRole } from "../../../lib/roleGuard";
import { uploadBannerPhoto } from "../../../lib/uploadBannerPhoto";

const EMPTY = {
  imageUrl: "",
  link_url: "",
  display_order: "",
  is_active: true,
  start_at: "",
  end_at: "",
};

export default function AdminBannersPage() {
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [banners, setBanners] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const loadBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("display_order", { ascending: true });
    setBanners(data || []);
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
      loadBanners();
    };
    init();
  }, []);

  const handleImageChange = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    setSaveMsg("");
    try {
      const url = await uploadBannerPhoto(file);
      set("imageUrl", url);
    } catch (err) {
      setSaveMsg("エラー（画像アップロード）: " + err.message);
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");

    if (!form.imageUrl) {
      setSaveMsg("バナー画像をアップロードしてください");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("banners").insert({
      image_url: form.imageUrl,
      link_url: form.link_url || null,
      display_order: form.display_order ? Number(form.display_order) : 0,
      is_active: form.is_active,
      start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
      end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
    });

    if (error) {
      setSaveMsg("エラー: " + error.message);
    } else {
      setSaveMsg("バナーを登録しました");
      setForm(EMPTY);
      await loadBanners();
    }
    setSaving(false);
  };

  const toggleActive = async (banner) => {
    await supabase.from("banners").update({ is_active: !banner.is_active }).eq("id", banner.id);
    await loadBanners();
  };

  const handleDelete = async (id) => {
    if (!confirm("このバナーを削除しますか？")) return;
    await supabase.from("banners").delete().eq("id", id);
    await loadBanners();
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

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 20 }}>バナー管理</h1>

      <form onSubmit={handleSubmit} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 18, marginBottom: 30 }}>
        <label style={label}>バナー画像</label>
        {form.imageUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <img src={form.imageUrl} alt="" style={{ width: 100, height: 56, objectFit: "cover", borderRadius: 6 }} />
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

        <label style={label}>リンク先URL（任意）</label>
        <input value={form.link_url} onChange={(e) => set("link_url", e.target.value)} style={inputStyle} placeholder="例：/products" />

        <label style={label}>表示順（数字が小さいほど先に表示）</label>
        <input
          value={form.display_order}
          onChange={(e) => set("display_order", e.target.value.replace(/[^0-9]/g, ""))}
          style={inputStyle}
          placeholder="例：1"
        />

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={label}>掲載開始日（任意）</label>
            <input type="date" value={form.start_at} onChange={(e) => set("start_at", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>掲載終了日（任意）</label>
            <input type="date" value={form.end_at} onChange={(e) => set("end_at", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <label style={{ ...label, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
          公開する
        </label>

        {saveMsg && <p style={{ fontSize: 13, color: saveMsg.startsWith("エラー") ? "#b00" : "var(--color-text)", margin: "12px 0" }}>{saveMsg}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", padding: 14, background: "var(--color-black)", color: "var(--color-bg)", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer", marginTop: 8 }}
        >
          {saving ? "登録中..." : "このバナーを登録する"}
        </button>
      </form>

      <h2 style={{ fontFamily: "serif", fontSize: 16, marginBottom: 12 }}>登録済みのバナー</h2>
      {loadingList && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>}
      {!loadingList && banners.length === 0 && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>まだバナーがありません</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {banners.map((b) => (
          <div key={b.id} style={{ border: "1px solid var(--color-beige-border)", borderRadius: 6, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
            <img src={b.image_url} alt="" style={{ width: 70, height: 40, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5 }}>表示順：{b.display_order} {b.link_url ? `・ リンク先：${b.link_url}` : ""}</div>
              <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginTop: 2 }}>{b.is_active ? "公開中" : "非公開"}</div>
            </div>
            <button
              onClick={() => toggleActive(b)}
              style={{ fontSize: 11.5, color: "var(--color-black)", background: "none", border: "1px solid var(--color-beige-border)", borderRadius: 4, padding: "6px 10px", cursor: "pointer" }}
            >
              {b.is_active ? "非公開にする" : "公開する"}
            </button>
            <button
              onClick={() => handleDelete(b.id)}
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
