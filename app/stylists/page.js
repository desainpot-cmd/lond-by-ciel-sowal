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
      <Link href="/" style={{ fontSize: 12, color: "#8a8478", textDecoration: "none" }}>
        ← ホームに戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 22, margin: "16px 0 20px" }}>スタイリスト紹介</h1>

      {loading && <p style={{ fontSize: 13, color: "#8a8478" }}>読み込み中...</p>}

      {!loading && stylists.length === 0 && (
        <p style={{ fontSize: 13, color: "#8a8478" }}>現在、紹介できるスタイリスト情報がありません。</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 30 }}>
        {stylists.map((s) => (
          <div key={s.id} style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              {s.photo_url ? (
                <img
                  src={s.photo_url}
                  alt={s.display_name}
                  style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0ede5", flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{s.display_name}</div>
                {s.years_experience && (
                  <div style={{ fontSize: 11.5, color: "#8a8478", marginTop: 3 }}>経験{s.years_experience}年</div>
                )}
              </div>
            </div>

            {s.specialties?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {s.specialties.map((sp) => (
                  <span
                    key={sp}
                    style={{ fontSize: 10.5, border: "1px solid #e6e1d6", borderRadius: 999, padding: "4px 10px", color: "#8a8478" }}
                  >
                    {sp}
                  </span>
                ))}
              </div>
            )}

            {s.bio && <p style={{ fontSize: 12, color: "#8a8478", lineHeight: 1.7, marginBottom: s.instagram_url ? 10 : 0 }}>{s.bio}</p>}

            {s.instagram_url && (
              <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: "#b8926b" }}>
                Instagramを見る →
              </a>
            )}
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
            background: "#1b1b1b",
            color: "#fff",
            borderRadius: 4,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          {bookingLink.booking_link_label || "オンラインブッキングへ進む"}
        </a>
      ) : (
        <p style={{ fontSize: 11.5, color: "#8a8478", textAlign: "center" }}>
          予約リンクは準備中です。サロンまで直接お問い合わせください。
        </p>
      )}
      <p style={{ fontSize: 10.5, color: "#8a8478", textAlign: "center", marginTop: 8 }}>
        ※サロン共通の予約先です
      </p>
    </main>
  );
}
