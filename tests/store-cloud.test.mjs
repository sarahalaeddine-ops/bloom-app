// Cloud-mode client logic against a mocked Supabase (node --test runs each file in its own process,
// so the env vars below only affect this file). Covers consent-gated sync, withdrawal and erasure.
import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

var SB = "https://proj.supabase.co";
var UID = "5f0c6a52-1c2b-4a57-9d3e-2b7c1e9f0a11";
var calls = [];
var deleteStatus = 200;
var remoteRow = null;
var auth, store, consent, CURRENT;

function b64url(obj) { return Buffer.from(JSON.stringify(obj)).toString("base64url"); }
var ACCESS = b64url({ alg: "HS256", typ: "JWT" }) + "." + b64url({ sub: UID, exp: Math.floor(Date.now() / 1000) + 3600, role: "authenticated" }) + ".sig";

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status: status, headers: { "content-type": "application/json" } });
}

before(async function () {
  process.env.NEXT_PUBLIC_SUPABASE_URL = SB;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  globalThis.fetch = async function (input, init) {
    var url = typeof input === "string" ? input : input.url;
    var method = (init && init.method) || (input && input.method) || "GET";
    var body = init && init.body ? String(init.body) : null;
    var headers = new Headers((init && init.headers) || (input && input.headers) || {});
    calls.push({ url: url, method: method, body: body ? JSON.parse(body) : null, auth: headers.get("authorization") });
    if (url.indexOf(SB + "/auth/v1/token") === 0) {
      return json(200, { access_token: ACCESS, refresh_token: "r", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: UID, email: "lina@example.com", user_metadata: { name: "Lina" }, aud: "authenticated" } });
    }
    if (url.indexOf(SB + "/auth/v1/logout") === 0) return json(204);
    if (url.indexOf(SB + "/rest/v1/user_state") === 0) {
      if (method === "GET") return json(200, remoteRow ? { data: remoteRow } : null);
      return json(201, []);
    }
    if (url.indexOf(SB + "/rest/v1/consent_events") === 0) return json(201, []);
    if (url === "/api/account/delete") return json(deleteStatus, deleteStatus === 200 ? { ok: true } : { error: "x" });
    throw new Error("unexpected fetch " + method + " " + url);
  };
  var mod = await import("../lib/store.js");
  auth = mod.auth; store = mod.store; consent = mod.consent; CURRENT = mod.CONSENT_VERSION;
});

beforeEach(function () {
  calls = [];
  deleteStatus = 200;
  remoteRow = null;
  localStorage.clear();
});

function upserts() { return calls.filter(function (c) { return c.url.indexOf("/rest/v1/user_state") !== -1 && c.method === "POST"; }); }

async function signIn() {
  var res = await auth.signIn("lina@example.com", "s3cret-pass");
  assert.equal(res.error, null);
  return res.data;
}

test("cloud mode: no health data is synced before consent", async function () {
  assert.equal(auth.mode(), "cloud");
  await signIn();
  store.set("checkins", [{ mood: 1 }]);
  await store.syncNow();
  assert.equal(upserts().length, 0);
  assert.equal(consent.syncing(), false);
});

test("consent to cloud sync logs an event and pushes the full snapshot with her token", async function () {
  await signIn();
  store.set("checkins", [{ mood: 1 }]);
  await consent.set({ cloud: true, ai: true });
  var ev = calls.find(function (c) { return c.url.indexOf("/rest/v1/consent_events") !== -1; });
  assert.ok(ev, "consent event inserted");
  assert.equal(ev.body.user_id, UID);
  assert.equal(ev.body.cloud, true);
  assert.equal(ev.body.created_at, undefined, "timestamp is set by the database");
  assert.equal(ev.auth, "Bearer " + ACCESS);
  var up = upserts();
  assert.equal(up.length, 1);
  assert.deepEqual(up[0].body.data.checkins, [{ mood: 1 }]);
  assert.equal(up[0].body.data.consent.ai, true);
  assert.equal(up[0].body.data.users, undefined, "LOCAL_ONLY keys never sync");
  assert.equal(consent.syncing(), true);
});

test("withdrawing cloud consent replaces the cloud copy with the consent record only", async function () {
  await signIn();
  store.set("checkins", [{ mood: 1 }]);
  await consent.set({ cloud: true, ai: true });
  calls = [];
  await consent.set({ cloud: false, ai: true });
  var up = upserts();
  assert.equal(up.length, 1);
  assert.deepEqual(Object.keys(up[0].body.data), ["consent"]);
  assert.equal(up[0].body.data.consent.cloud, false);
  assert.deepEqual(store.get("checkins", null), [{ mood: 1 }], "her data stays on this device");
  calls = [];
  store.set("checkins", [{ mood: 2 }]);
  await store.syncNow();
  assert.equal(upserts().length, 0, "no more syncing");
});

test("sign-in on a new device pulls her consent record", async function () {
  remoteRow = { consent: { version: CURRENT, cloud: true, ai: false, at: new Date().toISOString() }, checkins: [{ mood: 3 }] };
  var u = await signIn();
  assert.equal(consent.answered(u), true);
  assert.equal(consent.aiAllowed(u), false);
  assert.equal(await auth.accessToken(), ACCESS);
});

test("eraseAccount: server erasure with her token, then the device is wiped", async function () {
  await signIn();
  store.set("lang", "ar");
  store.set("checkins", [{ mood: 1 }]);
  var res = await store.eraseAccount();
  assert.deepEqual(res, { ok: true });
  var del = calls.find(function (c) { return c.url === "/api/account/delete"; });
  assert.equal(del.method, "POST");
  assert.equal(del.auth, "Bearer " + ACCESS);
  assert.deepEqual(del.body, { confirm: true });
  assert.equal(store.get("checkins", null), null);
  assert.equal(store.get("lang", null), "ar", "language preference kept");
  assert.equal(auth.getUser(), null);
});

test("eraseAccount: a server failure deletes nothing locally", async function () {
  await signIn();
  store.set("checkins", [{ mood: 1 }]);
  deleteStatus = 502;
  assert.deepEqual(await store.eraseAccount(), { error: "failed" });
  assert.deepEqual(store.get("checkins", null), [{ mood: 1 }]);
  deleteStatus = 401;
  assert.deepEqual(await store.eraseAccount(), { error: "session" });
  assert.ok(auth.getUser());
});
