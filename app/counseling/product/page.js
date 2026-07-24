"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { uploadCounselingPhoto } from "../../../lib/uploadPhoto";

function ShampooIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="20" y="24" width="20" height="30" rx="6" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" />
      <rect x="26" y="16" width="8" height="10" rx="2" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M26,16 C26,12 30,11 34,12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="11" r="2.2" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="18" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="12" cy="24" r="1.3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="42" cy="46" r="5" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="47" cy="42" r="3.4" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="46" cy="49" r="3" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function TreatmentIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M22,14 C22,11 42,11 42,14 L40,40 L24,40 Z"
        fill="var(--color-beige-light)"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="24.5" y1="34" x2="39.5" y2="34" stroke="currentColor" strokeWidth="1.2" />
      <rect x="27" y="40" width="10" height="6" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" />
      <rect x="29" y="46" width="6" height="6" rx="1.5" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ScalpIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <line x1="14" y1="38" x2="50" y2="38" stroke="currentColor" strokeWidth="1.6" />
      <path d="M32,38 C30,32 34,28 33,22 C32.3,18 34,15 36,13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M32,38 C31,34 32,32 31,28" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M22,20 L23,23 L26,24 L23,25 L22,28 L21,25 L18,24 L21,23 Z" fill="currentColor" />
      <path d="M42,16 L42.8,18.2 L45,19 L42.8,19.8 L42,22 L41.2,19.8 L39,19 L41.2,18.2 Z" fill="currentColor" />
    </svg>
  );
}

function StylingIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="20" y="26" width="16" height="26" rx="4" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" />
      <rect x="24" y="18" width="8" height="8" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M32,20 L40,16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M40,16 C42,15 43,17 41,18 L38,20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M46,22 L47,24.5 L49.5,25.5 L47,26.5 L46,29 L45,26.5 L42.5,25.5 L45,24.5 Z" fill="currentColor" />
      <path d="M14,30 L14.8,32 L17,32.8 L14.8,33.6 L14,35.6 L13.2,33.6 L11,32.8 L13.2,32 Z" fill="currentColor" />
    </svg>
  );
}

function OilIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M22,32 C22,26 42,26 42,32 L40,50 C40,53 24,53 24,50 Z" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="27" y="14" width="10" height="14" rx="3" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="32" cy="12" r="2.6" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.4" />
      <path d="M48,34 C48,37 45,40 45,43 C45,45.2 46.8,47 49,47 C51.2,47 53,45.2 53,43 C53,40 50,37 50,34 Z" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ColoringIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M16,34 C16,44 22,50 32,50 C42,50 48,44 48,34 Z" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="32" cy="34" rx="16" ry="5" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M38,32 L50,16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M46,22 L50,16 L54,20 L48,27 Z" fill="var(--color-beige-light)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function HairTypeIcon({ kind, size = 20 }) {
  const xs = [5, 12, 19];
  let paths;
  if (kind === "straight") {
    paths = xs.map((cx) => `M${cx},2 L${cx},22`);
  } else if (kind === "wavy") {
    paths = xs.map((cx) => `M${cx},2 C${cx - 3},7 ${cx + 3},11 ${cx},16 C${cx - 3},19 ${cx + 3},21 ${cx},22`);
  } else {
    paths = xs.map((cx) => `M${cx},2 C${cx - 4},5 ${cx + 4},7 ${cx},10 C${cx - 4},13 ${cx + 4},15 ${cx},18 C${cx - 4},20 ${cx + 4},21 ${cx},22`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" fill="none" />
      ))}
    </svg>
  );
}

function ThicknessIcon({ kind, size = 20 }) {
  const width = { fine: 1.2, medium: 2.6, thick: 4.2 }[kind] || 2;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="9" y1="3" x2="15" y2="21" stroke="currentColor" strokeWidth={width} strokeLinecap="round" />
    </svg>
  );
}

function ThicknessSectionIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="8" y1="3" x2="10" y2="21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15" y1="3" x2="17" y2="21" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function VolumeIcon({ kind, size = 20 }) {
  const dots = {
    few: [[6, 6], [16, 9], [10, 16], [18, 18]],
    medium: [[5, 5], [13, 4], [19, 8], [7, 11], [15, 13], [4, 17], [11, 19], [18, 20]],
    many: [[4, 4], [10, 3], [16, 5], [21, 8], [6, 9], [13, 9], [19, 12], [3, 13], [9, 15], [15, 16], [20, 18], [5, 20], [12, 21], [18, 22]],
  }[kind] || [];
  const r = { few: 1.6, medium: 1.4, many: 1.2 }[kind] || 1.4;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" />
      ))}
    </svg>
  );
}

const CONCERN_TAGS = ["枝毛", "パサつき", "広がり", "分け目"];

