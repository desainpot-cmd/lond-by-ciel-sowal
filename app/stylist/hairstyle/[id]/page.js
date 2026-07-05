"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0ede5" }}>
      <span style={{ fontSize: 12, color: "#8a8478" }}>{label}</span>
      <span style={{ fontSize: 13, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

const fmt = (n) => (n ? Number(n).toLocaleString("vi-VN") + " VND" : "0 VND");

export default function StylistHairstyleDetailPage() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [preferredStylistName, setPreferredStylistName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [denied, setDenied] = useState(false);

  const [menus, setMenus] = useState([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [proposals, setProposals] = useState([]);

  const loadRecord = async () => {
    const { data, error } = await supabase
      .from("counseling_records")
      .select("*, customer_profiles(name, age, gender, phone)")
      .eq("id", id)
      .single();

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }
    setRecord(data);

    if (data.preferred_stylist_id) {
      const { data: stylistData } = await supabase
        .from("stylist_profiles")
        .select("display_name")
        .eq("id", data.preferred_stylist_id)
        .maybeSingle();
      setPreferredStylistName(stylistData?.display_name || null);
    }
    setLoading(false);
  };

  const loadMenus = async () => {
    const { data } = await supabase
      .from("menus")
      .select("id, category, name, price, price_note")
      .eq("is_active", true)
      .order("category");
    setMenus(data || []);
  };

  const loadProposals = async () => {
    const { data } = await supabase
      .from("stylist_menu_proposals")
      .select("id, menu_ids, total_price, comment, created_at")
      .eq("counseling_id", id)
      .order("created_at", { ascending: false });
    setProposals(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const { userId, role } = await getMyRole();
      if (!userId) {
        window.location.href = "/login";
        return;
      }
      if (role !== "stylist" && role !== "admin") {
        setDenied(true);
        setLoading(false);
        return;
      }
      if (id) {
        loadRecord();
        loadMenus();
        loadProposals();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleMenu = (menuId) => {
    setSelectedMenuIds((prev) => (prev.includes(menuId) ? prev.filter((x) => x !== menuId) : [...prev, menuId]));
  };

  const totalPrice = menus
    .filter((m) => selectedMenuIds.includes(m.id))
    .reduce((sum, m) => sum + Number(m.price), 0);

  const markReviewed = async () => {
    await supabase.from("counseling_records").update({ status: "reviewed" }).eq("id", id);
    setRecord((r) => ({ ...r, status: "reviewed" }));
  };

  const submitProposal = async () => {
    if (selectedMenuIds.length === 0) {
      setSaveMsg("メニューを1つ以上選択してください");
      return;
    }
    setSaving(true);
    setSaveMsg("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data: existingAppUser } = await supabase
      .from("app_users")
      .select("id")
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

    const { error: proposalError } = await supabase.from("stylist_menu_proposals").insert({
      counseling_id: id,
      stylist_id: stylistId,
      menu_ids: selectedMenuIds,
      total_price: totalPrice,
      comment,
    });

    if (proposalError) {
      setSaveMsg("エラー（提案の保存）: " + proposalError.message);
      setSaving(false);
      return;
    }

    await supabase.from("counseling_records").update({ status: "proposed" }).eq("id", id);
    setRecord((r) => ({ ...r, status: "proposed" }));

    setSelectedMenuIds([]);
    setComment("");
    setSaveMsg("提案を保存しました");
    await loadProposals();
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
  const menusByCategory = menus.reduce((acc, m) => {
    acc[m.category] = acc[m.category] || [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px", maxWidth: 560, margin: "0 auto" }}>
      <Link href="/stylist" style={{ fontSize: 12, color: "#8a8478", textDecoration: "none" }}>
        ← 一覧に戻る
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 4px" }}>
        <h1 style={{ fontFamily: "serif", fontSize: 20, margin: 0 }}>{c.name || "お名前未設定"} 様</h1>
        <span style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: "#b8926b", color: "#fff" }}>
          髪型カウンセリング
        </span>
      </div>
      <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 20 }}>
        {new Date(record.created_at).toLocaleString("ja-JP")}
      </p>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        <Row label="年齢" value={c.age ? `${c.age}歳` : null} />
        <Row label="性別" value={LABELS.gender[c.gender]} />
        <Row label="電話番号" value={c.phone} />
        <Row label="指名スタイリスト" value={preferredStylistName || "おまかせ"} />
      </div>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        <Row label="なりたいイメージ" value={record.desired_result} />
        <Row label="検討中メニュー" value={record.interested_menu_categories?.join("、")} />
      </div>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        <Row label="髪の長さ" value={LABELS.hair_length[record.hair_length]} />
        <Row label="髪質" value={LABELS.hair_type[record.hair_type]} />
        <Row label="太さ" value={LABELS.hair_thickness[record.hair_thickness]} />
        <Row label="毛量" value={LABELS.hair_volume[record.hair_volume]} />
        <Row label="くせの位置" value={record.curl_position?.join("、")} />
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

      <h2 style={{ fontFamily: "serif", fontSize: 18, marginBottom: 12 }}>メニューを提案する</h2>

      <div style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 16, marginBottom: 20 }}>
        {Object.entries(menusByCategory).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: "#8a8478" }}>{category}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((m) => (
                <label
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    border: `1.5px solid ${selectedMenuIds.includes(m.id) ? "#1b1b1b" : "#eee"}`,
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedMenuIds.includes(m.id)}
                      onChange={() => toggleMenu(m.id)}
                    />
                    {m.name}
                  </span>
                  <span style={{ color: "#8a8478", fontSize: 12 }}>
                    {fmt(m.price)}
                    {m.price_note || ""}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14 }}>
          <span>合計</span>
          <span>{fmt(totalPrice)}</span>
        </div>

        <label style={{ fontSize: 12, color: "#8a8478", display: "block", marginBottom: 8 }}>お客様へのコメント</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="例：ご希望のイメージに近づけるには、カット＋縮毛矯正がおすすめです。"
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

      {proposals.length > 0 && (
        <>
          <h2 style={{ fontFamily: "serif", fontSize: 16, marginBottom: 10 }}>これまでの提案</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {proposals.map((p) => (
              <div key={p.id} style={{ border: "1px solid #e6e1d6", borderRadius: 6, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>合計 {fmt(p.total_price)}</div>
                <div style={{ fontSize: 12 }}>{p.comment}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
