import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_ORIGINS, allowedOrigin, withCors, preflight } from "../lib/cors.js";
import { apiUrl, siteUrl } from "../lib/config.js";

function r(origin) { return new Request("https://bloom.test/api/nora", { headers: origin ? { origin: origin } : {} }); }

test("only the two Capacitor origins are allowed", function () {
  assert.deepEqual(APP_ORIGINS, ["capacitor://localhost", "https://localhost"]);
  assert.equal(allowedOrigin(r("capacitor://localhost")), "capacitor://localhost");
  assert.equal(allowedOrigin(r("https://localhost")), "https://localhost");
  ["http://localhost", "https://localhost:3000", "https://evil.example", "null", ""].forEach(function (o) {
    assert.equal(allowedOrigin(r(o)), null, o);
  });
});

test("withCors never allows credentials and always varies on Origin", function () {
  var res = withCors(r("https://localhost"), Response.json({ ok: true }));
  assert.equal(res.headers.get("access-control-allow-origin"), "https://localhost");
  assert.equal(res.headers.get("access-control-allow-credentials"), null);
  assert.match(res.headers.get("vary"), /Origin/);
  var web = withCors(r(null), Response.json({ ok: true }));
  assert.equal(web.headers.get("access-control-allow-origin"), null);
});

test("preflight answers 204 and caches for 10 minutes for app origins only", function () {
  var ok = preflight(r("capacitor://localhost"));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get("access-control-max-age"), "600");
  assert.equal(preflight(r("https://evil.example")).headers.get("access-control-allow-origin"), null);
});

test("web build keeps API and page paths relative", function () {
  assert.equal(apiUrl("/api/nora"), "/api/nora");
  assert.equal(siteUrl("/privacy"), "/privacy");
});
