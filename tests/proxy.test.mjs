import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { proxy, config } from "../proxy.js";

function token(pw) { return createHash("sha256").update("bloom-demo:" + pw).digest("hex"); }
function req(path, headers, host) { return new NextRequest("https://" + (host || "bloomivfcompanion.com") + path, { headers: headers || {} }); }
function testerToken(pw) { return createHash("sha256").update("bloom-tester:" + pw).digest("hex"); }
function basic(pw) { return "Basic " + Buffer.from("anyone:" + pw).toString("base64"); }
function passedThrough(res) { return res.status === 200 && res.headers.get("x-middleware-next") === "1"; }

afterEach(function () { delete process.env.DEMO_PASSWORD; delete process.env.TESTER_PASSWORD; delete process.env.APP_OPEN; });

test("runs on the homepage, the real app, the demo page, the Nora API and the demo voice-over only", function () {
  assert.deepEqual(config.matcher, ["/", "/app", "/app/:path*", "/demo-7q4x", "/demo-7q4x/:path*", "/api/nora", "/api/voice"]);
});

test("voice-over API needs the demo cookie; the native app's Bearer pass is for Nora only", async function () {
  process.env.DEMO_PASSWORD = "pw-123";
  assert.equal((await proxy(req("/api/voice?line=0123abcd"))).status, 401);
  assert.equal((await proxy(req("/api/voice", { authorization: "Bearer abc.def.ghi" }))).status, 401);
  assert.equal((await proxy(new NextRequest("https://bloom.test/api/voice", { method: "OPTIONS" }))).status, 401);
  assert.ok(passedThrough(await proxy(req("/api/voice", { cookie: "bloom_demo=" + token("pw-123") }))));
});

test("stays locked when DEMO_PASSWORD is not set", async function () {
  assert.equal((await proxy(req("/api/nora"))).status, 401);
  var page = await proxy(req("/demo-7q4x", { authorization: basic("") }));
  assert.equal(page.status, 401);
});

test("API needs the cookie; Basic auth is not enough", async function () {
  process.env.DEMO_PASSWORD = "pw-123";
  var res = await proxy(req("/api/nora", { authorization: basic("pw-123") }));
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: "Not authorized" });
  assert.ok(passedThrough(await proxy(req("/api/nora", { cookie: "bloom_demo=" + token("pw-123") }))));
  assert.equal((await proxy(req("/api/nora", { cookie: "bloom_demo=" + token("wrong") }))).status, 401);
});

test("API: Bearer requests and CORS preflights pass the gate (native app); the route verifies them", async function () {
  process.env.DEMO_PASSWORD = "pw-123";
  assert.ok(passedThrough(await proxy(req("/api/nora", { authorization: "Bearer abc.def.ghi" }))));
  assert.ok(passedThrough(await proxy(new NextRequest("https://bloom.test/api/nora", { method: "OPTIONS", headers: { origin: "capacitor://localhost" } }))));
  assert.equal((await proxy(req("/api/nora", { authorization: "Bearer " }))).status, 401, "empty Bearer");
  assert.equal((await proxy(req("/api/nora", { authorization: "Token abc" }))).status, 401);
  delete process.env.DEMO_PASSWORD;
  assert.ok(passedThrough(await proxy(req("/api/nora", { authorization: "Bearer abc.def.ghi" }))), "also without DEMO_PASSWORD");
});

test("page: a Bearer header does not open the demo page", async function () {
  process.env.DEMO_PASSWORD = "pw-123";
  assert.equal((await proxy(req("/demo-7q4x", { authorization: "Bearer abc.def.ghi" }))).status, 401);
});

test("page: wrong password prompts again, right password sets a secure httpOnly cookie", async function () {
  process.env.DEMO_PASSWORD = "pw-123";
  var denied = await proxy(req("/demo-7q4x", { authorization: basic("nope") }));
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get("www-authenticate"), /^Basic/);
  var ok = await proxy(req("/demo-7q4x", { authorization: basic("pw-123") }));
  assert.ok(passedThrough(ok));
  var cookie = ok.headers.get("set-cookie");
  assert.match(cookie, new RegExp("bloom_demo=" + token("pw-123")));
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=lax/i);
});

test("the public website is never gated", async function () {
  assert.ok(passedThrough(await proxy(req("/"))));
  assert.ok(passedThrough(await proxy(req("/", {}, "www.bloomivfcompanion.com"))));
});

test("real app: locked without TESTER_PASSWORD, and the demo password does not open it", async function () {
  process.env.DEMO_PASSWORD = "pw-123";
  assert.equal((await proxy(req("/app", { authorization: basic("") }))).status, 401);
  process.env.TESTER_PASSWORD = "testers-1";
  var res = await proxy(req("/app", { authorization: basic("pw-123"), cookie: "bloom_demo=" + token("pw-123") }));
  assert.equal(res.status, 401);
  assert.equal(await res.text(), "Bloom is not open yet.");
  assert.match(res.headers.get("www-authenticate"), /realm="Bloom"/);
});

test("real app: the tester password sets its own cookie; app.bloomivfcompanion.com serves /app", async function () {
  process.env.TESTER_PASSWORD = "testers-1";
  var ok = await proxy(req("/", { authorization: basic("testers-1") }, "app.bloomivfcompanion.com"));
  assert.equal(new URL(ok.headers.get("x-middleware-rewrite")).pathname, "/app");
  assert.match(ok.headers.get("set-cookie"), new RegExp("bloom_tester=" + testerToken("testers-1")));
  assert.ok(passedThrough(await proxy(req("/app", { cookie: "bloom_tester=" + testerToken("testers-1") }))));
  assert.equal((await proxy(req("/", {}, "app.bloomivfcompanion.com"))).status, 401);
});

test("the tester cookie opens Nora but not the demo page or its voice-over", async function () {
  process.env.DEMO_PASSWORD = "pw-123";
  process.env.TESTER_PASSWORD = "testers-1";
  var cookie = { cookie: "bloom_tester=" + testerToken("testers-1") };
  assert.ok(passedThrough(await proxy(req("/api/nora", cookie))));
  assert.equal((await proxy(req("/api/voice?line=0123abcd", cookie))).status, 401);
  assert.equal((await proxy(req("/demo-7q4x", cookie))).status, 401);
});

test("APP_OPEN=1 opens the real app on launch day, not the demo or Nora without an account", async function () {
  process.env.APP_OPEN = "1";
  assert.ok(passedThrough(await proxy(req("/app"))));
  assert.equal(new URL((await proxy(req("/", {}, "app.bloomivfcompanion.com"))).headers.get("x-middleware-rewrite")).pathname, "/app");
  assert.equal((await proxy(req("/demo-7q4x"))).status, 401);
  assert.equal((await proxy(req("/api/nora"))).status, 401);
});
