"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

const LENGTH_LABELS = {
  short: "ショート",
  medium: "ミディアム",
  long: "ロング",
};

export default function StyleDetailPage() {
  const { id } = useParams();
  const [style, setStyle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("hairstyles")
        .select("id, name, description, price_note, length_category, image_url")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setStyle(data);
      }
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  if (loading) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (errorMsg) return <main style={{ padding: 32, color: "#b00" }}>エラー: {errorMsg}</main>;
  if (!style) return <main style={{ padding: 32 }}>スタイルが見つかりません</main>;

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/styles" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← 戻る
      </Link>

      {style.image_url ? (
        <img
          src={style.image_url}
          alt=""
          style={{ width: "100%", aspectRatio: "1.2", objectFit: "cover", objectPosition: "top", borderRadius: 6, margin: "16px 0", display: "block" }}
        />
      ) : (
        <div style={{ background: "#f0ede5", borderRadius: 6, aspectRatio: "1.2", margin: "16px 0" }} />
      )}

      <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginBottom: 6 }}>
        {LENGTH_LABELS[style.length_category] || style.length_category}
      </div>

      <h1 style={{ fontFamily: "serif", fontSize: 21, marginBottom: 8 }}>{style.name || "(スタイル名なし)"}</h1>

      {style.price_note && (
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{style.price_note}</div>
      )}

      {style.description && (
        <p style={{ fontSize: 13, color: "var(--color-beige-gray)", lineHeight: 1.8, marginBottom: 24 }}>
          {style.description}
        </p>
      )}

      <Link
        href="/counseling/hairstyle"
        style={{
          display: "block",
          textAlign: "center",
          width: "100%",
          padding: 15,
          background: "var(--color-black)",
          color: "var(--color-bg)",
          borderRadius: 4,
          fontSize: 14,
          textDecoration: "none",
          boxSizing: "border-box",
        }}
      >
        このスタイルについて相談する
      </Link>
    </main>
  );
}
