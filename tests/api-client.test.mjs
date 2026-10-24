import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { authHeaders, askNora } from "../lib/api.js";
import { auth } from "../lib/store.js";

var realFetch = globalThis.fetch;
afterEach(function () { globalThis.fetch = realFetch; });

test("local/demo mode sends no Authorization header", async function () {
  auth.demo();
  assert.equal(await auth.accessToken(), null);
  assert.deepEqual(await authHeaders(), {});
  var seen;
  globalThis.fetch = async function (url, init) {
    seen = { url: url, init: init };
    return new Response(JSON.stringify({ text: "hi", demo: true }), { status: 200 });
  };
  var res = await askNora({ messages: [{ role: "user", content: "hi" }], lang: "en" });
  assert.equal(seen.url, "/api/nora");
  assert.equal(seen.init.headers.Authorization, undefined);
  assert.equal(res.status, 200);
  assert.equal(res.data.text, "hi");
});

test("askNora survives a non-JSON error body", async function () {
  globalThis.fetch = async function () { return new Response("This page is private.", { status: 401 }); };
  var res = await askNora({});
  assert.equal(res.status, 401);
  assert.deepEqual(res.data, {});
});
