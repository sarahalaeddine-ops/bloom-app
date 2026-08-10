"use client";
import { useState, useRef, useEffect } from "react";

const SUGGESTED = ["What does my E2 mean?","Am I at risk for OHSS?","When is my trigger shot?","I am scared about retrieval"];
const SYSTEM = "You are Nora, the AI companion inside Bloom — a dedicated IVF tracking app. Patient is on Stimulation Day 7, Antagonist Protocol. Follicles: Right 18,16,15,14,12,11mm Left 17,16,14,13,12mm. E2=1840. Be warm, concise, clinically accurate. Always remind user to confirm with their clinic. Keep responses under 4 sentences.";

export default function NoraScreen({ user }) {
  const [msgs, setMsgs] = useState([{role:"assistant", content:"Hi " + (user?.name || "Sarah") + ". I am Nora, your IVF companion.\n\nYou are on Stimulation Day 7 with 11 follicles and E2 at 1,840. Things look really promising.\n\nHow are you feeling today?"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, loading]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const next = [...msgs, {role:"user", content:msg}];
    setMsgs(next);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-6", max_tokens:500, system:SYSTEM, messages:next.map(m => ({role:m.role, content:m.content}))}),
      });
      const data = await res.json();
      setMsgs([...next, {role:"assistant", content:data.content?.[0]?.text || "Sorry, try again."}]);
    } catch {
      setMsgs([...next, {role:"assistant", content:"Something went wrong. Please try again."}]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-bloom-border">
        <div className="w-9 h-9 rounded-full bg-bloom-accent flex items-center justify-center">
          <span className="text-white text-sm">✦</span>
        </div>
        <div>
          <p className="text-bloom-text text-sm font-semibold">Nora</p>
          <p className="text-bloom-teal text-xs">Online · Knows your cycle</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 bg-bloom-bg">
        {msgs.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED.map((q, i) => (
              <button key={i} onClick={() => send(q)}
                className="px-3 py-2 bg-white border border-bloom-border rounded-full text-bloom-muted text-xs">
                {q}
              </button>
            ))}
          </div>
        )}

        {msgs.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex gap-2 mb-3 ${isUser ? "flex-row-reverse" : ""}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-bloom-accent flex items-center justify-center flex-shrink-0 mt-auto">
                  <span className="text-white text-xs">✦</span>
                </div>
              )}
              <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-bloom-accent text-white rounded-br-sm" : "bg-white border border-bloom-border text-bloom-text rounded-bl-sm"}`}>
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-bloom-accent flex items-center justify-center">
              <span className="text-white text-xs">✦</span>
            </div>
            <div className="bg-white border border-bloom-border px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="text-bloom-dim text-lg tracking-widest">···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white border-t border-bloom-border flex gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
          placeholder="Ask Nora anything..." rows={1}
          className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none" />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="w-11 h-11 bg-bloom-accent rounded-xl flex items-center justify-center text-white disabled:opacity-40">
          →
        </button>
      </div>
    </div>
  );
}
