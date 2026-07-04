"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const INTEREST_OPTIONS = [
  { id: "shampoo", label: "シャンプー" },
  { id: "treatment", label: "トリートメント" },
  { id: "scalp", label: "頭皮ケア" },
  { id: "styling", label: "スタイリング剤" },
  { id: "oil", label: "ヘアオイル" },
  { id: "coloring", label: "カラー後のケア" },
];
const GENDERS = [
  { v: "female", l: "女性" },
  { v: "male", l: "男性" },
  { v: "other", l: "その他/回答しない" },
];
const LENGTHS = [
  { v: "short", l: "ショート" },
  { v: "medium", l: "ミディアム" },
  { v: "long", l: "ロング" },
  { v: "very_long", l: "超ロング" },
];
const HAIR_TYPES = [
  { v: "straight", l: "直毛" },
  { v: "wavy", l: "くせ毛" },
  { v: "curly", l: "強いくせ" },
];
const THICKNESS = [
  { v: "fine", l: "細い" },
  { v: "medium", l: "普通" },
  { v: "thick", l: "太い" },
];
const VOLUME = [
  { v: "few", l: "少ない" },
  { v: "medium", l: "普通" },
  { v: "many", l: "多い" },
];
const PERIODS = [
  { v: "within_3m", l: "3ヶ月以内" },
  { v: "3_6m", l: "半年以内" },
  { v: "6_12m", l: "1年以内" },
  { v: "over_1y", l: "1年以上前" },
];
const CONCERNS = ["パサつき", "広がり", "枝毛", "うねり", "ボリューム不足", "頭皮のべたつき"];

const EMPTY = {
  interests: [],
  name: "",
  age: "",
  gender: "female",
  hair_length: "medium",
  hair_type: "wavy",
  hair_thickness: "medium",
  hair_volume: "medium",
  damage_level: 3,
  bleach_history: null,
  bleach_last_done: null,
  perm_history: null,
  perm_last_done: null,
  straight_perm_history: null,
  straight_perm_last_done: null,
  concerns: [],
  desired_result: "",
};

const TOTAL_STEPS = 6;

