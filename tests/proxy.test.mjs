import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { proxy, config } from "../proxy.js";

function token(pw) { return createHash("sha256").update("bloom-demo:" + pw).digest("hex"); }
function req(path, headers) { return new NextRequest("https://bloom.test" + path, { headers: headers || {} }); }
function basic(pw) { return "Basic " + Buffer.from("anyone:" + pw).toString("base64"); }
function passedThrough(res) { return res.status === 200 && res.headers.get("x-middleware-next") === "1"; }

afterEach(function () { delete process.env.DEMO_PASSWORD; });

test("gates the demo page and the Nora API only", function () {
  assert.deepEqual(config.matcher, ["/demo-7q4x", "/demo-7q4x/:path*", "/api/nora"]);
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
