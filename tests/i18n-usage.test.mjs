// Every translation key a component asks for must exist. tests/i18n.test.mjs keeps en/ar/fr in
// step, so checking English here means the key exists in all three dictionaries.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DICTS } from "../lib/i18n.js";

var root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, out) {
  readdirSync(dir).forEach(function (name) {
    var p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx|js)$/.test(name)) out.push(p);
  });
  return out;
}

var files = walk(path.join(root, "components"), []).concat(walk(path.join(root, "app"), []).filter(function (f) { return f.indexOf(path.sep + "api" + path.sep) === -1; }));

// t("key") and t("key", vars): literal keys only. Keys built at runtime ("sec." + id) are covered
// by the data-driven checks below and in the screens' own tests.
var CALL = /\bt\(\s*"([A-Za-z0-9_.\-]+)"\s*(?=[,)])/g;

test("every literal t(\"key\") used in components exists in en, ar and fr", function () {
  var missing = [];
  var count = 0;
  files.forEach(function (f) {
    var src = readFileSync(f, "utf8");
    var m;
    CALL.lastIndex = 0;
    while ((m = CALL.exec(src))) {
      count++;
      ["en", "ar", "fr"].forEach(function (lang) {
        if (!(m[1] in DICTS[lang])) missing.push(lang + ": " + m[1] + " (" + path.relative(root, f) + ")");
      });
    }
  });
  assert.ok(count > 100, "expected to find many t() calls, found " + count);
  assert.deepEqual(missing, []);
});
