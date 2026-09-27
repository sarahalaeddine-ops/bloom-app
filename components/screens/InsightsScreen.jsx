"use client";
import { useState } from "react";
import { store } from "../../lib/store";
import { CATS, ARTICLES, PHASE_ARTICLES, NEXT_PHASE } from "../../lib/demo-data";
import { useT } from "../../lib/i18n";
import { Illustration } from "../ui/Graphics";
import ReviewedBadge, { BoardSheet } from "../ui/Reviewed";
import { reviewFor } from "../../lib/demo-data";
import { BadgeCheck, Search, Bookmark, X } from "lucide-react";

function catOf(a) {
  return CATS.find(function (c) { return c.id === a.cat; }) || CATS[0];
}

function VideoBadge({ small }) {
  var { t } = useT();
  return (
    <span className={"absolute top-3 start-3 bg-black/30 text-white rounded-lg font-semibold " + (small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1")}>
      {t("ins.video")}
    </span>
  );
}

export default function InsightsScreen({ user }) {
  var { t, lang } = useT();
  function tagOf(a) { return lang === "en" ? a.tag : t("cat." + a.cat); }
  var [cat, setCat] = useState("all");
  var [selected, setSelected] = useState(null);
  var [read, setRead] = useState(function () { return store.get("read", []); });
  var [board, setBoard] = useState(false);
  var [query, setQuery] = useState("");
  var [saved, setSaved] = useState(function () { return store.get("saved_articles", []); });
  var [showSaved, setShowSaved] = useState(false);

  function toggleSave(id) {
    var next = saved.includes(id) ? saved.filter(function (x) { return x !== id; }) : saved.concat(id);
    setSaved(next);
    store.set("saved_articles", next);
  }
  function byIds(ids) {
    return ids.map(function (id) { return ARTICLES.find(function (a) { return a.id === id; }); })
      .filter(function (a) { return a && (cat === "all" || a.cat === cat); });
  }
  var userPhase = user.phase && PHASE_ARTICLES[user.phase] ? user.phase : "stimulation";
  var nextPhase = NEXT_PHASE[userPhase];
  var q = query.trim().toLowerCase();
  var results = q ? ARTICLES.filter(function (a) { return (a.title + " " + a.body + " " + a.tag + " " + t("cat." + a.cat)).toLowerCase().indexOf(q) !== -1; }) : null;

  function Card(a, wide) {
    var isSaved = saved.includes(a.id);
    return (
      <div key={a.id} className="relative flex-shrink-0" style={wide ? { width: 210 } : undefined}>
        <button onClick={function () { setSelected(a); }}
          className="w-full rounded-3xl overflow-hidden relative text-start block"
          style={{ height: wide ? 260 : 210, backgroundColor: a.color }}>
          {a.type === "video" && <VideoBadge small={!wide} />}
          <div className="absolute inset-x-0 top-5 flex justify-center">
            <Illustration name={catOf(a).art} size={wide ? 140 : 100} />
          </div>
          <div className="absolute bottom-0 inset-x-0 p-4">
            <p className="font-bold uppercase tracking-wider mb-1" style={{ color: a.textColor, fontSize: wide ? "11px" : "9px" }}>{tagOf(a)}</p>
            <p className={"text-bloom-text font-bold leading-tight " + (wide ? "text-base" : "text-xs")}>{a.title}</p>
          </div>
          {read.includes(a.id) && <span className="absolute top-3 end-12 text-[10px] font-bold" style={{ color: a.textColor }}>{t("ins.read")}</span>}
        </button>
        <button onClick={function () { toggleSave(a.id); }} aria-pressed={isSaved} aria-label={isSaved ? t("ins.unsave") : t("ins.save")}
          className="absolute top-2.5 end-2.5 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center" style={{ color: a.textColor }}>
          <Bookmark size={16} fill={isSaved ? a.textColor : "none"} />
        </button>
      </div>
    );
  }

  function Row(title, list) {
    if (!list.length) return null;
    return (
      <section className="mb-6">
        <h2 className="text-lg font-bold text-bloom-text mb-3">{title}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">{list.map(function (a) { return Card(a, true); })}</div>
      </section>
    );
  }

  var filtered = cat === "all" ? ARTICLES : ARTICLES.filter(function (a) { return a.cat === cat; });
  var popular = filtered.filter(function (a) { return a.popular; });
  var phase = (user.phase || "stimulation") === "stimulation" ? t("more.stimDay", { n: user.stimDay || 7 }) : t("phase." + user.phase);

  function gotIt() {
    if (!read.includes(selected.id)) {
      var next = read.concat(selected.id);
      setRead(next);
      store.set("read", next);
    }
    setSelected(null);
  }

  if (selected) return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <button onClick={function () { setSelected(null); }} className="px-4 py-4 text-bloom-accent font-semibold text-sm"><span className="flip-rtl">←</span> {t("common.back")}</button>
      <div className="px-5 py-8 rounded-2xl mx-4 mb-5 relative overflow-hidden" style={{ backgroundColor: selected.color }}>
        <span className="absolute -end-6 -bottom-6 opacity-60"><Illustration name={catOf(selected).art} size={150} /></span>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: selected.textColor }}>
          {tagOf(selected)}{selected.type === "video" ? " · " + t("ins.video").replace("▶ ", "") : ""}
        </p>
        <h1 className="text-2xl font-bold text-bloom-text leading-tight relative pe-20">{selected.title}</h1>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <ReviewedBadge cat={selected.cat} />
          <button onClick={function () { toggleSave(selected.id); }} aria-pressed={saved.includes(selected.id)}
            className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 bg-white/80" style={{ color: selected.textColor }}>
            <Bookmark size={14} fill={saved.includes(selected.id) ? selected.textColor : "none"} />
            {saved.includes(selected.id) ? t("ins.saved1") : t("ins.save")}
          </button>
        </div>
      </div>
      <div className="px-4">
        {lang !== "en" && <p className="text-bloom-muted text-xs bg-bloom-surface rounded-xl px-3 py-2 mb-4">{t("ins.enOnly")}</p>}
        {selected.body.split("\n\n").map(function (p, i) {
          return <p key={i} className="text-bloom-muted text-base leading-relaxed mb-4">{p}</p>;
        })}
        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-4">
          <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2">{t("ins.sources")}</p>
          <ul className="list-disc ps-4">
            {reviewFor(selected.cat).sources.map(function (s) { return <li key={s} className="text-bloom-muted text-xs mb-1">{s}</li>; })}
          </ul>
        </div>
        <p className="text-bloom-dim text-xs mb-6">{t("ins.general")}</p>
        <button onClick={gotIt} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ backgroundColor: selected.textColor }}>{t("ins.gotIt")}</button>
      </div>
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("ins.title")}</h1>
        <p className="text-bloom-muted text-sm">{t("ins.personal", { phase: phase })}</p>
        <button onClick={function () { setBoard(true); }} className="mt-2 inline-flex items-center gap-1.5 text-bloom-teal text-xs font-semibold">
          <BadgeCheck size={14} /> {t("ins.board")}
        </button>
      </div>
      {board && <BoardSheet onClose={function () { setBoard(false); }} />}

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-bloom-dim" />
          <input value={query} onChange={function (e) { setQuery(e.target.value); }} placeholder={t("ins.search")} aria-label={t("ins.search")}
            className="w-full bg-bloom-surface rounded-2xl ps-10 pe-9 py-3 text-sm text-bloom-text outline-none focus:ring-2 focus:ring-bloom-accent/30" />
          {query && (
            <button onClick={function () { setQuery(""); }} aria-label={t("common.cancel")} className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-bloom-dim"><X size={16} /></button>
          )}
        </div>
        <button onClick={function () { setShowSaved(!showSaved); }} aria-pressed={showSaved} aria-label={t("ins.savedTitle")}
          className={"w-12 h-12 rounded-2xl flex items-center justify-center relative " + (showSaved ? "bg-bloom-accent text-white" : "bg-bloom-surface text-bloom-text")}>
          <Bookmark size={20} fill={showSaved ? "white" : "none"} />
          {saved.length > 0 && !showSaved && <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 rounded-full bg-bloom-rose text-white text-[10px] font-bold flex items-center justify-center">{saved.length}</span>}
        </button>
      </div>

      {results && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-bloom-text mb-3">{t("ins.results", { n: results.length })}</h2>
          {results.length === 0 ? <p className="text-bloom-muted text-sm py-6 text-center">{t("ql.noResults")}</p> :
            <div className="grid grid-cols-2 gap-3">{results.map(function (a) { return Card(a, false); })}</div>}
        </section>
      )}

      {!results && showSaved && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-bloom-text mb-3">{t("ins.savedTitle")}</h2>
          {saved.length === 0 ? <p className="text-bloom-muted text-sm py-6 text-center">{t("ins.savedEmpty")}</p> :
            <div className="grid grid-cols-2 gap-3">{byIds(saved).map(function (a) { return Card(a, false); })}</div>}
        </section>
      )}

      {!results && !showSaved && <>

      <div className="flex gap-3 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
        {CATS.map(function (c) {
          var on = cat === c.id;
          return (
            <button key={c.id} onClick={function () { setCat(c.id); }} aria-pressed={on}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 min-w-16 transition-all"
              style={{ borderColor: on ? c.color : "#E8E0DB", backgroundColor: on ? c.color : "white" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: on ? "rgba(255,255,255,0.25)" : c.color + "18" }}>
                <span style={{ color: on ? "white" : c.color, fontSize: "14px" }}>{c.mark}</span>
              </div>
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: on ? "white" : "#7A6880" }}>{t("cat." + c.id)}</span>
            </button>
          );
        })}
      </div>

      {Row(t("ins.forPhase", { phase: phase }), byIds(PHASE_ARTICLES[userPhase]))}
      {Row(t("ins.popular"), popular)}
      {nextPhase !== userPhase && Row(t("ins.comingUp", { phase: t("phase." + nextPhase) }), byIds(PHASE_ARTICLES[nextPhase]))}
      {Row(t("ins.savedTitle"), byIds(saved))}

      <h2 className="text-lg font-bold text-bloom-text mb-3">{t("ins.all")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(function (a) { return Card(a, false); })}
      </div>
      </>}
    </div>
  );
}
