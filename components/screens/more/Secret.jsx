"use client";
import { useState } from "react";
import { BackBtn } from "../../ui/Common";
import { ChatBubble, Typing, ChatInput, useScrollToBottom } from "../../ui/Chat";
import { Illustration } from "../../ui/Graphics";
import { store } from "../../../lib/store";
import { randomB64, deriveKey, encryptJSON, decryptJSON } from "../../../lib/crypto";
import { SECRET_PROMPTS, SECRET_REPLIES } from "../../../lib/demo-data";
import { useT, DICTS } from "../../../lib/i18n";

// Bloom's own messages are stored as i18n keys (k) so they read in her current language. Entries
// saved before 2026-09-29 hold the English text: map it back to its key.
var INTRO = { role: "assistant", k: "secret.intro" };
var EN_TO_KEY = {};
["secret.intro"].concat(SECRET_REPLIES).forEach(function (k) { EN_TO_KEY[DICTS.en[k]] = k; });

function bloomKey(m) {
  if (m.role !== "assistant") return null;
  return m.k || EN_TO_KEY[m.content] || null;
}

// Vault shape (stored as "secret_vault", safe to sync): { v: 1, salt, check: {iv, ct}, msgs: {iv, ct} }
export default function Secret({ onBack }) {
  var { t } = useT();
  var [vault, setVault] = useState(function () { return store.get("secret_vault", null); });
  var [key, setKey] = useState(null);
  var [pass, setPass] = useState("");
  var [pass2, setPass2] = useState("");
  var [error, setError] = useState("");
  var [busy, setBusy] = useState(false);
  var [forgot, setForgot] = useState(false);
  var [msgs, setMsgs] = useState([INTRO]);
  var [input, setInput] = useState("");
  var [typing, setTyping] = useState(false);
  var bottomRef = useScrollToBottom([msgs, typing]);

  async function persist(k, list) {
    var next = { ...store.get("secret_vault", vault), msgs: await encryptJSON(k, list) };
    store.set("secret_vault", next);
    setVault(next);
  }

  async function create(e) {
    e.preventDefault();
    if (pass.length < 6) { setError(t("secret.errShort")); return; }
    if (pass !== pass2) { setError(t("secret.errMatch")); return; }
    setBusy(true);
    try {
      var salt = randomB64(16);
      var k = await deriveKey(pass, salt);
      var legacy = store.get("secret", null); // plaintext entries from before encryption
      var list = Array.isArray(legacy) && legacy.length ? legacy : [INTRO];
      var v = { v: 1, salt: salt, check: await encryptJSON(k, "bloom"), msgs: await encryptJSON(k, list) };
      store.set("secret_vault", v);
      store.remove("secret");
      setVault(v); setKey(k); setMsgs(list); setPass(""); setPass2(""); setError("");
    } catch {
      setError(t("secret.errCrypto"));
    }
    setBusy(false);
  }

  async function unlock(e) {
    e.preventDefault();
    setBusy(true);
    try {
      var k = await deriveKey(pass, vault.salt);
      await decryptJSON(k, vault.check);
      setMsgs(await decryptJSON(k, vault.msgs));
      setKey(k); setPass(""); setError("");
    } catch {
      setError(t("secret.errWrong"));
    }
    setBusy(false);
  }

  function erase() {
    store.remove("secret_vault");
    store.remove("secret");
    setVault(null); setForgot(false); setError("");
  }

  function send(text) {
    var msg = (text || input).trim();
    if (!msg || typing) return;
    setInput("");
    var next = msgs.concat({ role: "user", content: msg });
    setMsgs(next);
    persist(key, next);
    setTyping(true);
    var reply = SECRET_REPLIES[next.filter(function (m) { return m.role === "user"; }).length % SECRET_REPLIES.length];
    setTimeout(function () {
      var withReply = next.concat({ role: "assistant", k: reply });
      setMsgs(withReply);
      persist(key, withReply);
      setTyping(false);
    }, 1100);
  }

  var inputCls = "w-full bg-white border border-bloom-border rounded-2xl px-4 py-3 text-bloom-text outline-none mb-3 focus:border-bloom-accent";

  if (!key) return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <form onSubmit={vault ? unlock : create} className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-24">
        <Illustration name="shield" size={96} />
        <h2 className="text-xl font-bold text-bloom-text mt-3 mb-2">{t("sec.secret")}</h2>
        <p className="text-bloom-muted text-sm mb-6 leading-relaxed">
          {vault ? t("secret.unlockHint") : t("secret.createHint")}
        </p>
        <label htmlFor="sp-pass" className="sr-only">{t("secret.pass")}</label>
        <input id="sp-pass" type="password" value={pass} onChange={function (e) { setPass(e.target.value); }} placeholder={t("secret.pass")} autoComplete={vault ? "current-password" : "new-password"} className={inputCls} />
        {!vault && (
          <>
            <label htmlFor="sp-pass2" className="sr-only">{t("secret.pass2")}</label>
            <input id="sp-pass2" type="password" value={pass2} onChange={function (e) { setPass2(e.target.value); }} placeholder={t("secret.pass2")} autoComplete="new-password" className={inputCls} />
          </>
        )}
        {error && <p className="text-red-500 text-xs mb-3" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="text-white font-semibold px-10 py-3 rounded-xl disabled:opacity-60" style={{ backgroundColor: "#8B7AC5" }}>
          {busy ? t("secret.working") : vault ? t("secret.unlock") : t("secret.create")}
        </button>
        <p className="text-bloom-dim text-xs mt-4 leading-relaxed">{t("secret.aes")}</p>
        {vault && !forgot && <button type="button" onClick={function () { setForgot(true); }} className="text-bloom-dim text-xs mt-3 underline">{t("secret.forgot")}</button>}
        {vault && forgot && (
          <div className="mt-4 bg-white rounded-2xl p-4 border border-red-200">
            <p className="text-bloom-text text-sm mb-3">{t("secret.forgotBody")}</p>
            <div className="flex gap-2">
              <button type="button" onClick={function () { setForgot(false); }} className="flex-1 py-2.5 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">{t("common.cancel")}</button>
              <button type="button" onClick={erase} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold">{t("secret.erase")}</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="sticky top-0 z-30 bg-bloom-bg">
        <div className="flex items-center justify-between">
          <BackBtn onBack={onBack} />
          <button onClick={function () { setKey(null); setMsgs([INTRO]); }} className="px-4 text-bloom-muted text-xs">{t("secret.lock")} ▣</button>
        </div>
        <div className="mx-4 mb-3 bg-purple-50 rounded-xl p-3 flex items-center gap-2 border border-purple-200">
          <span style={{ color: "#8B7AC5" }}>▣</span>
          <p className="text-xs font-bold" style={{ color: "#8B7AC5" }}>{t("secret.banner")}</p>
        </div>
        <p className="mx-4 mb-2 -mt-1 text-bloom-dim text-[10px]">{t("secret.crisis")}</p>
      </div>
      <div className="flex-1 px-4 pb-36">
        {msgs.map(function (m, i) { var k = bloomKey(m); return <ChatBubble key={i} role={m.role} content={k ? t(k) : m.content} mark="▣" />; })}
        {msgs.length <= 1 && (
          <div className="flex flex-col items-start gap-2 mt-2">
            {SECRET_PROMPTS.map(function (p) {
              return <button key={p} onClick={function () { send(t(p)); }} className="text-xs text-bloom-muted bg-white border border-bloom-border rounded-full px-3 py-2 text-start">&ldquo;{t(p)}&rdquo;</button>;
            })}
          </div>
        )}
        {typing && <Typing mark="▣" />}
        <div ref={bottomRef} />
      </div>
      <ChatInput value={input} onChange={setInput} onSend={function () { send(); }} disabled={typing} placeholder={t("secret.ph")} />
    </div>
  );
}
