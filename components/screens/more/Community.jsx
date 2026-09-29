"use client";
import { useState } from "react";
import { BackBtn } from "../../ui/Common";
import { ChatInput, useScrollToBottom } from "../../ui/Chat";
import { store } from "../../../lib/store";
import { ROOMS, ROOM_PROMPTS, FLOWERS } from "../../../lib/demo-data";
import { roomPosts, saveRoomPosts, roomMembers, isSeed, seedAgoMin } from "../../../lib/community";
import { useT } from "../../../lib/i18n";

function myFlower() {
  var f = store.get("flower", null);
  if (!f || FLOWERS.indexOf(f) === -1) {
    f = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    store.set("flower", f);
  }
  return f;
}

function Room({ room, onBack }) {
  var { t } = useT();
  var [flower] = useState(myFlower);
  var [msgs, setMsgs] = useState(function () { return roomPosts(room.id); });
  var [liked, setLiked] = useState(function () { return store.get("liked_" + room.id, []); });
  var [input, setInput] = useState("");
  var bottomRef = useScrollToBottom([msgs.length]);
  var name = t("cm.room." + room.id);
  var members = roomMembers(room);
  var flowerName = function (f) { return t("flower." + f); };

  function save(next) {
    setMsgs(next);
    saveRoomPosts(room.id, next);
  }

  function send(text) {
    var body = (text || input).trim();
    if (!body) return;
    setInput("");
    save(msgs.concat({ id: Date.now(), flower: flower, text: body, likes: 0, mine: true }));
  }

  function like(id) {
    var on = liked.includes(id);
    var nextLiked = on ? liked.filter(function (x) { return x !== id; }) : liked.concat(id);
    setLiked(nextLiked);
    store.set("liked_" + room.id, nextLiked);
    save(msgs.map(function (m) { return m.id === id ? { ...m, likes: m.likes + (on ? -1 : 1) } : m; }));
  }

  function ago(m) {
    if (!isSeed(room.id, m)) return t("cm.now");
    var min = seedAgoMin(room.id, m);
    return min >= 60 ? t("cm.agoH", { n: Math.round(min / 60) }) : t("cm.agoM", { n: min });
  }

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="sticky top-0 z-30 bg-bloom-bg">
        <BackBtn onBack={onBack} />
        <div className="px-4 pb-3 border-b border-bloom-border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
            <h1 className="text-xl font-bold text-bloom-text">{name}</h1>
          </div>
          <p className="text-bloom-muted text-xs mt-0.5">
            {members !== null ? t("cm.youAre", { n: members, flower: flowerName(flower) }) : t("cm.youAreNoCount", { flower: flowerName(flower) })}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-36">
        {msgs.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-dashed text-center mb-2" style={{ borderColor: room.color + "80" }}>
            <p className="text-3xl mb-2">🌸</p>
            <p className="text-bloom-text text-sm font-bold mb-1">{t("cm.emptyTitle")}</p>
            <p className="text-bloom-muted text-xs leading-relaxed">{t("cm.emptyBody")}</p>
          </div>
        )}
        {msgs.map(function (m) {
          var on = liked.includes(m.id);
          var seeded = isSeed(room.id, m);
          return (
            <div key={m.id} className={"bg-white rounded-2xl p-4 border mb-2 " + (m.mine ? "border-bloom-accent/40" : "border-bloom-border")}>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-xs font-bold" style={{ color: room.color }}>🌸 {t("cm.anon", { flower: flowerName(m.flower) })}{m.mine ? " " + t("cm.you") : ""}</p>
                <p className="text-bloom-dim text-[10px]">{ago(m)}</p>
              </div>
              <p className="text-bloom-text text-sm leading-relaxed mb-2">{seeded ? t("cm.p." + room.id + "." + m.id) : <bdi>{m.text}</bdi>}</p>
              <button onClick={function () { like(m.id); }} aria-pressed={on} aria-label={t("cm.like")} className="text-xs font-semibold" style={{ color: on ? "#E07A8A" : "#7A6880" }}>
                {on ? "♥" : "♡"} {m.likes}
              </button>
            </div>
          );
        })}
        <div className="flex gap-2 overflow-x-auto mt-3 -mx-4 px-4">
          {ROOM_PROMPTS.map(function (p) {
            return <button key={p} onClick={function () { setInput(t(p)); }} className="flex-shrink-0 text-xs text-bloom-muted bg-white border border-bloom-border rounded-full px-3 py-2">{t(p)}</button>;
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={function () { send(); }} placeholder={t("cm.sharePh", { room: name })} />
    </div>
  );
}

export default function Community({ onBack }) {
  var { t } = useT();
  var [room, setRoom] = useState(null);
  if (room) return <Room room={room} onBack={function () { setRoom(null); }} />;

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("cm.title")}</h1>
        <p className="text-bloom-muted text-sm mb-4">{t("cm.sub")}</p>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">🌸</span>
          <p className="text-bloom-accent text-xs font-semibold leading-relaxed">{t("cm.anonNote")}</p>
        </div>
        {ROOMS.map(function (r) {
          var name = t("cm.room." + r.id);
          var members = roomMembers(r);
          return (
            <button key={r.id} onClick={function () { setRoom(r); }} className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border mb-2 text-start" style={{ borderColor: r.color + "40" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: r.color }}>{name[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-bloom-text text-sm font-bold">{name}</p>
                <p className="text-bloom-muted text-xs">{t("cm.room." + r.id + ".d")}</p>
              </div>
              {members !== null && (
                <div className="text-end">
                  <p className="text-sm font-bold" style={{ color: r.color }}>{members}</p>
                  <p className="text-bloom-dim text-[10px]">{t("cm.members")}</p>
                </div>
              )}
            </button>
          );
        })}
        <p className="text-bloom-dim text-xs text-center mt-3">{t("cm.kind")}</p>
      </div>
    </div>
  );
}
