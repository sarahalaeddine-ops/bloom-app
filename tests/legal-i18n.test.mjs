import { test } from "node:test";
import assert from "node:assert/strict";
import { LEGAL, LEGAL_DOCS } from "../lib/legal-i18n.js";

function shape(l) {
  var out = { common: Object.keys(LEGAL[l].common).sort(), links: Object.keys(LEGAL[l].common.links).sort() };
  LEGAL_DOCS.forEach(function (d) { out[d] = LEGAL[l][d].sections.map(function (s) { return s.p.length; }); });
  return out;
}

test("privacy, support and deletion pages exist in en, ar and fr with the same structure", function () {
  ["ar", "fr"].forEach(function (l) { assert.deepEqual(shape(l), shape("en"), l); });
  ["en", "ar", "fr"].forEach(function (l) {
    LEGAL_DOCS.forEach(function (d) {
      assert.ok(LEGAL[l][d].title && LEGAL[l][d].intro, l + " " + d);
      LEGAL[l][d].sections.forEach(function (s) { assert.ok(s.h && s.p.every(function (p) { return typeof p === "string" && p.length > 0; })); });
    });
  });
});

test("the privacy policy names every processor and says it is a draft", function () {
  var text = JSON.stringify(LEGAL.en.privacy);
  ["Supabase", "Anthropic", "Vercel", "Google Fonts"].forEach(function (p) { assert.ok(text.indexOf(p) !== -1, p); });
  ["en", "ar", "fr"].forEach(function (l) { assert.match(LEGAL[l].common.draft, /DRAFT|مسودة|BROUILLON/); });
});
