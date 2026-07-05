"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { getMyRole } from "../../lib/roleGuard";

const STATUS_LABEL = {
  pending: "未対応",
  reviewed: "確認済み",
  proposed: "提案済み",
};

export default function StylistListPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { userId, role } = await getMyRole();

      if (!userId) {
        router.push("/login");
        return;
      }

      if (role !== "stylist" && role !== "admin") {
        setDenied(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("counseling_records")
        .select("id, created_at, status, counseling_type, hair_type, concerns, desired_result, customer_profiles(name, age, gender)")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setRecords(data || []);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (denied) {
    return (
      <main style={{ minHeight: "100vh", padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 14, marginTop: 80 }}>このページを見る権限がありません。</p>
        <Link href="/" style={{ fontSize: 13, color: "#8a8478" }}>
          ホームに戻る
        </Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 20 }}>カウンセリング一覧</h1>

      {loading && <p style={{ fontSize: 13, color: "#8a8478" }}>読み込み中...</p>}
      {errorMsg && <p style={{ fontSize: 13, color: "#b00" }}>エラー: {errorMsg}</p>}
      {!loading && records.length === 0 && (
        <p style={{ fontSize: 13, color: "#8a8478" }}>まだカウンセリングがありません</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {records.map((r) => {
          const isHairstyle = r.counseling_type === "hairstyle";
          return (
            <Link
              key={r.id}
              href={isHairstyle ? `/stylist/hairstyle/${r.id}` : `/stylist/counseling/${r.id}`}
              style={{
                display: "block",
                border: "1px solid #e6e1d6",
                borderRadius: 6,
                padding: 16,
                textDecoration: "none",
                color: "#1b1b1b",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {r.customer_profiles?.name || "お名前未設定"}
                </span>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: "3px 9px",
                      borderRadius: 999,
                      background: isHairstyle ? "#b8926b" : "#e6e1d6",
                      color: isHairstyle ? "#fff" : "#1b1b1b",
                    }}
                  >
                    {isHairstyle ? "髪型" : "商品"}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: r.status === "pending" ? "#1b1b1b" : "#eee",
                      color: r.status === "pending" ? "#fff" : "#1b1b1b",
                    }}
                  >
                    {STATUS_LABEL[r.status] || r.status}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#8a8478" }}>
                {new Date(r.created_at).toLocaleString("ja-JP")}
              </div>
              {isHairstyle && r.desired_result && (
                <div style={{ fontSize: 12, color: "#8a8478", marginTop: 4 }}>
                  なりたいイメージ：{r.desired_result}
                </div>
              )}
              {!isHairstyle && r.concerns?.length > 0 && (
                <div style={{ fontSize: 12, color: "#8a8478", marginTop: 4 }}>
                  悩み：{r.concerns.join("、")}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
