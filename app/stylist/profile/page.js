"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { getMyRole } from "../../../lib/roleGuard";
import { uploadStylistPhoto } from "../../../lib/uploadStylistPhoto";

const EMPTY = {
  id: null,
  display_name: "",
  photo_url: "",
  bio: "",
  specialties: "",
  years_experience: "",
  instagram_url: "",
};

export default function StylistProfilePage() {
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    const init = async () => {
      const { userId: uid, role } = await getMyRole();
      if (!uid) {
        window.location.href = "/login";
        return;
      }
      if (role !== "stylist" && role !== "admin") {
        setDenied(true);
        setChecking(false);
        return;
      }
      setUserId(uid);
      setChecking(false);

      const { data: userData } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (data) {
        setForm({
          id: data.id,
          display_name: data.display_name || "",
          photo_url: data.photo_url || "",
          bio: data.bio || "",
          specialties: (data.specialties || []).join("、"),
          years_experience: data.years_experience || "",
          instagram_url: data.instagram_url || "",
        });
      } else {
        setForm((prev) => ({ ...prev, display_name: userData?.user?.email || "" }));
      }
    };
    init();
  }, []);

  const handlePhotoChange = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    setSaveMsg("");
    try {
      const url = await uploadStylistPhoto(file);
      set("photo_url", url);
    } catch (err) {
      setSaveMsg("エラー（画像アップロード）: " + err.message);
    }
    setUploadingPhoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");

    const specialtiesArray = form.specialties
      .split(/[、,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      display_name: form.display_name,
      photo_url: form.photo_url || null,
      bio: form.bio,
      specialties: specialtiesArray,
      years_experience: form.years_experience ? Number(form.years_experience) : null,
      instagram_url: form.instagram_url,
    };

    let error;
    if (form.id) {
      const { error: updateError } = await supabase.from("stylist_profiles").update(payload).eq("id", form.id);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from("stylist_profiles")
        .insert({ ...payload, user_id: userId })
        .select()
        .single();
      error = insertError;
      if (data) set("id", data.id);
    }

    if (error) {
      setSaveMsg("エラー: " + error.message);
    } else {
      setSaveMsg("保存しました");
    }
    setSaving(false);
  };

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
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/stylist" style={{ fontSize: 12, color: "#8a8478", textDecoration: "none" }}>
        ← カウンセリング一覧に戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>プロフィール編集</h1>
      <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 20, lineHeight: 1.8 }}>
        ここで編集した内容は、お客様向けの「スタイリスト紹介ページ」に反映されます。
      </p>

      <form onSubmit={handleSubmit}>
        <label style={label}>お名前（表示名）</label>
        <input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} style={inputStyle} placeholder="例：グエン・タオ" />

        <label style={label}>プロフィール写真</label>
        {form.photo_url ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <img src={form.photo_url} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover" }} />
            <button
              type="button"
              onClick={() => set("photo_url", "")}
              style={{ fontSize: 12, color: "#8a8478", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
            >
              削除してやり直す
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e.target.files?.[0])}
            disabled={uploadingPhoto}
            style={{ fontSize: 12, marginBottom: 16 }}
          />
        )}
        {uploadingPhoto && <p style={{ fontSize: 11, color: "#8a8478", marginBottom: 16 }}>アップロード中...</p>}

        <label style={label}>経験年数</label>
        <input
          value={form.years_experience}
          onChange={(e) => set("years_experience", e.target.value.replace(/[^0-9]/g, ""))}
          style={inputStyle}
          placeholder="例：8"
        />

        <label style={label}>得意分野（読点や,で区切って複数入力可）</label>
        <input
          value={form.specialties}
          onChange={(e) => set("specialties", e.target.value)}
          style={inputStyle}
          placeholder="例：ダメージケア、縮毛矯正、カラー"
        />

        <label style={label}>自己紹介</label>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "none" }}
          placeholder="お客様に向けた一言コメントやこだわりなど"
        />

        <label style={label}>Instagram URL（任意）</label>
        <input
          value={form.instagram_url}
          onChange={(e) => set("instagram_url", e.target.value)}
          style={inputStyle}
          placeholder="例：https://instagram.com/xxxxx"
        />

        {saveMsg && <p style={{ fontSize: 13, color: saveMsg.startsWith("エラー") ? "#b00" : "#1b1b1b", marginBottom: 12 }}>{saveMsg}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", padding: 14, background: "#1b1b1b", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </form>
    </main>
  );
}
