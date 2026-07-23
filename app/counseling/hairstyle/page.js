"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { uploadCounselingPhoto } from "../../../lib/uploadPhoto";

const MENU_CATEGORIES = ["カット", "カラー", "ブリーチハイライト", "ポイントブリーチ", "フルブリーチ", "バレヤージュ", "パーマ", "縮毛矯正", "トリートメント"];
const STYLE_TAGS = [
  "フェミニン", "クール", "ナチュラル", "モード系", "韓国風", "エレガント",
  "甘めロング", "かっこいい系", "スタイリングが簡単", "バッサリイメージチェンジ",
  "前髪だけ変えたい", "ボリュームアップ", "くせを活かしたい",
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

const EMPTY = {
  desired_style_tags: [],
  desired_result: "",
  interested_menu_categories: [],
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
  preferred_stylist_id: null,
};

const TOTAL_STEPS = 5;

export default function HairstyleCounselingPage() {
  const [userId, setUserId] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 電話番号ルート用
  const [phoneCustomerId, setPhoneCustomerId] = useState(null);
  const [phoneForm, setPhoneForm] = useState({ name: "", phone: "", pin: "" });
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [step, setStep] = useState(1);
  const [a, setA] = useState(EMPTY);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [photos, setPhotos] = useState({ reference: null, curl: null, damage: null });
  const [uploadingKey, setUploadingKey] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
      setAuthChecked(true);

      const { data: stylistData } = await supabase
        .from("stylist_profiles")
        .select("id, display_name, bio, specialties, years_experience");
      setStylists(stylistData || []);
    };
    init();
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
    setPhoneVerifying(false);
  };

  const handlePhotoChange = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    setErrorMsg("");
    try {
      const url = await uploadCounselingPhoto(file, userId || phoneCustomerId);
      setPhotos((prev) => ({ ...prev, [key]: url }));
    } catch (err) {
      setErrorMsg("写真のアップロードに失敗しました: " + err.message);
    }
    setUploadingKey(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");

    let customerId = phoneCustomerId;

    if (!customerId) {
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
    }

    const { data: newCounseling, error: counselingError } = await supabase
      .from("counseling_records")
      .insert({
        customer_id: customerId,
        counseling_type: "hairstyle",
        desired_style_tags: a.desired_style_tags,
        desired_result: a.desired_result,
        interested_menu_categories: a.interested_menu_categories,
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
        preferred_stylist_id: a.preferred_stylist_id,
        status: "pending",
      })
      .select()
      .single();

    if (counselingError) {
      setErrorMsg("エラー（送信）: " + counselingError.message);
      setLoading(false);
      return;
    }

    const photoRows = [];
    if (photos.reference) photoRows.push({ counseling_id: newCounseling.id, angle: "reference", image_url: photos.reference });
    if (photos.curl) photoRows.push({ counseling_id: newCounseling.id, angle: "curl", image_url: photos.curl });
    if (photos.damage) photoRows.push({ counseling_id: newCounseling.id, angle: "damage", image_url: photos.damage });

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

  const Tag = ({ selected, onClick, children, style }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
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
    </button>
  );

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
            スタイリストが内容を確認し、実現可能なメニューと料金をご提案します。
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
        <p style={{ fontSize: 11, color: "var(--color-beige-gray)", marginBottom: 8 }}>STEP {step} / {TOTAL_STEPS}</p>

        {step === 1 && (
          <>
            <h1 style={h1}>なりたい髪型のイメージ</h1>
            <p style={{ fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 16 }}>複数選択できます</p>
            <div style={tagRow}>
              {STYLE_TAGS.map((t) => (
                <Tag key={t} selected={a.desired_style_tags.includes(t)} onClick={() => set("desired_style_tags", toggle(a.desired_style_tags, t))}>
                  {t}
                </Tag>
              ))}
            </div>

            <label style={label}>補足があれば自由にお書きください（任意）</label>
            <textarea
              value={a.desired_result}
              onChange={(e) => set("desired_result", e.target.value)}
              rows={3}
              placeholder="例：毛先だけ軽くしたい、前髪はそのままで、など"
              style={{ ...inputStyle, resize: "none" }}
            />
            <label style={label}>参考写真（任意）</label>
            {photos.reference ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <img src={photos.reference} alt="参考写真" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }} />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => ({ ...p, reference: null }))}
                  style={{ fontSize: 12, color: "var(--color-beige-gray)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
                >
                  削除してやり直す
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange("reference", e.target.files?.[0])}
                disabled={uploadingKey === "reference"}
                style={{ fontSize: 12, marginBottom: 16 }}
              />
            )}
            {uploadingKey === "reference" && <p style={{ fontSize: 11, color: "var(--color-beige-gray)", marginBottom: 16 }}>アップロード中...</p>}
            {errorMsg && <p style={{ fontSize: 13, color: "#b00", marginBottom: 12 }}>{errorMsg}</p>}
            <div style={btnRow}>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={h1}>気になる・検討中のメニュー</h1>
            <p style={{ fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 16 }}>複数選択できます</p>
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

            {[
              { key: "curl", label: "くせが気になる部分の写真（任意）" },
              { key: "damage", label: "ダメージが気になる部分の写真（任意）" },
            ].map(({ key, label: l }) => (
              <div key={key} style={{ marginTop: 16 }}>
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

            {errorMsg && <p style={{ fontSize: 13, color: "#b00", margin: "16px 0 0" }}>{errorMsg}</p>}

            <div style={btnRow}>
              <button style={ghostBtn} onClick={back}>戻る</button>
              <button style={primaryBtn} onClick={next}>次へ</button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 style={h1}>スタイリストを選ぶ</h1>
            <p style={{ fontSize: 12, color: "var(--color-beige-gray)", marginBottom: 16 }}>
              指名したいスタイリストがいれば選んでください。「おまかせ」でも大丈夫です。
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <div
                onClick={() => set("preferred_stylist_id", null)}
                style={{
                  padding: 14,
                  border: `1.5px solid ${a.preferred_stylist_id === null ? "var(--color-black)" : "var(--color-beige-border)"}`,
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
                    border: `1.5px solid ${a.preferred_stylist_id === s.id ? "var(--color-black)" : "var(--color-beige-border)"}`,
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{s.display_name}</div>
                  {s.years_experience && (
                    <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginBottom: 4 }}>経験{s.years_experience}年</div>
                  )}
                  {s.specialties?.length > 0 && (
                    <div style={{ fontSize: 11, color: "var(--color-beige-gray)" }}>{s.specialties.join("、")}</div>
                  )}
                  {s.bio && <div style={{ fontSize: 11.5, color: "var(--color-beige-gray)", marginTop: 6, lineHeight: 1.6 }}>{s.bio}</div>}
                </div>
              ))}

              {stylists.length === 0 && (
                <p style={{ fontSize: 12, color: "var(--color-beige-gray)" }}>現在登録されているスタイリストがいません。おまかせで進めます。</p>
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
