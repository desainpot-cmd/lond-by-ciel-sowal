"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const PRODUCT_ILLUSTRATION_URL =
  "https://momnqutyqwzynfooxabv.supabase.co/storage/v1/object/public/salon-assets/cards/product-search-illustration-cropped.png";
const HAIRSTYLE_ILLUSTRATION_URL =
  "https://momnqutyqwzynfooxabv.supabase.co/storage/v1/object/public/salon-assets/cards/hair-consultation-illustration-cropped.png";

export default function CounselingChoicePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    checkUser();

    const loadSettings = async () => {
      const { data } = await supabase
        .from("salon_settings")
        .select("booking_link_url, booking_link_label, payment_confirmation_zalo_url, google_maps_url")
        .limit(1)
        .maybeSingle();
      setSettings(data || null);
    };
    loadSettings();
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
        <Link href="/styles" style={{ color: "var(--color-text)", fontSize: 12, textDecoration: "underline" }}>
          スタイルを見る
        </Link>
        <Link href="/stylists" style={{ color: "var(--color-text)", fontSize: 12, textDecoration: "underline" }}>
          スタイリスト紹介を見る
        </Link>
      </div>

      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 10 }}>
          今日は何を相談しますか？
        </h1>
        <p style={{ fontSize: 12.5, color: "var(--color-beige-gray)", lineHeight: 1.8, marginBottom: 12 }}>
          ヘアスタイル・ヘアケア商品を、美容師に無料で相談できます。
        </p>
        <div style={{ fontSize: 12, color: "var(--color-beige-gray)", lineHeight: 2 }}>
          <div>✓ 登録不要</div>
          <div>✓ 無料カウンセリング</div>
          <div>✓ いつでも気軽に利用可能</div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>
        <Link
          href="/counseling/product"
          style={{
            display: "flex",
            alignItems: "stretch",
            minHeight: 160,
            background: "var(--color-beige-light)",
            borderRadius: 12,
            textDecoration: "none",
            color: "var(--color-text)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: "1 1 50%",
              padding: "clamp(20px, 4vw, 40px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontFamily: "serif", fontSize: "clamp(19px, 3vw, 26px)", marginBottom: 10 }}>商品を探す</div>
            <div style={{ fontSize: 13, color: "var(--color-beige-gray)", lineHeight: 1.8 }}>
              髪質に合ったシャンプー・トリートメントなどをご提案します
            </div>
            <div style={{ marginTop: 20, fontSize: 18, color: "var(--color-black)" }}>›</div>
          </div>
          <div style={{ flex: "1 1 50%", position: "relative", minWidth: 0 }}>
            <img
              src={PRODUCT_ILLUSTRATION_URL}
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </Link>

        <Link
          href="/counseling/hairstyle"
          style={{
            display: "flex",
            alignItems: "stretch",
            minHeight: 160,
            background: "var(--color-bg)",
            border: "1px solid var(--color-beige-border)",
            borderRadius: 12,
            textDecoration: "none",
            color: "var(--color-text)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: "1 1 50%",
              padding: "clamp(20px, 4vw, 40px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontFamily: "serif", fontSize: "clamp(19px, 3vw, 26px)", marginBottom: 10 }}>髪型の相談をする</div>
            <div style={{ fontSize: 13, color: "var(--color-beige-gray)", lineHeight: 1.8 }}>
              なりたい髪型を伝えて、スタイリストからメニュー・料金の提案を受けられます
            </div>
            <div style={{ marginTop: 20, fontSize: 18, color: "var(--color-black)" }}>›</div>
          </div>
          <div style={{ flex: "1 1 50%", position: "relative", minWidth: 0 }}>
            <img
              src={HAIRSTYLE_ILLUSTRATION_URL}
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </Link>
      </div>

      {userId && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
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
                padding: "10px 18px",
                borderRadius: 999,
                fontSize: 12,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
                padding: "10px 18px",
                borderRadius: 999,
                fontSize: 12,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
                padding: "10px 18px",
                borderRadius: 999,
                fontSize: 12,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                whiteSpace: "nowrap",
              }}
            >
              地図で見る
            </a>
          )}
          <button
            onClick={handleLogout}
            style={{
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
        </div>
      )}
    </main>
  );
}
