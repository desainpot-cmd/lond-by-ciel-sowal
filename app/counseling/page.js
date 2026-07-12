"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function CounselingChoicePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
        return;
      }
      setChecking(false);
    };
    check();
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
        padding: 24,
        gap: 28,
      }}
    >
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
    </main>
  );
}
