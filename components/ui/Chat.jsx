"use client";
import { useEffect, useRef } from "react";
import { useT } from "../../lib/i18n";
import { BloomFlower, Illustration } from "./Graphics";

// Nora gets the Bloom flower; Secret Space gets the locked journal.
function Avatar({ mark }) {
  if (mark === "✦") return <span className="w-7 h-7 rounded-full bg-white border border-bloom-border flex items-center justify-center flex-shrink-0 mt-auto"><BloomFlower size={22} animate={false} /></span>;
  return <span className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 mt-auto"><Illustration name="journal" size={28} /></span>;
}

export function ChatBubble({ role, content, mark = "✦" }) {
  var isUser = role === "user";
  return (
    <div className={"flex gap-2 mb-3 " + (isUser ? "flex-row-reverse" : "")}>
      {!isUser && (
        <Avatar mark={mark} />
      )}
      <div dir="auto" className={"max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap " +
        (isUser ? "bg-bloom-accent text-white rounded-br-sm" : "bg-white border border-bloom-border text-bloom-text rounded-bl-sm")}>
        {content}
      </div>
    </div>
  );
}

export function Typing({ mark = "✦" }) {
  var { t } = useT();
  return (
    <div className="flex gap-2 mb-3" role="status" aria-label={t("chat.typing")}>
      <Avatar mark={mark} />
      <div className="bg-white border border-bloom-border px-4 py-3 rounded-2xl rounded-bl-sm text-bloom-muted text-lg leading-none tracking-widest">
        <span className="typing-dot">·</span>
        <span className="typing-dot" style={{ animationDelay: "0.2s" }}>·</span>
        <span className="typing-dot" style={{ animationDelay: "0.4s" }}>·</span>
      </div>
    </div>
  );
}

export function ChatInput({ value, onChange, onSend, disabled, placeholder, bottom = "bottom-[64px]" }) {
  var { t } = useT();
  return (
    <div className={"fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white border-t border-bloom-border flex gap-2 z-40 " + bottom}>
      <textarea value={value} onChange={function (e) { onChange(e.target.value); }}
        onKeyDown={function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        placeholder={placeholder} rows={1} aria-label={placeholder} dir="auto"
        className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none focus:border-bloom-accent" />
      <button onClick={function () { onSend(); }} disabled={disabled || !value.trim()} aria-label={t("chat.send")}
        className="w-11 h-11 bg-bloom-accent rounded-xl flex items-center justify-center text-white disabled:opacity-40">
        <span className="flip-rtl">→</span>
      </button>
    </div>
  );
}

export function useScrollToBottom(deps) {
  var ref = useRef(null);
  useEffect(function () {
    if (ref.current) ref.current.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
