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

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push("/counseling");
        return;
      }
      setChecking(false);
      loadBanners();
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

          <Link
            href="/products"
            style={{
              color: "var(--color-text)",
              fontSize: "clamp(10px, 1.6vw, 13px)",
              textDecoration: "underline",
              whiteSpace: "nowrap",
            }}
          >
            商品一覧を見る
          </Link>

          <Link
            href="/stylists"
            style={{
              color: "var(--color-text)",
              fontSize: "clamp(10px, 1.6vw, 13px)",
              textDecoration: "underline",
              whiteSpace: "nowrap",
            }}
          >
            スタイリスト紹介を見る
          </Link>
        </div>
      </div>

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
