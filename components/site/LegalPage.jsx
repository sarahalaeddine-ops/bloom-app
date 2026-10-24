"use client";
import Link from "next/link";
import { LangProvider, useT, LANGS } from "../../lib/i18n";
import { LEGAL } from "../../lib/legal-i18n";
import { SUPPORT_EMAIL } from "../../lib/config";
import { BloomFlower } from "../ui/Graphics";

// Public privacy policy, support and account-deletion pages (en/ar/fr, RTL for Arabic). Linked from
// the app (Privacy Centre, sign-up, Profile) and from the store listings. DRAFT pending legal review.
var PATHS = { privacy: "/privacy", support: "/support", deletion: "/delete-account" };
var LINK_RE = new RegExp("(" + SUPPORT_EMAIL.replace(/\./g, "\\.") + "|bloomivfcompanion\\.com/delete-account)");

function Linkified({ text }) {
  return text.split(LINK_RE).map(function (part, i) {
    if (part === SUPPORT_EMAIL) return <a key={i} href={"mailto:" + SUPPORT_EMAIL} className="text-bloom-accent underline" dir="ltr">{part}</a>;
    if (part === "bloomivfcompanion.com/delete-account") return <Link key={i} href="/delete-account" className="text-bloom-accent underline" dir="ltr">{part}</Link>;
    return <span key={i}>{part}</span>;
  });
}

function Doc({ doc }) {
  var { lang, setLang } = useT();
  var L = LEGAL[lang] || LEGAL.en;
  var d = L[doc];
  return (
    <div className="min-h-screen bg-bloom-bg text-bloom-text">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2" aria-label={L.common.home}>
            <BloomFlower size={32} />
            <span className="logo" style={{ fontSize: "28px" }}>bloom</span>
          </Link>
          <div className="flex gap-1.5" role="group" aria-label={L.common.langLabel}>
            {LANGS.map(function (l) {
              var on = lang === l.id;
              return (
                <button key={l.id} onClick={function () { setLang(l.id); }} aria-pressed={on}
                  className={"px-2.5 py-1 rounded-full text-xs font-semibold border " + (on ? "bg-bloom-accent text-white border-bloom-accent" : "bg-white text-bloom-muted border-bloom-border")}>
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {doc === "privacy" && (
          <p className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl px-4 py-3 mb-6" role="note">{L.common.draft}</p>
        )}
        <h1 className="font-serif text-4xl font-light mb-2">{d.title}</h1>
        <p className="text-bloom-dim text-xs mb-6">{L.common.updated}</p>
        <p className="text-bloom-muted leading-relaxed mb-8"><Linkified text={d.intro} /></p>

        {d.sections.map(function (s) {
          return (
            <section key={s.h} className="mb-7">
              <h2 className="text-lg font-semibold mb-2">{s.h}</h2>
              {s.p.map(function (p, i) {
                return <p key={i} className="text-bloom-muted text-sm leading-relaxed mb-2"><Linkified text={p} /></p>;
              })}
            </section>
          );
        })}

        <nav className="flex flex-wrap gap-x-5 gap-y-2 pt-6 mt-10 border-t border-bloom-border text-sm">
          {Object.keys(PATHS).filter(function (k) { return k !== doc; }).map(function (k) {
            return <Link key={k} href={PATHS[k]} className="text-bloom-accent font-semibold">{L.common.links[k]}</Link>;
          })}
          <a href={"mailto:" + SUPPORT_EMAIL} className="text-bloom-muted" dir="ltr">{SUPPORT_EMAIL}</a>
        </nav>
      </div>
    </div>
  );
}

export default function LegalPage({ doc }) {
  return <LangProvider><Doc doc={doc} /></LangProvider>;
}
