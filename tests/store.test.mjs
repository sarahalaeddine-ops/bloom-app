import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { auth, store, consent, CONSENT_VERSION } from "../lib/store.js";

beforeEach(async function () {
  await store.resetDemo();
});

test("local mode is used when Supabase env vars are absent", function () {
  assert.equal(auth.mode(), "local");
});

test("local sign-up stores a salted hash, never the password", async function () {
  var res = await auth.signUp("Lina", "Lina@Example.com", "s3cret-pass");
  assert.equal(res.error, null);
  assert.equal(res.data.email, "lina@example.com");
  var raw = localStorage.getItem("bloom_users");
  assert.equal(raw.indexOf("s3cret-pass"), -1);
  var users = JSON.parse(raw);
  assert.ok(users["lina@example.com"].pw.salt && users["lina@example.com"].pw.hash);
  assert.equal(JSON.parse(localStorage.getItem("bloom_user")).pw, undefined, "current user record has no hash");
});

test("sign-up rejects short passwords and duplicate emails", async function () {
  assert.ok((await auth.signUp("A", "a@b.co", "short")).error);
  await auth.signUp("A", "a@b.co", "longenough");
  assert.ok((await auth.signUp("A", "A@B.CO", "longenough")).error);
});

test("sign-in checks the password hash", async function () {
  await auth.signUp("Lina", "lina@example.com", "s3cret-pass");
  assert.ok((await auth.signIn("lina@example.com", "wrong-pass")).error);
  assert.ok((await auth.signIn("nobody@example.com", "s3cret-pass")).error);
  var ok = await auth.signIn(" LINA@example.com ", "s3cret-pass");
  assert.equal(ok.error, null);
  assert.equal(ok.data.pw, undefined);
});

test("legacy plaintext accounts are upgraded to a hash on sign-in", async function () {
  store.set("users", { "old@example.com": { id: "1", name: "Old", email: "old@example.com", password: "legacy-pass" } });
  var res = await auth.signIn("old@example.com", "legacy-pass");
  assert.equal(res.error, null);
  var stored = store.get("users", {})["old@example.com"];
  assert.equal(stored.password, undefined);
  assert.ok(stored.pw.hash);
});

test("demo sign-in seeds Sarah and resetDemo clears everything", async function () {
  var u = auth.demo();
  assert.equal(u.name, "Sarah");
  assert.ok(store.get("checkins", null).length > 0);
  await store.resetDemo();
  assert.equal(localStorage.length, 0);
  assert.equal(auth.getUser(), null);
});

test("store.push prepends to a list", function () {
  store.push("things", 1);
  store.push("things", 2);
  assert.deepEqual(store.get("things", []), [2, 1]);
});

test("eraseAccount in local mode wipes the device without calling the server", async function () {
  var realFetch = globalThis.fetch;
  var called = false;
  globalThis.fetch = async function () { called = true; return new Response("{}"); };
  await auth.signUp("Lina", "lina@example.com", "s3cret-pass");
  store.set("checkins", [{ mood: 2 }]);
  var res = await store.eraseAccount();
  globalThis.fetch = realFetch;
  assert.deepEqual(res, { ok: true });
  assert.equal(called, false);
  assert.equal(localStorage.length, 0);
  assert.equal(auth.getUser(), null);
});

test("new real profiles carry no demo E2 or follicle values (G15)", async function () {
  var res = await auth.signUp("Lina", "lina2@example.com", "s3cret-pass");
  assert.equal(res.data.e2, undefined);
  assert.equal(res.data.follicles, undefined);
  assert.equal(res.data.onboarded, false);
});

test("consent: versioned, timestamped, opt-in, with history; demo persona never asked", async function () {
  var u = (await auth.signUp("Lina", "lina3@example.com", "s3cret-pass")).data;
  assert.equal(consent.answered(u), false);
  assert.equal(consent.aiAllowed(u), false, "no AI before consent");
  assert.equal(consent.cloudAllowed(), false);
  var rec = await consent.set({ cloud: false, ai: true });
  assert.equal(rec.version, CONSENT_VERSION);
  assert.ok(!Number.isNaN(Date.parse(rec.at)));
  assert.equal(consent.answered(u), true);
  assert.equal(consent.aiAllowed(u), true);
  await consent.set({ cloud: false, ai: false });
  var saved = consent.get();
  assert.equal(saved.ai, false, "withdrawn");
  assert.equal(saved.history.length, 2);
  assert.deepEqual(saved.history.map(function (h) { return h.ai; }), [true, false]);
  assert.equal(consent.syncing(), false, "local accounts never sync");
  store.set("consent", { version: "old", cloud: true, ai: true, at: rec.at });
  assert.equal(consent.answered(u), false, "a new consent version asks again");
  var demo = auth.demo();
  assert.equal(consent.answered(demo), true);
  assert.equal(consent.aiAllowed(demo), true);
});
