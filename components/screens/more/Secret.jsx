"use client";
import { useState } from "react";
import { BackBtn } from "../../ui/Common";
import { ChatBubble, Typing, ChatInput, useScrollToBottom } from "../../ui/Chat";
import { Illustration } from "../../ui/Graphics";
import { store } from "../../../lib/store";
import { randomB64, deriveKey, encryptJSON, decryptJSON } from "../../../lib/crypto";
import { SECRET_PROMPTS, SECRET_REPLIES } from "../../../lib/demo-data";

var INTRO = { role: "assistant", content: "This is your Secret Space.\n\nEverything here is encrypted on your device with your passphrase. Not even Bloom can read it. Say what you really feel." };

// Vault shape (stored as "secret_vault", safe to sync): { v: 1, salt, check: {iv, ct}, msgs: {iv, ct} }
export default function Secret({ onBack }) {
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
    if (pass.length < 6) { setError("Use at least 6 characters."); return; }
    if (pass !== pass2) { setError("Passphrases don't match."); return; }
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
      setError("This browser can't encrypt data. Please update it and try again.");
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
      setError("That passphrase didn't work.");
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
      var withReply = next.concat({ role: "assistant", content: reply });
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
        <h2 className="text-xl font-bold text-bloom-text mt-3 mb-2">Secret Space</h2>
        <p className="text-bloom-muted text-sm mb-6 leading-relaxed">
          {vault ? "Enter your passphrase to unlock." : "Choose a passphrase. Your entries are encrypted with it on this device, so only you can read them."}
        </p>
        <label htmlFor="sp-pass" className="sr-only">Passphrase</label>
        <input id="sp-pass" type="password" value={pass} onChange={function (e) { setPass(e.target.value); }} placeholder="Passphrase" autoComplete={vault ? "current-password" : "new-password"} className={inputCls} />
        {!vault && (
          <>
            <label htmlFor="sp-pass2" className="sr-only">Repeat passphrase</label>
            <input id="sp-pass2" type="password" value={pass2} onChange={function (e) { setPass2(e.target.value); }} placeholder="Repeat passphrase" autoComplete="new-password" className={inputCls} />
          </>
        )}
        {error && <p className="text-red-500 text-xs mb-3" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="text-white font-semibold px-10 py-3 rounded-xl disabled:opacity-60" style={{ backgroundColor: "#8B7AC5" }}>
          {busy ? "Working…" : vault ? "Unlock" : "Create my Secret Space"}
        </button>
        <p className="text-bloom-dim text-xs mt-4 leading-relaxed">AES-256 encryption. If you forget your passphrase, nobody can recover your entries, including us.</p>
        {vault && !forgot && <button type="button" onClick={function () { setForgot(true); }} className="text-bloom-dim text-xs mt-3 underline">Forgot passphrase?</button>}
        {vault && forgot && (
          <div className="mt-4 bg-white rounded-2xl p-4 border border-red-200">
            <p className="text-bloom-text text-sm mb-3">Your entries can&apos;t be recovered without the passphrase. Erase Secret Space and start again?</p>
            <div className="flex gap-2">
              <button type="button" onClick={function () { setForgot(false); }} className="flex-1 py-2.5 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">Cancel</button>
              <button type="button" onClick={erase} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold">Erase</button>
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
          <button onClick={function () { setKey(null); setMsgs([INTRO]); }} className="px-4 text-bloom-muted text-xs">Lock ▣</button>
        </div>
        <div className="mx-4 mb-3 bg-purple-50 rounded-xl p-3 flex items-center gap-2 border border-purple-200">
          <span style={{ color: "#8B7AC5" }}>▣</span>
          <p className="text-xs font-bold" style={{ color: "#8B7AC5" }}>Encrypted on your device · only you can read this</p>
        </div>
      </div>
      <div className="flex-1 px-4 pb-36">
        {msgs.map(function (m, i) { return <ChatBubble key={i} role={m.role} content={m.content} mark="▣" />; })}
        {msgs.length <= 1 && (
          <div className="flex flex-col items-start gap-2 mt-2">
            {SECRET_PROMPTS.map(function (p) {
              return <button key={p} onClick={function () { send(p); }} className="text-xs text-bloom-muted bg-white border border-bloom-border rounded-full px-3 py-2 text-start">&ldquo;{p}&rdquo;</button>;
            })}
          </div>
        )}
        {typing && <Typing mark="▣" />}
        <div ref={bottomRef} />
      </div>
      <ChatInput value={input} onChange={setInput} onSend={function () { send(); }} disabled={typing} placeholder="Say what you really feel..." />
    </div>
  );
}
