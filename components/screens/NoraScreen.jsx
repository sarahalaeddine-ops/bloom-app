"use client";
import { useState } from "react";
import { noraReply } from "../../lib/domain.mjs";
export default function NoraScreen() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold py-4">Nora</h1>
      <div className="card">
        <p className="font-semibold text-bloom-accent mb-3">
          AI chat is not available yet
        </p>
        <p className="text-bloom-muted">{noraReply()}</p>
      </div>
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          setReply(
            "You can copy this question into your own notes for your clinic. No message was sent, saved or reviewed.",
          );
        }}
      >
        <label className="block mb-3">
          Draft a question for your clinic
          <textarea
            className="field mt-2"
            required
            maxLength={2000}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setReply("");
            }}
          />
        </label>
        <button className="btn">Keep question on this screen</button>
        {reply && (
          <p role="status" className="text-sm text-bloom-muted mt-3">
            {reply}
          </p>
        )}
      </form>
    </div>
  );
}
