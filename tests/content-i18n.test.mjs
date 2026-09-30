// Seeded content is shown through i18n keys built at runtime ("tww.d" + day + ".t"), which the
// literal-key scan in tests/i18n-usage.test.mjs can't see. Check every one exists in en, ar, fr.
import { test } from "node:test";
import assert from "node:assert/strict";
import { DICTS } from "../lib/i18n.js";
import * as D from "../lib/demo-data.js";
import { ARTICLE_TEXT, localizeArticle } from "../lib/articles-i18n.js";

var LANGS = ["en", "ar", "fr"];

function keysFor() {
  var k = [];
  D.TWW_DAYS.forEach(function (d) { k.push("tww.d" + d.day + ".t", "tww.d" + d.day + ".b"); });
  D.PREGNANCY_WEEKS.forEach(function (w) { k.push("preg.w" + w.week + ".size", "preg.w" + w.week + ".body"); });
  D.FAILED_STEPS.forEach(function (n) { k.push("fail.s" + n + ".t", "fail.s" + n + ".b"); });
  D.WTF_QUESTIONS.forEach(function (n) { k.push("fail.q" + n); });
  D.PARTNER_FEATURES.forEach(function (f) { k.push("partner.f" + f.n, "partner.f" + f.n + ".d"); });
  D.PARTNER_TIPS.forEach(function (n) { k.push("partner.tip" + n, "partner.tip" + n + ".d"); });
  D.PARTNER_SEES.forEach(function (n) { k.push("partner.sees" + n); });
  D.PARTNER_FAQ.forEach(function (n) { k.push("partner.faq" + n, "partner.faq" + n + ".a"); });
  k = k.concat(D.SECRET_REPLIES, D.SECRET_PROMPTS, D.FREE_TIER);
  D.PLANS.forEach(function (p) { k = k.concat(p.features); });
  D.VIDEO_MOODS.forEach(function (m) { k.push("vid.mood." + m); });
  D.VIDEO_CATS.forEach(function (c) { k.push("vid.cat." + c.id); });
  D.VIDEOS.forEach(function (v) {
    k.push("vid." + v.id, v.phase);
    v.moods.forEach(function (m) { assert.ok(D.VIDEO_MOODS.indexOf(m) !== -1, "unknown mood " + m); });
  });
  D.REVIEW_BOARD.forEach(function (r) { k.push("rb.role." + r.id); });
  return k;
}

test("every runtime content key exists in en, ar and fr", function () {
  var missing = [];
  keysFor().forEach(function (key) {
    LANGS.forEach(function (lang) { if (!(key in DICTS[lang])) missing.push(lang + ": " + key); });
  });
  assert.deepEqual(missing, []);
});

test("every Insights article has an Arabic and a French title and body", function () {
  ["ar", "fr"].forEach(function (lang) {
    D.ARTICLES.forEach(function (a) {
      var tr = ARTICLE_TEXT[lang][a.id];
      assert.ok(tr && tr.title && tr.body, lang + " article " + a.id);
      assert.equal(tr.body.split("\n\n").length, a.body.split("\n\n").length, lang + " article " + a.id + " paragraphs");
      assert.equal(localizeArticle(a, lang).translated, true);
    });
  });
  assert.equal(localizeArticle(D.ARTICLES[0], "en").title, D.ARTICLES[0].title);
});

test("medical screens end with a confirm-with-your-clinic line in every language", function () {
  ["tww.clinic", "preg.clinic", "fail.clinic"].forEach(function (k) {
    assert.match(DICTS.en[k], /clinic/i, k);
    assert.match(DICTS.ar[k], /عيادتكِ/, k);
    assert.match(DICTS.fr[k], /clinique/i, k);
  });
});
