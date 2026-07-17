"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function CounselingChoicePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 28,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 16px" }}>
        {userId && (
          <Link href="/proposals" style={{ color: "var(--color-text)", fontSize: 12, textDecoration: "underline" }}>
            あなたへの提案を見る
          </Link>
        )}
        {userId && (
          <Link href="/history" style={{ color: "var(--color-text)", fontSize: 12, textDecoration: "underline" }}>
            購入履歴を見る
          </Link>
        )}
        <Link href="/products" style={{ color: "var(--color-text)", fontSize: 12, textDecoration: "underline" }}>
          商品一覧を見る
        </Link>
        <Link href="/stylists" style={{ color: "var(--color-text)", fontSize: 12, textDecoration: "underline" }}>
          スタイリスト紹介を見る
        </Link>
      </div>

      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 8 }}>
          今日は何をしたいですか？
        </h1>
        <p style={{ fontSize: 12.5, color: "var(--color-beige-gray)" }}>あなたに合った内容をご案内します</p>
      </div>

      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>
        <Link
          href="/counseling/product"
          style={{
            display: "block",
            padding: 22,
            border: "1px solid var(--color-beige-border)",
            borderRadius: 8,
            textDecoration: "none",
            color: "var(--color-text)",
          }}
        >
          <div style={{ fontFamily: "serif", fontSize: 17, marginBottom: 6 }}>商品を探す</div>
          <div style={{ fontSize: 12, color: "var(--color-beige-gray)", lineHeight: 1.7 }}>
            髪質に合ったシャンプー・トリートメントなどをご提案します
          </div>
        </Link>

        <Link
          href="/counseling/hairstyle"
          style={{
            display: "block",
            padding: 22,
            border: "1px solid var(--color-beige-border)",
            borderRadius: 8,
            textDecoration: "none",
            color: "var(--color-text)",
          }}
        >
          <div style={{ fontFamily: "serif", fontSize: 17, marginBottom: 6 }}>髪型の相談をする</div>
          <div style={{ fontSize: 12, color: "var(--color-beige-gray)", lineHeight: 1.7 }}>
            なりたい髪型を伝えて、スタイリストからメニュー・料金の提案を受けられます
          </div>
        </Link>
      </div>

      {userId && (
        <button
          onClick={handleLogout}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            background: "var(--color-black)",
            color: "var(--color-bg)",
            padding: "10px 18px",
            borderRadius: 999,
            border: "none",
            fontSize: 12,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          ログアウト
        </button>
      )}
    </main>
  );
}
