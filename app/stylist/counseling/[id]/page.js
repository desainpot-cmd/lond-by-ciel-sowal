"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import { getMyRole } from "../../../../lib/roleGuard";

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
  const [denied, setDenied] = useState(false);

  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [usage, setUsage] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const loadRecord = async () => {
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

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, volume, price, category, product_translations(name, usage_text)")
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const loadRecommendations = async () => {
    const { data } = await supabase
      .from("stylist_recommendations")
      .select("id, usage_instruction, comment, created_at, products(id, product_translations(name))")
      .eq("counseling_id", id)
      .order("created_at", { ascending: false });
    setRecommendations(data || []);
  };

  const loadPhotos = async () => {
    const { data } = await supabase
      .from("counseling_photos")
      .select("id, angle, image_url, concern_tag")
      .eq("counseling_id", id);
    setPhotos(data || []);
  };

  useEffect(() => {
    const init = async () => {
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

      if (id) {
        loadRecord();
        loadProducts();
        loadRecommendations();
        loadPhotos();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const markReviewed = async () => {
    await supabase.from("counseling_records").update({ status: "reviewed" }).eq("id", id);
    setRecord((r) => ({ ...r, status: "reviewed" }));
  };

  const onSelectProduct = (productId) => {
    setSelectedProductId(productId);
    const p = products.find((p) => p.id === productId);
    setUsage(p?.product_translations?.[0]?.usage_text || "");
  };

  const submitProposal = async () => {
    if (!selectedProductId) {
      setSaveMsg("商品を選択してください");
      return;
    }
    setSaving(true);
    setSaveMsg("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    // 既にapp_usersに登録済みなら role は上書きしない（admin等が stylist に戻されるのを防ぐ）
    const { data: existingAppUser } = await supabase
      .from("app_users")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (!existingAppUser) {
      await supabase.from("app_users").insert({ id: userId, role: "stylist" });
    }

    let { data: stylistProfile } = await supabase
      .from("stylist_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let stylistId = stylistProfile?.id;

    if (!stylistId) {
      const { data: newStylist, error: stylistError } = await supabase
        .from("stylist_profiles")
        .insert({ user_id: userId, display_name: userData?.user?.email || "スタイリスト" })
        .select()
        .single();
      if (stylistError) {
        setSaveMsg("エラー（スタイリスト情報作成）: " + stylistError.message);
        setSaving(false);
        return;
      }
      stylistId = newStylist.id;
    }

    const { error: recError } = await supabase.from("stylist_recommendations").insert({
      counseling_id: id,
      stylist_id: stylistId,
      product_id: selectedProductId,
      usage_instruction: usage,
      comment,
    });

    if (recError) {
      setSaveMsg("エラー（提案の保存）: " + recError.message);
      setSaving(false);
      return;
    }

    await supabase.from("counseling_records").update({ status: "proposed" }).eq("id", id);
    setRecord((r) => ({ ...r, status: "proposed" }));

    setSelectedProductId("");
    setUsage("");
    setComment("");
    setSaveMsg("提案を保存しました");
    await loadRecommendations();
    setSaving(false);
  };

  if (loading) return <main style={{ padding: 32 }}>読み込み中...</main>;
  if (denied)
    return (
      <main style={{ minHeight: "100vh", padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 14, marginTop: 80 }}>このページを見る権限がありません。</p>
        <Link href="/" style={{ fontSize: 13, color: "#8a8478" }}>
          ホームに戻る
        </Link>
      </main>
    );
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

      {photos.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 8 }}>アップロードされた写真</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {photos.map((p) => (
              <div key={p.id} style={{ textAlign: "center" }}>
                <img
                  src={p.image_url}
                  alt={p.angle}
                  style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 6, display: "block", marginBottom: 4 }}
                />
                <span style={{ fontSize: 10.5, color: "#8a8478" }}>
                  {p.angle === "side" ? "横" : p.angle === "back" ? "後ろ" : "気になる箇所"}
                  {p.concern_tag ? `（${p.concern_tag}）` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
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

      <h2 style={{ fontFamily: "serif", fontSize: 18, marginBottom: 12 }}>商品を提案する</h2>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: "#8a8478", display: "block", marginBottom: 8 }}>商品を選択</label>
        <select
          value={selectedProductId}
          onChange={(e) => onSelectProduct(e.target.value)}
          style={{ width: "100%", padding: 12, border: "1px solid #ccc", borderRadius: 4, fontSize: 14, marginBottom: 16 }}
        >
          <option value="">選択してください</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.product_translations?.[0]?.name || "(名称未設定)"}（{p.volume}）
            </option>
          ))}
        </select>

        <label style={{ fontSize: 12, color: "#8a8478", display: "block", marginBottom: 8 }}>
          使用方法（お客様に合わせて編集できます）
        </label>
        <textarea
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: 12, border: "1px solid #ccc", borderRadius: 4, fontSize: 14, marginBottom: 16, boxSizing: "border-box", resize: "none" }}
        />

        <label style={{ fontSize: 12, color: "#8a8478", display: "block", marginBottom: 8 }}>お客様へのコメント</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="例：広がりが気になるとのことなので、まずはこちらから試してみてください。"
          style={{ width: "100%", padding: 12, border: "1px solid #ccc", borderRadius: 4, fontSize: 14, marginBottom: 16, boxSizing: "border-box", resize: "none" }}
        />

        <button
          onClick={submitProposal}
          disabled={saving}
          style={{ width: "100%", padding: 14, background: "#1b1b1b", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
        >
          {saving ? "送信中..." : "この提案を送る"}
        </button>
        {saveMsg && <p style={{ fontSize: 13, marginTop: 10 }}>{saveMsg}</p>}
      </div>

      {recommendations.length > 0 && (
        <>
          <h2 style={{ fontFamily: "serif", fontSize: 16, marginBottom: 10 }}>これまでの提案</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recommendations.map((r) => (
              <div key={r.id} style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  {r.products?.product_translations?.[0]?.name || "(商品名なし)"}
                </div>
                <div style={{ fontSize: 12, color: "#8a8478", marginBottom: 4 }}>{r.usage_instruction}</div>
                <div style={{ fontSize: 12 }}>{r.comment}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
