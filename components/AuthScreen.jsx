"use client";
import { useState } from "react";
import { auth } from "../lib/store";
import { BloomFlower, Blobs } from "./ui/Graphics";
import { useT, LANGS } from "../lib/i18n";
import { IS_APP_BUILD, siteUrl } from "../lib/config";
import { isNative } from "../lib/native";

export default function AuthScreen({ onLogin }) {
  var { t, lang, setLang } = useT();
  var [mode, setMode] = useState("signup");
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [error, setError] = useState("");
  var [busy, setBusy] = useState(false);

  async function handleAuth(e) {
    if (e) e.preventDefault();
    if (busy) return;
    setError("");
    if (mode === "signup" && !name.trim()) { setError(t("auth.errName")); return; }
    if (!email.trim() || !password) { setError(t("auth.errFields")); return; }
    if (email.indexOf("@") === -1) { setError(t("auth.errEmail")); return; }
    setBusy(true);
    var result;
    try {
      result = mode === "signup" ? await auth.signUp(name, email, password) : await auth.signIn(email, password);
    } catch {
      result = { error: t("auth.errNetwork") };
    }
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    onLogin(result.data);
  }

  var inputCls = "w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none focus:border-bloom-accent transition-colors";

  return (
    <div className="relative min-h-screen bg-bloom-bg flex flex-col items-center justify-center px-6 py-10 overflow-hidden">
      <Blobs />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10 flex flex-col items-center">
          <BloomFlower size={64} className="mb-3" />
          <p className="logo" style={{ fontSize: "52px", lineHeight: "1", marginBottom: "4px" }}>bloom</p>
          <p className="text-bloom-muted text-sm font-light">{t("app.tagline")}</p>
        </div>

        <form onSubmit={handleAuth} className="bg-white rounded-3xl p-6 border border-bloom-border shadow-sm">
          <div className="flex bg-bloom-surface rounded-xl p-1 mb-6" role="tablist">
            {["signup", "login"].map(function (m) {
              return (
                <button type="button" key={m} role="tab" aria-selected={mode === m} onClick={function () { setMode(m); setError(""); }}
                  className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all " + (mode === m ? "bg-bloom-accent text-white" : "text-bloom-muted")}>
                  {m === "signup" ? t("auth.signup") : t("auth.login")}
                </button>
              );
            })}
          </div>

          {mode === "signup" && (
            <div className="mb-4">
              <label htmlFor="name" className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">{t("auth.name")}</label>
              <input id="name" value={name} onChange={function (e) { setName(e.target.value); }} autoComplete="given-name" className={inputCls} />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">{t("auth.email")}</label>
            <input id="email" type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="your@email.com" dir="ltr" autoComplete="email" className={inputCls} />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">{t("auth.password")}</label>
            <input id="password" type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} placeholder={t("auth.pwPh")}
              autoComplete={mode === "signup" ? "new-password" : "current-password"} className={inputCls} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4" role="alert">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          <button type="submit" disabled={busy} className="w-full bg-bloom-accent hover:bg-bloom-deep text-white font-semibold py-4 rounded-xl mt-2 transition-colors disabled:opacity-60">
            {busy ? t("auth.busy") : mode === "signup" ? t("auth.create") : t("auth.login")}
          </button>

          <button type="button" onClick={function () { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="w-full text-bloom-dim text-xs text-center mt-4">
            {mode === "login" ? t("auth.toSignup") : t("auth.toLogin")}
          </button>
        </form>

        {/* No demo persona in the store app (App Store 2.2: demos belong in TestFlight). Reviewers
            sign in with a reviewer account instead (docs/sa6/app-store.md). */}
        {!(IS_APP_BUILD || isNative()) && (
          <button onClick={function () { onLogin(auth.demo()); }}
            className="w-full mt-4 py-3.5 rounded-2xl border-2 border-dashed border-bloom-accent/40 text-bloom-accent text-sm font-semibold bg-white/60">
            {t("auth.demo")}
          </button>
        )}

        <p className="text-bloom-dim text-xs text-center mt-6">{t("auth.private")}</p>
        <p className="text-bloom-dim text-xs text-center mt-2 leading-relaxed">{t("app.medical")}</p>
        <p className="text-xs text-center mt-2">
          <a href={siteUrl("/privacy")} target="_blank" rel="noopener noreferrer" className="text-bloom-accent font-semibold underline">{t("legal.privacy")}</a>
          <span className="text-bloom-dim"> · </span>
          <a href={siteUrl("/support")} target="_blank" rel="noopener noreferrer" className="text-bloom-accent font-semibold underline">{t("legal.support")}</a>
        </p>
        <div className="flex justify-center gap-2 mt-4" role="group" aria-label={t("lang")}>
          {LANGS.map(function (l) {
            var on = lang === l.id;
            return (
              <button key={l.id} onClick={function () { setLang(l.id); }} aria-pressed={on}
                className={"px-3 py-1.5 rounded-full text-xs font-semibold border " + (on ? "bg-bloom-accent text-white border-bloom-accent" : "bg-white text-bloom-muted border-bloom-border")}>
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
