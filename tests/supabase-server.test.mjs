import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { supabaseServerConfig, bearerToken, verifyUser, readUserState, deleteUserState, adminDeleteUser, isUuid } from "../lib/supabase-server.js";

var realFetch = globalThis.fetch;
var CFG = { url: "https://proj.supabase.co", anonKey: "anon-key" };
var ID = "5f0c6a52-1c2b-4a57-9d3e-2b7c1e9f0a11";
var TOKEN = "eyJhbGciOi.eyJzdWIiOi.c2lnbmF0dXJl";

afterEach(function () {
  globalThis.fetch = realFetch;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
});

function mock(status, body) {
  var calls = [];
  globalThis.fetch = async function (url, init) {
    calls.push({ url: String(url), init: init || {} });
    if (status instanceof Error) throw status;
    return new Response(body === undefined ? null : JSON.stringify(body), { status: status, headers: { "content-type": "application/json" } });
  };
  return calls;
}

function reqWith(auth) {
  return new Request("http://localhost/x", { headers: auth ? { authorization: auth } : {} });
}

test("server config needs both public env vars and trims the URL", function () {
  assert.equal(supabaseServerConfig(), null);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://proj.supabase.co/";
  assert.equal(supabaseServerConfig(), null);
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_x";
  assert.deepEqual(supabaseServerConfig(), { url: "https://proj.supabase.co", anonKey: "sb_publishable_x" });
});

test("bearerToken: none, malformed and well-formed", function () {
  assert.equal(bearerToken(reqWith()), null);
  assert.equal(bearerToken(reqWith("Basic dXNlcjpwYXNz")), null);
  assert.equal(bearerToken(reqWith("Bearer not-a-jwt")), "");
  assert.equal(bearerToken(reqWith("Bearer a.b.c/../../x")), "");
  assert.equal(bearerToken(reqWith("Bearer " + "a".repeat(9000) + ".b.c")), "");
  assert.equal(bearerToken(reqWith("bearer " + TOKEN)), TOKEN);
});

test("verifyUser asks Supabase Auth with the anon key and the user's token", async function () {
  var calls = mock(200, { id: ID, email: "lina@example.com", aud: "authenticated" });
  var r = await verifyUser(CFG, TOKEN);
  assert.deepEqual(r, { user: { id: ID } });
  assert.equal(calls[0].url, "https://proj.supabase.co/auth/v1/user");
  assert.equal(calls[0].init.headers.apikey, "anon-key");
  assert.equal(calls[0].init.headers.Authorization, "Bearer " + TOKEN);
});

test("verifyUser: 4xx is invalid, 5xx/429/network is unavailable, odd bodies are invalid", async function () {
  mock(401, { msg: "invalid JWT" });
  assert.deepEqual(await verifyUser(CFG, TOKEN), { error: "invalid" });
  mock(403, { error_code: "bad_jwt" });
  assert.deepEqual(await verifyUser(CFG, TOKEN), { error: "invalid" });
  mock(200, { id: "not-a-uuid" });
  assert.deepEqual(await verifyUser(CFG, TOKEN), { error: "invalid" });
  mock(503, {});
  assert.deepEqual(await verifyUser(CFG, TOKEN), { error: "unavailable" });
  mock(429, {});
  assert.deepEqual(await verifyUser(CFG, TOKEN), { error: "unavailable" });
  mock(new Error("down"));
  assert.deepEqual(await verifyUser(CFG, TOKEN), { error: "unavailable" });
});

test("readUserState reads her own row with her token (RLS applies)", async function () {
  var calls = mock(200, [{ data: { user: { clinic: "C" } } }]);
  var r = await readUserState(CFG, TOKEN, ID);
  assert.deepEqual(r, { data: { user: { clinic: "C" } } });
  assert.equal(calls[0].url, "https://proj.supabase.co/rest/v1/user_state?user_id=eq." + ID + "&select=data");
  assert.equal(calls[0].init.headers.Authorization, "Bearer " + TOKEN);
  mock(200, []);
  assert.deepEqual(await readUserState(CFG, TOKEN, ID), { data: null });
  mock(500, {});
  assert.deepEqual(await readUserState(CFG, TOKEN, ID), { error: "unavailable" });
  assert.deepEqual(await readUserState(CFG, TOKEN, "1 or 1=1"), { error: "unavailable" });
});

test("deleteUserState deletes with her token and a user_id filter", async function () {
  var calls = mock(204);
  assert.deepEqual(await deleteUserState(CFG, TOKEN, ID), { ok: true });
  assert.equal(calls[0].init.method, "DELETE");
  assert.equal(calls[0].url, "https://proj.supabase.co/rest/v1/user_state?user_id=eq." + ID);
  assert.equal(calls[0].init.headers.Authorization, "Bearer " + TOKEN);
  mock(401, {});
  assert.deepEqual(await deleteUserState(CFG, TOKEN, ID), { error: "failed" });
});

test("adminDeleteUser: hard delete, key headers by key type, 404 only ok for user_not_found", async function () {
  var calls = mock(200, {});
  assert.deepEqual(await adminDeleteUser(CFG, "legacy.service.jwt", ID), { ok: true });
  assert.equal(calls[0].url, "https://proj.supabase.co/auth/v1/admin/users/" + ID);
  assert.equal(calls[0].init.method, "DELETE");
  assert.equal(calls[0].init.headers.apikey, "legacy.service.jwt");
  assert.equal(calls[0].init.headers.Authorization, "Bearer legacy.service.jwt");
  assert.deepEqual(JSON.parse(calls[0].init.body), { should_soft_delete: false });

  calls = mock(200, {});
  await adminDeleteUser(CFG, "sb_secret_abc", ID);
  assert.equal(calls[0].init.headers.apikey, "sb_secret_abc");
  assert.equal(calls[0].init.headers.Authorization, undefined, "new secret keys are never sent as Bearer");

  mock(404, { error_code: "user_not_found" });
  assert.deepEqual(await adminDeleteUser(CFG, "k.k.k", ID), { ok: true });
  mock(404, { message: "no route" });
  assert.deepEqual(await adminDeleteUser(CFG, "k.k.k", ID), { error: "failed" });
  mock(500, {});
  assert.deepEqual(await adminDeleteUser(CFG, "k.k.k", ID), { error: "failed" });
  assert.deepEqual(await adminDeleteUser(CFG, "", ID), { error: "failed" });
  assert.deepEqual(await adminDeleteUser(CFG, "k.k.k", "../../settings"), { error: "failed" });
});

test("isUuid", function () {
  assert.ok(isUuid(ID));
  assert.ok(!isUuid(ID + "x"));
  assert.ok(!isUuid(null));
});