export default function CounselingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState(1);
  const [a, setA] = useState(EMPTY);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
      } else {
        setUserId(data.user.id);
      }
    };
    checkUser();
  }, [router]);

  const set = (k, v) => setA((prev) => ({ ...prev, [k]: v }));
  const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    // 既にapp_usersに登録済みなら role は上書きしない
    const { data: existingAppUser } = await supabase
      .from("app_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingAppUser) {
      await supabase.from("app_users").insert({ id: userId, role: "customer" });
    }

    let { data: existingProfile } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let customerId = existingProfile?.id;

    if (!customerId) {
      const { data: newProfile, error: profileError } = await supabase
        .from("customer_profiles")
        .insert({ user_id: userId, name: a.name, age: a.age ? Number(a.age) : null, gender: a.gender })
        .select()
        .single();

      if (profileError) {
        setMessage("エラー（プロフィール作成）: " + profileError.message);
        setLoading(false);
        return;
      }
      customerId = newProfile.id;
    } else {
      await supabase
        .from("customer_profiles")
        .update({ name: a.name, age: a.age ? Number(a.age) : null, gender: a.gender })
        .eq("id", customerId);
    }

    const { error: counselingError } = await supabase.from("counseling_records").insert({
      customer_id: customerId,
      product_interests: a.interests,
      hair_length: a.hair_length,
      hair_type: a.hair_type,
      hair_thickness: a.hair_thickness,
      hair_volume: a.hair_volume,
      damage_level: a.damage_level,
      bleach_history: a.bleach_history,
      bleach_last_done: a.bleach_history ? a.bleach_last_done : null,
      perm_history: a.perm_history,
      perm_last_done: a.perm_history ? a.perm_last_done : null,
      straight_perm_history: a.straight_perm_history,
      straight_perm_last_done: a.straight_perm_history ? a.straight_perm_last_done : null,
      concerns: a.concerns,
      desired_result: a.desired_result,
      status: "pending",
    });

    if (counselingError) {
      setMessage("エラー（カウンセリング保存）: " + counselingError.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  const wrap = { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px" };
  const box = { width: "100%", maxWidth: 380 };
  const h1 = { fontFamily: "serif", fontSize: 20, marginBottom: 20 };
  const label = { fontSize: 12, color: "#8a8478", marginBottom: 8, display: "block" };
  const tagRow = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 };
  const inputStyle = { width: "100%", padding: 12, border: "1px solid #ccc", borderRadius: 4, fontSize: 14, marginBottom: 20, boxSizing: "border-box" };
  const btnRow = { display: "flex", gap: 10, marginTop: 10 };
  const primaryBtn = { flex: 1, padding: 14, background: "#1b1b1b", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" };
  const ghostBtn = { flex: 1, padding: 14, background: "transparent", color: "#1b1b1b", border: "1.5px solid #1b1b1b", borderRadius: 4, fontSize: 14, cursor: "pointer" };
  const progress = { height: 4, background: "#eee", borderRadius: 2, marginBottom: 24, overflow: "hidden" };
  const progressFill = { height: "100%", background: "#1b1b1b", width: `${(step / TOTAL_STEPS) * 100}%` };

  const Tag = ({ selected, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "9px 14px",
        borderRadius: 999,
        border: `1px solid ${selected ? "#1b1b1b" : "#ccc"}`,
        background: selected ? "#1b1b1b" : "transparent",
        color: selected ? "#fff" : "#1b1b1b",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );

  if (done) {
    return (
      <main style={wrap}>
        <div style={{ ...box, textAlign: "center", marginTop: 80 }}>
          <h1 style={h1}>送信しました</h1>
          <p style={{ fontSize: 13, color: "#8a8478", lineHeight: 1.8 }}>
            スタイリストが内容を確認し、あなたに合う商品を提案します。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={box}>
        <div style={progress}>
          <div style={progressFill} />
        </div>
        <p style={{ fontSize: 11, color: "#8a8478", marginBottom: 8 }}>STEP {step} / {TOTAL_STEPS}</p>

        {step === 1 && (
          <>
            <h1 style={h1}>今日はどのような商品をお探しですか？</h1>
            <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 16 }}>複数選択できます</p>
            <div style={tagRow}>
              {INTEREST_OPTIONS.map((o) => (
                <Tag key={o.id} selected={a.interests.includes(o.id)} onClick={() => set("interests", toggle(a.interests, o.id))}>
                  {o.label}
                </Tag>
              ))}
            </div>
            <div style={btnRow}>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={h1}>基本情報</h1>
            <label style={label}>お名前</label>
            <input style={inputStyle} value={a.name} onChange={(e) => set("name", e.target.value)} />
            <label style={label}>年齢</label>
            <input style={inputStyle} value={a.age} onChange={(e) => set("age", e.target.value)} />
            <label style={label}>性別</label>
            <div style={tagRow}>
              {GENDERS.map((g) => (
                <Tag key={g.v} selected={a.gender === g.v} onClick={() => set("gender", g.v)}>{g.l}</Tag>
              ))}
            </div>
            <label style={label}>髪の長さ</label>
            <div style={tagRow}>
              {LENGTHS.map((g) => (
                <Tag key={g.v} selected={a.hair_length === g.v} onClick={() => set("hair_length", g.v)}>{g.l}</Tag>
              ))}
            </div>
            <div style={btnRow}>
              <button style={ghostBtn} onClick={back}>戻る</button>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={h1}>髪質・太さ・毛量・ダメージ</h1>
            <label style={label}>髪質</label>
            <div style={tagRow}>
              {HAIR_TYPES.map((g) => (
                <Tag key={g.v} selected={a.hair_type === g.v} onClick={() => set("hair_type", g.v)}>{g.l}</Tag>
              ))}
            </div>
            <label style={label}>髪の太さ</label>
            <div style={tagRow}>
              {THICKNESS.map((g) => (
                <Tag key={g.v} selected={a.hair_thickness === g.v} onClick={() => set("hair_thickness", g.v)}>{g.l}</Tag>
              ))}
            </div>
            <label style={label}>毛量</label>
            <div style={tagRow}>
              {VOLUME.map((g) => (
                <Tag key={g.v} selected={a.hair_volume === g.v} onClick={() => set("hair_volume", g.v)}>{g.l}</Tag>
              ))}
            </div>
            <label style={label}>ダメージレベル：{a.damage_level} / 5</label>
            <input
              type="range"
              min={1}
              max={5}
              value={a.damage_level}
              onChange={(e) => set("damage_level", Number(e.target.value))}
              style={{ width: "100%", marginBottom: 20 }}
            />
            <div style={btnRow}>
              <button style={ghostBtn} onClick={back}>戻る</button>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 style={h1}>施術履歴</h1>
            {[
              { key: "bleach", label: "ブリーチ" },
              { key: "perm", label: "パーマ" },
              { key: "straight_perm", label: "縮毛矯正・ストレートパーマ" },
            ].map(({ key, label: l }) => {
              const historyKey = `${key}_history`;
              const whenKey = `${key}_last_done`;
              const has = a[historyKey];
              return (
                <div key={key} style={{ border: "1px solid #eee", borderRadius: 6, padding: 14, marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{l}</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: has ? 10 : 0 }}>
                    <Tag selected={has === true} onClick={() => set(historyKey, true)}>あり</Tag>
                    <Tag selected={has === false} onClick={() => { set(historyKey, false); set(whenKey, null); }}>なし</Tag>
                  </div>
                  {has && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {PERIODS.map((p) => (
                        <Tag key={p.v} selected={a[whenKey] === p.v} onClick={() => set(whenKey, p.v)}>{p.l}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={btnRow}>
              <button style={ghostBtn} onClick={back}>戻る</button>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 style={h1}>悩み・希望の仕上がり</h1>
            <label style={label}>髪のお悩み（複数選択可）</label>
            <div style={tagRow}>
              {CONCERNS.map((c) => (
                <Tag key={c} selected={a.concerns.includes(c)} onClick={() => set("concerns", toggle(a.concerns, c))}>{c}</Tag>
              ))}
            </div>
            <label style={label}>希望の仕上がり（自由記述）</label>
            <textarea
              value={a.desired_result}
              onChange={(e) => set("desired_result", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
            />
            <div style={btnRow}>
              <button style={ghostBtn} onClick={back}>戻る</button>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h1 style={h1}>写真アップロード（任意）</h1>
            <p style={{ fontSize: 12, color: "#8a8478", lineHeight: 1.8, marginBottom: 20 }}>
              横・後ろ・気になる箇所の写真は任意です。アップロード機能は次のステップで追加予定のため、
              今回はスキップして送信できます。
            </p>
            {message && <p style={{ fontSize: 13, color: "#b00", marginBottom: 12 }}>{message}</p>}
            <div style={btnRow}>
              <button style={ghostBtn} onClick={back}>戻る</button>
              <button style={primaryBtn} disabled={loading} onClick={handleSubmit}>
                {loading ? "送信中..." : "送信する"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
