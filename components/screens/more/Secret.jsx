"use client";
import { useState } from "react";
import { BackBtn } from "../../ui/Common";
import { ChatBubble, Typing, ChatInput, useScrollToBottom } from "../../ui/Chat";
import { store } from "../../../lib/store";
import { SECRET_PROMPTS, SECRET_REPLIES } from "../../../lib/demo-data";

var INTRO = { role: "assistant", content: "This is your Secret Space.\n\nEverything here is completely private. Say what you really feel." };

export default function Secret({ onBack }) {
  var [unlocked, setUnlocked] = useState(false);
  var [pin, setPin] = useState("");
  var [error, setError] = useState("");
  var [msgs, setMsgs] = useState(function () { return store.get("secret", [INTRO]); });
  var [input, setInput] = useState("");
  var [typing, setTyping] = useState(false);
  var bottomRef = useScrollToBottom([msgs, typing]);

  function unlock(e) {
    e.preventDefault();
    if (/^\d{4,}$/.test(pin)) { setUnlocked(true); setError(""); }
    else setError("Enter a PIN of at least 4 digits");
  }

  function send(text) {
    var msg = (text || input).trim();
    if (!msg || typing) return;
    setInput("");
    var next = msgs.concat({ role: "user", content: msg });
    setMsgs(next);
    store.set("secret", next);
    setTyping(true);
    var reply = SECRET_REPLIES[next.filter(function (m) { return m.role === "user"; }).length % SECRET_REPLIES.length];
    setTimeout(function () {
      var withReply = next.concat({ role: "assistant", content: reply });
      setMsgs(withReply);
      store.set("secret", withReply);
      setTyping(false);
    }, 1100);
  }

  if (!unlocked) return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <form onSubmit={unlock} className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-24">
        <p className="text-5xl mb-4" style={{ color: "#8B7AC5" }}>▣</p>
        <h2 className="text-xl font-bold text-bloom-text mb-2">Secret Space</h2>
        <p className="text-bloom-muted text-sm mb-6 leading-relaxed">A private space for the feelings you cannot say out loud.</p>
        <input type="password" inputMode="numeric" value={pin} onChange={function (e) { setPin(e.target.value); }} placeholder="Enter PIN" aria-label="PIN"
          className="text-center text-xl tracking-widest bg-white border border-bloom-border rounded-2xl px-4 py-3 w-48 text-bloom-text outline-none mb-3 focus:border-bloom-accent" />
        {error && <p className="text-red-500 text-xs mb-3" role="alert">{error}</p>}
        <button type="submit" className="text-white font-semibold px-10 py-3 rounded-xl" style={{ backgroundColor: "#8B7AC5" }}>Enter</button>
        <p className="text-bloom-dim text-xs mt-4">Demo: any 4+ digit PIN unlocks</p>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="sticky top-0 z-30 bg-bloom-bg">
        <div className="flex items-center justify-between">
          <BackBtn onBack={onBack} />
          <button onClick={function () { setUnlocked(false); setPin(""); }} className="px-4 text-bloom-muted text-xs">Lock ▣</button>
        </div>
        <div className="mx-4 mb-3 bg-purple-50 rounded-xl p-3 flex items-center gap-2 border border-purple-200">
          <span style={{ color: "#8B7AC5" }}>▣</span>
          <p className="text-xs font-bold" style={{ color: "#8B7AC5" }}>Secret Space — Only visible to you</p>
        </div>
      </div>
      <div className="flex-1 px-4 pb-36">
        {msgs.map(function (m, i) { return <ChatBubble key={i} role={m.role} content={m.content} mark="▣" />; })}
        {msgs.length <= 1 && (
          <div className="flex flex-col items-start gap-2 mt-2">
            {SECRET_PROMPTS.map(function (p) {
              return <button key={p} onClick={function () { send(p); }} className="text-xs text-bloom-muted bg-white border border-bloom-border rounded-full px-3 py-2 text-left">&ldquo;{p}&rdquo;</button>;
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