const INTEREST_OPTIONS = [
  { id: "shampoo", label: "シャンプー", Icon: ShampooIcon },
  { id: "treatment", label: "トリートメント", Icon: TreatmentIcon },
  { id: "scalp", label: "頭皮ケア", Icon: ScalpIcon },
  { id: "styling", label: "スタイリング剤", Icon: StylingIcon },
  { id: "oil", label: "ヘアオイル", Icon: OilIcon },
  { id: "coloring", label: "カラー後のケア", Icon: ColoringIcon },
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
  const [authChecked, setAuthChecked] = useState(false);

  // 電話番号ルート用
  const [phoneCustomerId, setPhoneCustomerId] = useState(null);
  const [phoneForm, setPhoneForm] = useState({ name: "", phone: "", pin: "" });
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [step, setStep] = useState(1);
  const [a, setA] = useState(EMPTY);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [photos, setPhotos] = useState({ side: null, back: null, concern: null });
  const [uploadingKey, setUploadingKey] = useState(null);
  const [concernTag, setConcernTag] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
      setAuthChecked(true);
    };
    checkUser();
  }, []);

  const set = (k, v) => setA((prev) => ({ ...prev, [k]: v }));
  const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handlePhoneVerify = async () => {
    setPhoneError("");
    if (!phoneForm.name.trim()) {
      setPhoneError("お名前を入力してください");
      return;
    }
    if (!phoneForm.phone.trim()) {
      setPhoneError("電話番号を入力してください");
      return;
    }
    if (!/^\d{4}$/.test(phoneForm.pin)) {
      setPhoneError("PINは4桁の数字で入力してください");
      return;
    }

    setPhoneVerifying(true);
    const { data, error } = await supabase.rpc("verify_or_register_customer", {
      p_name: phoneForm.name.trim(),
      p_phone: phoneForm.phone.trim(),
      p_pin: phoneForm.pin,
    });

    if (error) {
      setPhoneError("エラー: " + error.message);
      setPhoneVerifying(false);
      return;
    }

    const result = data?.[0];
    if (!result || result.status === "pin_mismatch") {
      setPhoneError("PINが一致しません。もう一度確認してください。");
      setPhoneVerifying(false);
      return;
    }

    setPhoneCustomerId(result.customer_id);
    setA((prev) => ({ ...prev, name: phoneForm.name.trim() }));
    setPhoneVerifying(false);
  };

  const handlePhotoChange = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    setMessage("");
    try {
      const url = await uploadCounselingPhoto(file, userId || phoneCustomerId);
      setPhotos((prev) => ({ ...prev, [key]: url }));
    } catch (err) {
      setMessage("写真のアップロードに失敗しました: " + err.message);
    }
    setUploadingKey(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    let customerId = phoneCustomerId;

    if (!customerId) {
      // ログインルート（従来通り）
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

      customerId = existingProfile?.id;

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
    } else {
      // 電話番号ルート：年齢・性別だけ追記更新
      await supabase
        .from("customer_profiles")
        .update({ age: a.age ? Number(a.age) : null, gender: a.gender })
        .eq("id", customerId);
    }

    const { data: newCounseling, error: counselingError } = await supabase
      .from("counseling_records")
      .insert({
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
      })
      .select()
      .single();

    if (counselingError) {
      setMessage("エラー（カウンセリング保存）: " + counselingError.message);
      setLoading(false);
      return;
    }

    const photoRows = [];
    if (photos.side) photoRows.push({ counseling_id: newCounseling.id, angle: "side", image_url: photos.side });
    if (photos.back) photoRows.push({ counseling_id: newCounseling.id, angle: "back", image_url: photos.back });
    if (photos.concern)
      photoRows.push({
        counseling_id: newCounseling.id,
        angle: "concern",
        image_url: photos.concern,
        concern_tag: concernTag || null,
      });

    if (photoRows.length > 0) {
      await supabase.from("counseling_photos").insert(photoRows);
    }

    setDone(true);
    setLoading(false);
  };

  const wrap = { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px" };
  const box = { width: "100%", maxWidth: 380 };
  const h1 = { fontFamily: "serif", fontSize: 20, marginBottom: 20 };
  const label = { fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 8, display: "block" };
  const tagRow = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 };
  const inputStyle = { width: "100%", padding: 12, border: "1px solid var(--color-beige-border)", borderRadius: 4, fontSize: 14, marginBottom: 20, boxSizing: "border-box" };
  const btnRow = { display: "flex", gap: 10, marginTop: 10 };
  const primaryBtn = { flex: 1, padding: 14, background: "var(--color-black)", color: "var(--color-bg)", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" };
  const ghostBtn = { flex: 1, padding: 14, background: "transparent", color: "var(--color-black)", border: "1.5px solid var(--color-black)", borderRadius: 4, fontSize: 14, cursor: "pointer" };
  const progress = { height: 4, background: "#eee", borderRadius: 2, marginBottom: 24, overflow: "hidden" };
  const progressFill = { height: "100%", background: "var(--color-black)", width: `${(step / TOTAL_STEPS) * 100}%` };

  const Tag = ({ selected, onClick, children, icon, style }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 14px",
        borderRadius: 999,
        border: `1px solid ${selected ? "var(--color-black)" : "var(--color-beige-border)"}`,
        background: selected ? "var(--color-black)" : "transparent",
        color: selected ? "var(--color-bg)" : "var(--color-black)",
        fontSize: 13,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
      {icon}
    </button>
  );

  const sectionRow = { display: "flex", gap: 14, alignItems: "center", marginBottom: 20 };
  const sectionIconWrap = { color: "var(--color-black)", flexShrink: 0 };

  // 認証チェック中
  if (!authChecked) {
    return (
      <main style={wrap}>
        <p style={{ fontSize: 13, color: "var(--color-beige-gray)" }}>読み込み中...</p>
      </main>
    );
  }

  // 未ログイン & 電話番号未確認 → 入口フォームを表示
  if (!userId && !phoneCustomerId) {
    return (
      <main style={wrap}>
        <div style={box}>
          <h1 style={h1}>お名前と電話番号を入力してください</h1>
          <p style={{ fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 20, lineHeight: 1.8 }}>
            会員登録は不要です。次回以降は同じ電話番号とPINで、ご相談内容の確認ができます。
          </p>

          <label style={label}>お名前</label>
          <input
            style={inputStyle}
            value={phoneForm.name}
            onChange={(e) => setPhoneForm((p) => ({ ...p, name: e.target.value }))}
          />

          <label style={label}>電話番号</label>
          <input
            style={inputStyle}
            value={phoneForm.phone}
            onChange={(e) => setPhoneForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="例：0901234567"
          />

          <label style={label}>4桁のPIN（次回確認用に決めてください）</label>
          <input
            style={inputStyle}
            value={phoneForm.pin}
            onChange={(e) => setPhoneForm((p) => ({ ...p, pin: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))}
            placeholder="例：1234"
            inputMode="numeric"
          />

          {phoneError && <p style={{ fontSize: 13, color: "#b00", marginBottom: 12 }}>{phoneError}</p>}

          <button style={primaryBtn} onClick={handlePhoneVerify} disabled={phoneVerifying}>
            {phoneVerifying ? "確認中..." : "この内容で進める"}
          </button>

          <p style={{ fontSize: 12, color: "var(--color-beige-gray)", textAlign: "center", marginTop: 20 }}>
            すでにアカウントをお持ちの方は{" "}
            <a href="/login" style={{ color: "var(--color-text)", textDecoration: "underline" }}>
              ログイン
            </a>
          </p>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main style={wrap}>
        <div style={{ ...box, textAlign: "center", marginTop: 80 }}>
          <h1 style={h1}>送信しました</h1>
          <p style={{ fontSize: 13, color: "var(--color-beige-gray)", lineHeight: 1.8, marginBottom: 24 }}>
            スタイリストが内容を確認し、あなたに合う商品を提案します。
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "var(--color-black)",
              color: "var(--color-bg)",
              borderRadius: 4,
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            トップに戻る
          </Link>
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
        <p style={{ fontSize: 11, color: "var(--color-beige-gray)", marginBottom: 8 }}>STEP {step} / {TOTAL_STEPS}</p>

        {step === 1 && (
          <>
            <h1 style={h1}>今日はどのような商品をお探しですか？</h1>
            <p style={{ fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 16 }}>複数選択できます</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
              {INTEREST_OPTIONS.map((o) => {
                const selected = a.interests.includes(o.id);
                const IconComp = o.Icon;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => set("interests", toggle(a.interests, o.id))}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "16px 4px",
                      borderRadius: 18,
                      border: `1.5px solid ${selected ? "var(--color-black)" : "var(--color-beige-border)"}`,
                      background: selected ? "var(--color-beige-light)" : "transparent",
                      color: "var(--color-black)",
                      cursor: "pointer",
                    }}
                  >
                    <IconComp size={44} />
                    <span style={{ fontSize: 11.5, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{o.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={btnRow}>
              <button style={{ ...primaryBtn, position: "relative" }} onClick={next}>
                次へ
                <span style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)" }}>›</span>
              </button>
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
            <div style={sectionRow}>
              <div style={sectionIconWrap}>
                <HairTypeIcon kind="wavy" size={48} />
              </div>
              <div style={{ ...tagRow, marginBottom: 0, flex: 1 }}>
                {HAIR_TYPES.map((g) => (
                  <Tag key={g.v} selected={a.hair_type === g.v} onClick={() => set("hair_type", g.v)} icon={<HairTypeIcon kind={g.v} size={16} />}>
                    {g.l}
                  </Tag>
                ))}
              </div>
            </div>

            <label style={label}>髪の太さ</label>
            <div style={sectionRow}>
              <div style={sectionIconWrap}>
                <ThicknessSectionIcon size={48} />
              </div>
              <div style={{ ...tagRow, marginBottom: 0, flex: 1 }}>
                {THICKNESS.map((g) => (
                  <Tag key={g.v} selected={a.hair_thickness === g.v} onClick={() => set("hair_thickness", g.v)} icon={<ThicknessIcon kind={g.v} size={16} />}>
                    {g.l}
                  </Tag>
                ))}
              </div>
            </div>

            <label style={label}>毛量</label>
            <div style={sectionRow}>
              <div style={sectionIconWrap}>
                <VolumeIcon kind="many" size={48} />
              </div>
              <div style={{ ...tagRow, marginBottom: 0, flex: 1 }}>
                {VOLUME.map((g) => (
                  <Tag key={g.v} selected={a.hair_volume === g.v} onClick={() => set("hair_volume", g.v)} icon={<VolumeIcon kind={g.v} size={16} />}>
                    {g.l}
                  </Tag>
                ))}
              </div>
            </div>

            <label style={label}>ダメージレベル：{a.damage_level} / 5</label>
            <div style={{ position: "relative", height: 32 }}>
              <input
                type="range"
                min={1}
                max={5}
                value={a.damage_level}
                onChange={(e) => set("damage_level", Number(e.target.value))}
                style={{ position: "absolute", inset: 0, width: "100%", height: 32, opacity: 0, cursor: "pointer", margin: 0 }}
              />
              <div style={{ position: "absolute", top: 15, left: 0, right: 0, height: 1, background: "var(--color-beige-border)", pointerEvents: "none" }} />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: `calc(${((a.damage_level - 1) / 4) * 100}% - 8px)`,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "var(--color-black)",
                  pointerEvents: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-beige-gray)", marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>

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
            <p style={{ fontSize: 12, color: "var(--color-beige-gray)", lineHeight: 1.8, marginBottom: 16 }}>
              ダメージ箇所、くせ毛箇所、頭皮の状態など、気になる箇所がありましたら、写真を添付してください（任意）
            </p>

            {[
              { key: "side", label: "写真1" },
              { key: "back", label: "写真2" },
            ].map(({ key, label: l }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={label}>{l}</label>
                {photos[key] ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={photos[key]} alt={l} style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }} />
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => ({ ...p, [key]: null }))}
                      style={{ fontSize: 12, color: "var(--color-beige-gray)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
                    >
                      削除してやり直す
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(key, e.target.files?.[0])}
                    disabled={uploadingKey === key}
                    style={{ fontSize: 12 }}
                  />
                )}
                {uploadingKey === key && <p style={{ fontSize: 11, color: "var(--color-beige-gray)" }}>アップロード中...</p>}
              </div>
            ))}

            <div style={{ border: "1px solid #eee", borderRadius: 6, padding: 14, marginBottom: 16 }}>
              <label style={label}>写真3</label>
              {photos.concern ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <img src={photos.concern} alt="写真3" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }} />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => ({ ...p, concern: null }))}
                    style={{ fontSize: 12, color: "var(--color-beige-gray)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
                  >
                    削除してやり直す
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange("concern", e.target.files?.[0])}
                  disabled={uploadingKey === "concern"}
                  style={{ fontSize: 12, marginBottom: 10 }}
                />
              )}
              {uploadingKey === "concern" && <p style={{ fontSize: 11, color: "var(--color-beige-gray)" }}>アップロード中...</p>}

              {photos.concern && (
                <>
                  <p style={{ fontSize: 11.5, color: "var(--color-beige-gray)", margin: "10px 0 8px" }}>この写真はどの悩みですか？</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {CONCERN_TAGS.map((t) => (
                      <Tag key={t} selected={concernTag === t} onClick={() => setConcernTag(t)}>
                        {t}
                      </Tag>
                    ))}
                  </div>
                </>
              )}
            </div>

            {message && <p style={{ fontSize: 13, color: "#b00", marginBottom: 12 }}>{message}</p>}
            <div style={btnRow}>
              <button style={ghostBtn} onClick={back}>戻る</button>
              <button style={primaryBtn} disabled={loading || uploadingKey !== null} onClick={handleSubmit}>
                {loading ? "送信中..." : "送信する"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
