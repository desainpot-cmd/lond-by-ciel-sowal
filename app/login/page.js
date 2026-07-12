"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signup"); // "signup" | "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage("エラー: " + error.message);
      } else {
        setMessage("会員登録に成功しました！");
        router.push("/counseling");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage("エラー: " + error.message);
      } else {
        setMessage("ログインしました！");
        router.push("/counseling");
      }
    }
    setLoading(false);
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
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <h1 style={{ fontFamily: "serif", fontSize: 22, marginBottom: 20, textAlign: "center" }}>
          {mode === "signup" ? "会員登録" : "ログイン"}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: 12,
              border: "1px solid var(--color-beige-border)",
              borderRadius: 4,
              fontSize: 14,
            }}
          />
          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              padding: 12,
              border: "1px solid var(--color-beige-border)",
              borderRadius: 4,
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 14,
              background: "var(--color-black)",
              color: "var(--color-bg)",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {loading ? "処理中..." : mode === "signup" ? "登録する" : "ログインする"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 14, fontSize: 13, textAlign: "center" }}>{message}</p>
        )}

        <p style={{ marginTop: 20, fontSize: 13, textAlign: "center" }}>
          {mode === "signup" ? (
            <>
              すでにアカウントをお持ちの方は{" "}
              <button
                onClick={() => setMode("login")}
                style={{ background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
              >
                ログイン
              </button>
            </>
          ) : (
            <>
              初めての方は{" "}
              <button
                onClick={() => setMode("signup")}
                style={{ background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
              >
                会員登録
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
