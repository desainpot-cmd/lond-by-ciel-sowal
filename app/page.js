"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [banners, setBanners] = useState([]);

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
    loadBanners();
  }, []);

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
        <p style={{ color: "#8a8478", fontSize: 13 }}>
          ONLINE HAIR COUNSELING（開発中）
        </p>
      </div>

      <Link
        href="/login"
        style={{
          background: "#1b1b1b",
          color: "#fff",
          padding: "14px 28px",
          borderRadius: 4,
          textDecoration: "none",
          fontSize: 14,
        }}
      >
        ログイン / 会員登録
      </Link>

      <Link
        href="/proposals"
        style={{
          color: "#1b1b1b",
          fontSize: 13,
          textDecoration: "underline",
        }}
      >
        あなたへの提案を見る
      </Link>

      <Link
        href="/products"
        style={{
          color: "#1b1b1b",
          fontSize: 13,
          textDecoration: "underline",
        }}
      >
        商品一覧を見る
      </Link>

      <Link
        href="/stylists"
        style={{
          color: "#1b1b1b",
          fontSize: 13,
          textDecoration: "underline",
        }}
      >
        スタイリスト紹介を見る
      </Link>

      <Link
        href="/history"
        style={{
          color: "#1b1b1b",
          fontSize: 13,
          textDecoration: "underline",
        }}
      >
        購入履歴を見る
      </Link>
    </main>
  );
}
