import { test } from "node:test";
import assert from "node:assert/strict";
import { DICTS, translate, langInfo } from "../lib/i18n.js";

var EN_KEYS = Object.keys(DICTS.en);

function placeholders(s) {
  return (s.match(/\{[a-zA-Z0-9_]+\}/g) || []).sort().join(",");
}

for (var lang of ["ar", "fr"]) {
  test("every English key has a " + lang + " translation", function () {
    var missing = EN_KEYS.filter(function (k) { return !(k in DICTS[lang]); });
    assert.deepEqual(missing, []);
  });

  test(lang + " has no keys that English lacks", function () {
    var extra = Object.keys(DICTS[lang]).filter(function (k) { return !(k in DICTS.en); });
    assert.deepEqual(extra, []);
  });

  test(lang + " keeps the same {placeholders} as English", function () {
    var wrong = EN_KEYS.filter(function (k) { return k in DICTS[lang] && placeholders(DICTS.en[k]) !== placeholders(DICTS[lang][k]); });
    assert.deepEqual(wrong, []);
  });
}

test("translate fills variables and falls back to English, then the key", function () {
  var key = EN_KEYS.find(function (k) { return DICTS.en[k].indexOf("{n}") !== -1; });
  assert.ok(key, "expected at least one key with {n}");
  assert.ok(translate("fr", key, { n: 7 }).indexOf("7") !== -1);
  assert.equal(translate("xx", "common.back"), DICTS.en["common.back"]);
  assert.equal(translate("en", "no.such.key"), "no.such.key");
});

test("langInfo marks Arabic as right-to-left and defaults to English", function () {
  assert.equal(langInfo("ar").dir, "rtl");
  assert.equal(langInfo("zz").id, "en");
});
