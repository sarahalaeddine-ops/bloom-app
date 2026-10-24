import { test, before, afterEach } from "node:test";
import assert from "node:assert/strict";

var POST;
var realFetch = globalThis.fetch;
var realLog = console.log;
var realError = console.error;
var SB = "https://proj.supabase.co";
var UID = "5f0c6a52-1c2b-4a57-9d3e-2b7c1e9f0a11";
var JWT = "eyJhbGciOi.eyJzdWIiOi.c2lnbmF0dXJl";

before(async function () {
  POST = (await import("../app/api/account/delete/route.js")).POST;
});

function setEnv(service) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = SB;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  if (service) process.env.SUPABASE_SERVICE_ROLE_KEY = service;
}

afterEach(function () {
  globalThis.fetch = realFetch;
  console.log = realLog;
  console.error = realError;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

var n = 0;
function req(opts) {
  n++;
  var o = opts || {};
  var headers = { "content-type": "application/json", "x-forwarded-for": o.ip || "10.1." + Math.floor(n / 250) + "." + (n % 250) };
  if (o.token !== undefined) headers.authorization = "Bearer " + o.token;
  return new Request("http://localhost/api/account/delete", { method: "POST", headers: headers, body: o.body !== undefined ? o.body : JSON.stringify({ confirm: true }) });
}

// opts: { user: 200|401|Error, state: status, admin: status, adminBody }
function mockSupabase(opts) {
  var calls = [];
  globalThis.fetch = async function (url, init) {
    url = String(url);
    calls.push({ url: url, init: init || {} });
    function json(status, body) { return new Response(status === 204 ? null : JSON.stringify(body || {}), { status: status, headers: { "content-type": "application/json" } }); }
    if (url === SB + "/auth/v1/user") {
      if (opts.user instanceof Error) throw opts.user;
      return opts.user && opts.user !== 200 ? json(opts.user, { msg: "bad" }) : json(200, { id: UID });
    }
    if (url.indexOf(SB + "/rest/v1/user_state") === 0) return json(opts.state || 204);
    if (url === SB + "/auth/v1/admin/users/" + UID) return json(opts.admin || 200, opts.adminBody || {});
    throw new Error("unexpected fetch " + url);
  };
  return calls;
}

function quiet() {
  var lines = [];
  console.log = function (s) { lines.push(String(s)); };
  console.error = function (s) { lines.push(String(s)); };
  return lines;
}

test("404 when cloud mode is not configured (local mode never calls this)", async function () {
  assert.equal((await POST(req({ token: JWT }))).status, 404);
});

test("requires an explicit confirmation body and a Bearer token", async function () {
  setEnv("service.role.jwt");
  var calls = mockSupabase({});
  assert.equal((await POST(req({ token: JWT, body: "{}" }))).status, 400);
  assert.equal((await POST(req({ token: JWT, body: JSON.stringify({ confirm: "yes" }) }))).status, 400);
  assert.equal((await POST(req({ token: JWT, body: "not json" }))).status, 400);
  assert.equal((await POST(req({ token: JWT, body: JSON.stringify({ confirm: true, pad: "x".repeat(2000) }) }))).status, 400);
  assert.equal((await POST(req({}))).status, 401);
  assert.equal((await POST(req({ token: "garbage" }))).status, 401);
  assert.equal(calls.length, 0, "nothing reaches Supabase");
});

test("503 with a generic message when the service-role key is missing", async function () {
  setEnv();
  var lines = quiet();
  var calls = mockSupabase({});
  var res = await POST(req({ token: JWT }));
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "Account deletion is not available right now" });
  assert.equal(calls.length, 0);
  assert.equal(lines.join("").indexOf(JWT), -1);
});

test("invalid session: 401 and nothing deleted", async function () {
  setEnv("service.role.jwt");
  var calls = mockSupabase({ user: 401 });
  assert.equal((await POST(req({ token: JWT }))).status, 401);
  assert.equal(calls.length, 1);
  mockSupabase({ user: new Error("down") });
  assert.equal((await POST(req({ token: JWT }))).status, 503);
});

test("deletes her auth user with the service key first (cascade), then any leftover row with her token; logs no identifiers", async function () {
  setEnv("service.role.jwt");
  var lines = quiet();
  var calls = mockSupabase({});
  var res = await POST(req({ token: JWT, body: JSON.stringify({ confirm: true, userId: "11111111-1111-1111-1111-111111111111" }) }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, SB + "/auth/v1/user");
  assert.equal(calls[1].url, SB + "/auth/v1/admin/users/" + UID, "id from Supabase, not the body");
  assert.equal(calls[1].init.method, "DELETE");
  assert.equal(calls[1].init.headers.apikey, "service.role.jwt");
  assert.equal(calls[2].init.method, "DELETE");
  assert.equal(calls[2].url, SB + "/rest/v1/user_state?user_id=eq." + UID);
  assert.equal(calls[2].init.headers.Authorization, "Bearer " + JWT, "row delete uses her token (RLS)");
  var log = lines.join("\n");
  assert.match(log, /account_deleted/);
  assert.equal(log.indexOf(UID), -1);
  assert.equal(log.indexOf(JWT), -1);
});

test("admin delete failure: 502, generic message, and nothing else deleted; a failed leftover-row delete is fine", async function () {
  setEnv("service.role.jwt");
  quiet();
  var calls = mockSupabase({ admin: 500 });
  var res = await POST(req({ token: JWT }));
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { error: "Could not delete the account. Please try again." });
  assert.equal(calls.filter(function (c) { return c.url.indexOf("/rest/v1/") !== -1; }).length, 0, "row untouched when the account delete fails");

  mockSupabase({ state: 500 });
  assert.equal((await POST(req({ token: JWT }))).status, 200);

  mockSupabase({ admin: 404, adminBody: { error_code: "user_not_found" } });
  assert.equal((await POST(req({ token: JWT }))).status, 200, "already deleted counts as done");
});

test("rate limited to 5 attempts per IP per 10 minutes", async function () {
  setEnv("service.role.jwt");
  mockSupabase({ user: 401 });
  for (var i = 0; i < 5; i++) assert.equal((await POST(req({ token: JWT, ip: "192.0.2.9" }))).status, 401);
  var res = await POST(req({ token: JWT, ip: "192.0.2.9" }));
  assert.equal(res.status, 429);
  assert.ok(Number(res.headers.get("Retry-After")) > 0);
});
