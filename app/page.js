"use client";

import Link from "next/link";

export default function Home() {
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
    </main>
  );
}
