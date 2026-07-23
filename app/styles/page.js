"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const LENGTHS = [
  { v: "short", l: "ショート" },
  { v: "medium", l: "ミディアム" },
  { v: "long", l: "ロング" },
];

const SWATCHES = ["#DCEFE3", "#F3E7DA", "#EAE3D5", "#F5EEE0", "#EFE0E0", "#E7ECEF"];

export default function StylesPage() {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLength, setFilterLength] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("hairstyles")
        .select("id, name, price_note, length_category, image_url")
        .order("created_at", { ascending: false });
      setStyles(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = styles.filter((s) => {
    if (filterLength && s.length_category !== filterLength) return false;
    return true;
  });

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 640, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>スタイル一覧</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilterLength("")}
          style={{
            padding: "9px 16px",
            borderRadius: 999,
            border: `1px solid ${filterLength === "" ? "var(--color-black)" : "var(--color-beige-border)"}`,
            background: filterLength === "" ? "var(--color-black)" : "transparent",
            color: filterLength === "" ? "var(--color-bg)" : "var(--color-black)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          すべて
        </button>
        {LENGTHS.map((l) => (
          <button
            key={l.v}
            onClick={() => setFilterLength(l.v)}
            style={{
              padding: "9px 16px",
              borderRadius: 999,
              border: `1px solid ${filterLength === l.v ? "var(--color-black)" : "var(--color-beige-border)"}`,
              background: filterLength === l.v ? "var(--color-black)" : "transparent",
              color: filterLength === l.v ? "var(--color-bg)" : "var(--color-black)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {l.l}
          </button>
        ))}
      </div>

      {loading && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>}
      {!loading && filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>該当するスタイルがありません</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {filtered.map((s, i) => (
          <Link
            key={s.id}
            href={`/styles/${s.id}`}
            style={{ textDecoration: "none", color: "var(--color-text)" }}
          >
            {s.image_url ? (
              <img
                src={s.image_url}
                alt=""
                style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", objectPosition: "top", borderRadius: 4, display: "block" }}
              />
            ) : (
              <div
                style={{
                  background: SWATCHES[i % SWATCHES.length],
                  borderRadius: 4,
                  aspectRatio: "3 / 4",
                }}
              />
            )}

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <div
                style={{
                  fontFamily: "serif",
                  fontSize: 13,
                  letterSpacing: 3,
                  color: "var(--color-black)",
                }}
              >
                LOND BY CIEL SOWAL
              </div>
              <div style={{ fontFamily: "serif", fontSize: 19, marginTop: 10 }}>
                {s.name || "(名称未設定)"}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-beige-gray)", marginTop: 6 }}>
                {LENGTHS.find((l) => l.v === s.length_category)?.l || s.length_category}
                {s.price_note ? ` ・ ${s.price_note}` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
