"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

const HERO_IMAGE_URL =
  "https://momnqutyqwzynfooxabv.supabase.co/storage/v1/object/public/salon-assets/hero/54B4C766-DE62-4D49-AB00-62D4AF332640.JPEG";

export default function Home() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("id, image_url, link_url, start_at, end_at")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      const now = new Date();
      const visible = (data || []).filter((b) => {
        if (b.start_at && new Date(b.start_at) > now) return false;
        if (b.end_at && new Date(b.end_at) < now) return false;
        return true;
      });
      setBanners(visible);
    };

    const loadSettings = async () => {
      const { data } = await supabase
        .from("salon_settings")
        .select("booking_link_url, booking_link_label, payment_confirmation_zalo_url, google_maps_url")
        .limit(1)
        .maybeSingle();
      setSettings(data || null);
    };

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push("/counseling");
        return;
      }
      setChecking(false);
      loadBanners();
      loadSettings();
    };
    checkUser();
  }, [router]);

  if (checking) {
    return (
      <main style={{ minHeight: "100vh", padding: 32 }}>
        <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 2",
          overflow: "hidden",
        }}
      >
        <img
          src={HERO_IMAGE_URL}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "6%",
            transform: "translateY(-50%)",
            width: "38%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "clamp(10px, 2.5vw, 20px)",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <h1
              style={{
                fontFamily: "serif",
                fontSize: "clamp(22px, 7vw, 56px)",
                lineHeight: 1.08,
                margin: 0,
                color: "var(--color-black)",
              }}
            >
              Lond by Ciel Sowal
            </h1>
            <p
              style={{
                fontFamily: "serif",
                color: "var(--color-black)",
                fontSize: "clamp(12px, 2.2vw, 18px)",
                marginTop: 8,
              }}
            >
              あなたにもっと似合うを
            </p>
            <p
              style={{
                color: "var(--color-beige-gray)",
                fontSize: "clamp(9px, 1.6vw, 13px)",
                marginTop: 10,
                letterSpacing: 0.5,
              }}
            >
              ONLINE HAIR COUNSELING（開発中）
            </p>
          </div>

          <Link
            href="/login"
            style={{
              background: "var(--color-black)",
              color: "var(--color-bg)",
              padding: "clamp(7px, 1.8vw, 14px) clamp(12px, 3.2vw, 28px)",
              borderRadius: 4,
              textDecoration: "none",
              fontSize: "clamp(10px, 1.8vw, 14px)",
              whiteSpace: "nowrap",
            }}
          >
            ログイン / 会員登録
          </Link>

          {[
            { href: "/products", label: "商品一覧を見る" },
            { href: "/styles", label: "スタイルを見る" },
            { href: "/stylists", label: "スタイリスト紹介を見る" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid var(--color-black)",
                borderRadius: 999,
                padding: "clamp(6px, 1.4vw, 10px) clamp(12px, 2.6vw, 18px)",
                color: "var(--color-black)",
                fontSize: "clamp(9px, 1.5vw, 12.5px)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                letterSpacing: 0.3,
              }}
            >
              {item.label}
              <span style={{ fontSize: "1.1em" }}>›</span>
            </Link>
          ))}
        </div>
      </div>

      {(settings?.payment_confirmation_zalo_url || settings?.booking_link_url || settings?.google_maps_url) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            padding: "24px 24px 0",
          }}
        >
          {settings?.payment_confirmation_zalo_url && (
            <a
              href={settings.payment_confirmation_zalo_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--color-black)",
                color: "var(--color-bg)",
                borderRadius: 999,
                padding: "10px 18px",
                fontSize: 13,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Zaloで問い合わせ
            </a>
          )}
          {settings?.booking_link_url && (
            <a
              href={settings.booking_link_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--color-black)",
                color: "var(--color-bg)",
                borderRadius: 999,
                padding: "10px 18px",
                fontSize: 13,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {settings.booking_link_label || "オンライン予約"}
            </a>
          )}
          {settings?.google_maps_url && (
            <a
              href={settings.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--color-black)",
                color: "var(--color-bg)",
                borderRadius: 999,
                padding: "10px 18px",
                fontSize: 13,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              地図で見る
            </a>
          )}
        </div>
      )}

      {banners.length > 0 && (
        <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10, padding: 24 }}>
          {banners.map((b) =>
            b.link_url ? (
              <Link key={b.id} href={b.link_url}>
                <img src={b.image_url} alt="" style={{ width: "100%", borderRadius: 6, display: "block" }} />
              </Link>
            ) : (
              <img key={b.id} src={b.image_url} alt="" style={{ width: "100%", borderRadius: 6, display: "block" }} />
            )
          )}
        </div>
      )}
    </main>
  );
}
