"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

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
        justifyContent: "center",
        gap: 24,
        padding: 24,
        textAlign: "center",
      }}
    >
      {banners.length > 0 && (
        <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
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

      <div>
        <h1 style={{ fontFamily: "serif", fontSize: 28, marginBottom: 4 }}>
          Lond by Ciel Sowal
        </h1>
        <p style={{ color: "var(--color-beige-gray)", fontSize: 13 }}>
          ONLINE HAIR COUNSELING（開発中）
        </p>
      </div>

      <Link
        href="/login"
        style={{
          background: "var(--color-black)",
          color: "var(--color-bg)",
          padding: "14px 28px",
          borderRadius: 4,
          textDecoration: "none",
          fontSize: 14,
        }}
      >
        ログイン / 会員登録
      </Link>

      <Link
        href="/products"
        style={{
          color: "var(--color-text)",
          fontSize: 13,
          textDecoration: "underline",
        }}
      >
        商品一覧を見る
      </Link>

      <Link
        href="/stylists"
        style={{
          color: "var(--color-text)",
          fontSize: 13,
          textDecoration: "underline",
        }}
      >
        スタイリスト紹介を見る
      </Link>
    </main>
  );
}
