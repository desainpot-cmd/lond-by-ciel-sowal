"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function StylistsPage() {
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLink, setBookingLink] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: stylistData } = await supabase
        .from("stylist_profiles")
        .select("id, display_name, photo_url, bio, specialties, years_experience, instagram_url")
        .order("created_at", { ascending: true });
      setStylists(stylistData || []);

      const { data: settings } = await supabase
        .from("salon_settings")
        .select("booking_link_url, booking_link_label")
        .limit(1)
        .maybeSingle();
      setBookingLink(settings || null);

      setLoading(false);
    };
    load();
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "var(--color-beige-gray)", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 32px", textAlign: "center" }}>スタイリスト紹介</h1>

      {loading && <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>}

      {!loading && stylists.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>現在、紹介できるスタイリスト情報がありません。</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 56, marginBottom: 40 }}>
        {stylists.map((s) => (
          <div key={s.id}>
            {s.photo_url ? (
              <img
                src={s.photo_url}
                alt={s.display_name}
                style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", objectPosition: "top", borderRadius: 4, display: "block" }}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "3 / 4", background: "var(--color-beige-light)", borderRadius: 4 }} />
            )}

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ fontFamily: "serif", fontSize: 9, letterSpacing: 1.5, color: "var(--color-black)" }}>
                LOND BY CIEL SOWAL
              </div>
              <div style={{ fontFamily: "serif", fontSize: 22, marginTop: 8 }}>{s.display_name}</div>
              {s.years_experience && (
                <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginTop: 4 }}>経験{s.years_experience}年</div>
              )}

              {s.specialties?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 14 }}>
                  {s.specialties.map((sp) => (
                    <span
                      key={sp}
                      style={{
                        fontSize: 10.5,
                        border: "1px solid var(--color-beige-border)",
                        borderRadius: 999,
                        padding: "4px 12px",
                        color: "var(--color-beige-gray)",
                      }}
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              )}

              {s.bio && (
                <p style={{ fontSize: 12.5, color: "var(--color-beige-gray)", lineHeight: 1.8, marginTop: 16 }}>{s.bio}</p>
              )}

              {s.instagram_url && (
                <a
                  href={s.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", fontSize: 11.5, color: "var(--color-accent)", marginTop: 12 }}
                >
                  Instagramを見る →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {bookingLink?.booking_link_url ? (
        <a
          href={bookingLink.booking_link_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: 15,
            background: "var(--color-black)",
            color: "var(--color-bg)",
            borderRadius: 4,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          {bookingLink.booking_link_label || "オンラインブッキングへ進む"}
        </a>
      ) : (
        <p style={{ fontSize: 11.5, color: "var(--color-beige-gray)", textAlign: "center" }}>
          予約リンクは準備中です。サロンまで直接お問い合わせください。
        </p>
      )}
      <p style={{ fontSize: 10.5, color: "var(--color-beige-gray)", textAlign: "center", marginTop: 8 }}>
        ※サロン共通の予約先です
      </p>
    </main>
  );
}
