"use client";
import { useState } from "react";
import { BackBtn } from "../../ui/Common";
import { ChatInput, useScrollToBottom } from "../../ui/Chat";
import { store } from "../../../lib/store";
import { ROOMS, ROOM_MESSAGES, ROOM_PROMPTS, FLOWERS } from "../../../lib/demo-data";

function myFlower() {
  var f = store.get("flower", null);
  if (!f) {
    f = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    store.set("flower", f);
  }
  return f;
}

function Room({ room, onBack }) {
  var [flower] = useState(myFlower);
  var [msgs, setMsgs] = useState(function () { return store.get("room_" + room.id, ROOM_MESSAGES[room.id] || []); });
  var [liked, setLiked] = useState(function () { return store.get("liked_" + room.id, []); });
  var [input, setInput] = useState("");
  var bottomRef = useScrollToBottom([msgs.length]);

  function save(next) {
    setMsgs(next);
    store.set("room_" + room.id, next);
  }

  function send(text) {
    var t = (text || input).trim();
    if (!t) return;
    setInput("");
    save(msgs.concat({ id: Date.now(), flower: flower, text: t, ago: "now", likes: 0, mine: true }));
  }

  function like(id) {
    var on = liked.includes(id);
    var nextLiked = on ? liked.filter(function (x) { return x !== id; }) : liked.concat(id);
    setLiked(nextLiked);
    store.set("liked_" + room.id, nextLiked);
    save(msgs.map(function (m) { return m.id === id ? { ...m, likes: m.likes + (on ? -1 : 1) } : m; }));
  }

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="sticky top-0 z-30 bg-bloom-bg">
        <BackBtn onBack={onBack} />
        <div className="px-4 pb-3 border-b border-bloom-border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
            <h1 className="text-xl font-bold text-bloom-text">{room.name}</h1>
          </div>
          <p className="text-bloom-muted text-xs mt-0.5">{room.members} members · you are Anonymous {flower}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-36">
        {msgs.map(function (m) {
          var on = liked.includes(m.id);
          return (
            <div key={m.id} className={"bg-white rounded-2xl p-4 border mb-2 " + (m.mine ? "border-bloom-accent/40" : "border-bloom-border")}>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-xs font-bold" style={{ color: room.color }}>🌸 Anonymous {m.flower}{m.mine ? " (you)" : ""}</p>
                <p className="text-bloom-dim text-[10px]">{m.ago}</p>
              </div>
              <p className="text-bloom-text text-sm leading-relaxed mb-2">{m.text}</p>
              <button onClick={function () { like(m.id); }} aria-pressed={on} className="text-xs font-semibold" style={{ color: on ? "#E07A8A" : "#7A6880" }}>
                {on ? "♥" : "♡"} {m.likes}
              </button>
            </div>
          );
        })}
        <div className="flex gap-2 overflow-x-auto mt-3 -mx-4 px-4">
          {ROOM_PROMPTS.map(function (p) {
            return <button key={p} onClick={function () { setInput(p); }} className="flex-shrink-0 text-xs text-bloom-muted bg-white border border-bloom-border rounded-full px-3 py-2">{p}</button>;
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={function () { send(); }} placeholder={"Share with " + room.name + "..."} />
    </div>
  );
}

export default function Community({ onBack }) {
  var [room, setRoom] = useState(null);
  if (room) return <Room room={room} onBack={function () { setRoom(null); }} />;

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Community</h1>
        <p className="text-bloom-muted text-sm mb-4">Women who understand, at every phase</p>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">🌸</span>
          <p className="text-bloom-accent text-xs font-semibold leading-relaxed">Anonymous by default — only your flower name is shown</p>
        </div>
        {ROOMS.map(function (r) {
          return (
            <button key={r.id} onClick={function () { setRoom(r); }} className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border mb-2 text-start" style={{ borderColor: r.color + "40" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: r.color }}>{r.name[0]}</div>
              <div className="flex-1">
                <p className="text-bloom-text text-sm font-bold">{r.name}</p>
                <p className="text-bloom-muted text-xs">{r.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: r.color }}>{r.members}</p>
                <p className="text-bloom-dim text-[10px]">members</p>
              </div>
            </button>
          );
        })}
        <p className="text-bloom-dim text-xs text-center mt-3">Be kind. Posts sharing medical advice are reviewed by our team.</p>
      </div>
    </div>
  );
}
