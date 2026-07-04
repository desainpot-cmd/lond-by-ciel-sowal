"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";

const LABELS = {
  hair_length: { short: "ショート", medium: "ミディアム", long: "ロング", very_long: "超ロング" },
  hair_type: { straight: "直毛", wavy: "くせ毛", curly: "強いくせ" },
  hair_thickness: { fine: "細い", medium: "普通", thick: "太い" },
  hair_volume: { few: "少ない", medium: "普通", many: "多い" },
  gender: { female: "女性", male: "男性", other: "その他/回答しない" },
  period: { within_3m: "3ヶ月以内", "3_6m": "半年以内", "6_12m": "1年以内", over_1y: "1年以上前" },
};

const INTEREST_LABEL = {
  shampoo: "シャンプー",
  treatment: "トリートメント",
  scalp: "頭皮ケア",
  styling: "スタイリング剤",
  oil: "ヘアオイル",
  coloring: "カラー後のケア",
};

function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0ede5" }}>
      <span style={{ fontSize: 12, color: "#8a8478" }}>{label}</span>
      <span style={{ fontSize: 13, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

export default function StylistCounselingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("counseling_records")
        .select("*, customer_profiles(name, age, gender, phone)")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setRecord(data);
      }
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  const markReviewed = async () => {
    await supabase.from("counseling_records").update({ status: "reviewed" }).eq("id", id);
    setRecord((r) => ({ ...r, status: "reviewed" }));
  };

  if (loading) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (errorMsg) return <main style={{ padding: 32, color: "#b00" }}>エラー: {errorMsg}</main>;
  if (!record) return <main style={{ padding: 32 }}>データが見つかりません</main>;

  const c = record.customer_profiles || {};

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 560, margin: "0 auto" }}>
      <Link href="/stylist" style={{ fontSize: 12, color: "#8a8478", textDecoration: "none" }}>
        ← 一覧に戻る
      </Link>

      <h1 style={{ fontFamily: "serif", fontSize: 20, margin: "14px 0 4px" }}>
        {c.name || "お名前未設定"} 様
      </h1>
      <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 20 }}>
        {new Date(record.created_at).toLocaleString("ja-JP")}
      </p>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        <Row label="年齢" value={c.age ? `${c.age}歳` : null} />
        <Row label="性別" value={LABELS.gender[c.gender]} />
        <Row label="電話番号" value={c.phone} />
      </div>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        <Row
          label="お探しの商品"
          value={record.product_interests?.map((v) => INTEREST_LABEL[v] || v).join("、")}
        />
        <Row label="髪の長さ" value={LABELS.hair_length[record.hair_length]} />
        <Row label="髪質" value={LABELS.hair_type[record.hair_type]} />
        <Row label="太さ" value={LABELS.hair_thickness[record.hair_thickness]} />
        <Row label="毛量" value={LABELS.hair_volume[record.hair_volume]} />
        <Row label="ダメージレベル" value={record.damage_level ? `${record.damage_level} / 5` : null} />
      </div>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        <Row
          label="ブリーチ"
          value={record.bleach_history === true ? `あり（${LABELS.period[record.bleach_last_done] || "-"}）` : record.bleach_history === false ? "なし" : null}
        />
        <Row
          label="パーマ"
          value={record.perm_history === true ? `あり（${LABELS.period[record.perm_last_done] || "-"}）` : record.perm_history === false ? "なし" : null}
        />
        <Row
          label="縮毛矯正/ストレート"
          value={
            record.straight_perm_history === true
              ? `あり（${LABELS.period[record.straight_perm_last_done] || "-"}）`
              : record.straight_perm_history === false
              ? "なし"
              : null
          }
        />
      </div>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        <Row label="悩み" value={record.concerns?.join("、")} />
        <Row label="希望の仕上がり" value={record.desired_result} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={markReviewed}
          disabled={record.status !== "pending"}
          style={{
            flex: 1,
            padding: 14,
            background: record.status === "pending" ? "#1b1b1b" : "#eee",
            color: record.status === "pending" ? "#fff" : "#8a8478",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            cursor: record.status === "pending" ? "pointer" : "default",
          }}
        >
          {record.status === "pending" ? "確認済みにする" : "確認済み"}
        </button>
      </div>
    </main>
  );
}
