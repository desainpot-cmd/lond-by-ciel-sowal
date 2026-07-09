"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { getMyRole } from "../../../lib/roleGuard";
import { uploadSalonAsset } from "../../../lib/uploadSalonAsset";

const EMPTY = {
  id: null,
  booking_link_url: "",
  booking_link_label: "",
  bank_name: "",
  bank_account_number: "",
  bank_account_holder: "",
  bank_transfer_note: "",
  payment_confirmation_zalo_url: "",
  qr_code_image_url: "",
};

export default function SalonSettingsPage() {
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

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

      const { data } = await supabase.from("salon_settings").select("*").limit(1).maybeSingle();
      if (data) {
        setForm({ ...EMPTY, ...data });
      }
    };
    init();
  }, []);

  const handleQrChange = async (file) => {
    if (!file) return;
    setUploadingQr(true);
    setSaveMsg("");
    try {
      const url = await uploadSalonAsset(file);
      set("qr_code_image_url", url);
    } catch (err) {
      setSaveMsg("エラー（画像アップロード）: " + err.message);
    }
    setUploadingQr(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");

    const payload = {
      booking_link_url: form.booking_link_url,
      booking_link_label: form.booking_link_label,
      bank_name: form.bank_name,
      bank_account_number: form.bank_account_number,
      bank_account_holder: form.bank_account_holder,
      bank_transfer_note: form.bank_transfer_note,
      payment_confirmation_zalo_url: form.payment_confirmation_zalo_url,
      qr_code_image_url: form.qr_code_image_url || null,
    };

    let error;
    if (form.id) {
      const { error: updateError } = await supabase.from("salon_settings").update(payload).eq("id", form.id);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase.from("salon_settings").insert(payload).select().single();
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
  const sectionTitle = { fontSize: 13, fontWeight: 600, color: "#8a8478", margin: "24px 0 12px" };

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
      <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 20 }}>サロン設定</h1>
      <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 20, lineHeight: 1.8 }}>
        ここで設定した内容は、全スタイリストの紹介ページ・お支払い案内画面に共通で反映されます。
      </p>

      <form onSubmit={handleSubmit}>
        <p style={sectionTitle}>予約リンク</p>
        <label style={label}>予約先URL（Zalo公式アカウント・電話番号ページ等）</label>
        <input
          value={form.booking_link_url}
          onChange={(e) => set("booking_link_url", e.target.value)}
          style={inputStyle}
          placeholder="例：https://zalo.me/xxxxxxxxx"
        />
        <label style={label}>ボタンの表示名</label>
        <input
          value={form.booking_link_label}
          onChange={(e) => set("booking_link_label", e.target.value)}
          style={inputStyle}
          placeholder="例：Zaloでサロンを予約する"
        />

        <p style={sectionTitle}>振込先（銀行振込）</p>
        <label style={label}>銀行名</label>
        <input value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} style={inputStyle} placeholder="例：Vietcombank" />
        <label style={label}>口座番号</label>
        <input
          value={form.bank_account_number}
          onChange={(e) => set("bank_account_number", e.target.value)}
          style={inputStyle}
          placeholder="例：0123 4567 8901"
        />
        <label style={label}>口座名義</label>
        <input
          value={form.bank_account_holder}
          onChange={(e) => set("bank_account_holder", e.target.value)}
          style={inputStyle}
          placeholder="例：CIEL SOWAL SALON"
        />
        <label style={label}>振込時の注記</label>
        <textarea
          value={form.bank_transfer_note}
          onChange={(e) => set("bank_transfer_note", e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
          placeholder="例：振込内容に注文番号をご記載ください"
        />

        <label style={label}>振込用QRコード画像（任意）</label>
        {form.qr_code_image_url ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <img src={form.qr_code_image_url} alt="QRコード" style={{ width: 90, height: 90, objectFit: "contain", borderRadius: 6, border: "1px solid #eee" }} />
            <button
              type="button"
              onClick={() => set("qr_code_image_url", "")}
              style={{ fontSize: 12, color: "#8a8478", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
            >
              削除してやり直す
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleQrChange(e.target.files?.[0])}
            disabled={uploadingQr}
            style={{ fontSize: 12, marginBottom: 16 }}
          />
        )}
        {uploadingQr && <p style={{ fontSize: 11, color: "#8a8478", marginBottom: 16 }}>アップロード中...</p>}

        <p style={sectionTitle}>Zaloでの入金確認（任意）</p>
        <label style={label}>入金確認用Zalo URL</label>
        <input
          value={form.payment_confirmation_zalo_url}
          onChange={(e) => set("payment_confirmation_zalo_url", e.target.value)}
          style={inputStyle}
          placeholder="例：https://zalo.me/xxxxxxxxx"
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
