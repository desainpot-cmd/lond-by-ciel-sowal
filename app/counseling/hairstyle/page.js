"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const MENU_CATEGORIES = ["カット", "カラー", "カット＆カラー", "パーマ", "縮毛矯正", "ケア", "その他"];
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
const CURL_POSITIONS = ["前髪", "根元", "中間", "毛先", "全体"];
const PERIODS = [
  { v: "within_3m", l: "3ヶ月以内" },
  { v: "3_6m", l: "半年以内" },
  { v: "6_12m", l: "1年以内" },
  { v: "over_1y", l: "1年以上前" },
];

const EMPTY = {
  desired_result: "",
  interested_menu_categories: [],
  hair_length: "medium",
  hair_type: "wavy",
  hair_thickness: "medium",
  hair_volume: "medium",
  damage_level: 3,
  curl_position: [],
  bleach_history: null,
  bleach_last_done: null,
  perm_history: null,
  perm_last_done: null,
  straight_perm_history: null,
  straight_perm_last_done: null,
  preferred_stylist_id: null,
};

const TOTAL_STEPS = 5;

export default function HairstyleCounselingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState(1);
  const [a, setA] = useState(EMPTY);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);

      const { data: stylistData } = await supabase
        .from("stylist_profiles")
        .select("id, display_name, bio, specialties, years_experience");
      setStylists(stylistData || []);
    };
    init();
  }, [router]);

  const set = (k, v) => setA((prev) => ({ ...prev, [k]: v }));
  const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");

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
        .insert({ user_id: userId })
        .select()
        .single();

      if (profileError) {
        setErrorMsg("エラー（プロフィール作成）: " + profileError.message);
        setLoading(false);
        return;
      }
      customerId = newProfile.id;
    }

    const { error: counselingError } = await supabase.from("counseling_records").insert({
      customer_id: customerId,
      counseling_type: "hairstyle",
      desired_result: a.desired_result,
      interested_menu_categories: a.interested_menu_categories,
      hair_length: a.hair_length,
      hair_type: a.hair_type,
      hair_thickness: a.hair_thickness,
      hair_volume: a.hair_volume,
      damage_level: a.damage_level,
      curl_position: a.curl_position,
      bleach_history: a.bleach_history,
      bleach_last_done: a.bleach_history ? a.bleach_last_done : null,
      perm_history: a.perm_history,
      perm_last_done: a.perm_history ? a.perm_last_done : null,
      straight_perm_history: a.straight_perm_history,
      straight_perm_last_done: a.straight_perm_history ? a.straight_perm_last_done : null,
      preferred_stylist_id: a.preferred_stylist_id,
      status: "pending",
    });

    if (counselingError) {
      setErrorMsg("エラー（送信）: " + counselingError.message);
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

  const Tag = ({ selected, onClick, children, style }) => (
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
        ...style,
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
            スタイリストが内容を確認し、実現可能なメニューと料金をご提案します。
          </p>
        </div>
      </main>
    );
  }

  function HistoryBlock({ label: l, valueKey, whenKey }) {
    const has = a[valueKey];
    return (
      <div style={{ border: "1px solid #eee", borderRadius: 6, padding: 14, marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{l}</p>
        <div style={{ display: "flex", gap: 8, marginBottom: has ? 10 : 0 }}>
          <Tag selected={has === true} onClick={() => set(valueKey, true)}>あり</Tag>
          <Tag selected={has === false} onClick={() => { set(valueKey, false); set(whenKey, null); }}>なし</Tag>
        </div>
        {has && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PERIODS.map((p) => (
              <Tag key={p.v} selected={a[whenKey] === p.v} onClick={() => set(whenKey, p.v)} style={{ fontSize: 11.5, padding: "7px 10px" }}>
                {p.l}
              </Tag>
            ))}
          </div>
        )}
      </div>
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
            <h1 style={h1}>なりたい髪型のイメージ</h1>
            <label style={label}>自由にお書きください</label>
            <textarea
              value={a.desired_result}
              onChange={(e) => set("desired_result", e.target.value)}
              rows={4}
              placeholder="例：フェミニンな雰囲気にしたい、スタイリングが簡単な髪型にしたい、など"
              style={{ ...inputStyle, resize: "none" }}
            />
            <p style={{ fontSize: 11.5, color: "#8a8478", lineHeight: 1.8, marginBottom: 16 }}>
              参考写真があれば、次のステップ以降でアップロードいただけます（任意・現在準備中）
            </p>
            <div style={btnRow}>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={h1}>気になる・検討中のメニュー</h1>
            <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 16 }}>複数選択できます</p>
            <div style={tagRow}>
              {MENU_CATEGORIES.map((c) => (
                <Tag key={c} selected={a.interested_menu_categories.includes(c)} onClick={() => set("interested_menu_categories", toggle(a.interested_menu_categories, c))}>
                  {c}
                </Tag>
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
            <h1 style={h1}>現在の髪質</h1>
            <label style={label}>髪の長さ</label>
            <div style={tagRow}>
              {LENGTHS.map((g) => (
                <Tag key={g.v} selected={a.hair_length === g.v} onClick={() => set("hair_length", g.v)}>{g.l}</Tag>
              ))}
            </div>
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
            <label style={label}>くせの位置（複数選択可）</label>
            <div style={tagRow}>
              {CURL_POSITIONS.map((c) => (
                <Tag key={c} selected={a.curl_position.includes(c)} onClick={() => set("curl_position", toggle(a.curl_position, c))}>
                  {c}
                </Tag>
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
            <HistoryBlock label="ブリーチ" valueKey="bleach_history" whenKey="bleach_last_done" />
            <HistoryBlock label="パーマ" valueKey="perm_history" whenKey="perm_last_done" />
            <HistoryBlock label="縮毛矯正・ストレートパーマ" valueKey="straight_perm_history" whenKey="straight_perm_last_done" />
            <p style={{ fontSize: 11.5, color: "#8a8478", lineHeight: 1.8, margin: "12px 0 0" }}>
              くせの部分・ダメージが気になる部分の写真アップロードは任意です（現在準備中）
            </p>
            <div style={btnRow}>
              <button style={ghostBtn} onClick={back}>戻る</button>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 style={h1}>スタイリストを選ぶ</h1>
            <p style={{ fontSize: 12, color: "#8a8478", marginBottom: 16 }}>
              指名したいスタイリストがいれば選んでください。「おまかせ」でも大丈夫です。
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <div
                onClick={() => set("preferred_stylist_id", null)}
                style={{
                  padding: 14,
                  border: `1.5px solid ${a.preferred_stylist_id === null ? "#1b1b1b" : "#e6e1d6"}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                おまかせ（誰でもOK）
              </div>

              {stylists.map((s) => (
                <div
                  key={s.id}
                  onClick={() => set("preferred_stylist_id", s.id)}
                  style={{
                    padding: 14,
                    border: `1.5px solid ${a.preferred_stylist_id === s.id ? "#1b1b1b" : "#e6e1d6"}`,
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{s.display_name}</div>
                  {s.years_experience && (
                    <div style={{ fontSize: 11.5, color: "#8a8478", marginBottom: 4 }}>経験{s.years_experience}年</div>
                  )}
                  {s.specialties?.length > 0 && (
                    <div style={{ fontSize: 11, color: "#8a8478" }}>{s.specialties.join("、")}</div>
                  )}
                  {s.bio && <div style={{ fontSize: 11.5, color: "#8a8478", marginTop: 6, lineHeight: 1.6 }}>{s.bio}</div>}
                </div>
              ))}

              {stylists.length === 0 && (
                <p style={{ fontSize: 12, color: "#8a8478" }}>現在登録されているスタイリストがいません。おまかせで進めます。</p>
              )}
            </div>

            {errorMsg && <p style={{ fontSize: 13, color: "#b00", marginBottom: 12 }}>{errorMsg}</p>}

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
