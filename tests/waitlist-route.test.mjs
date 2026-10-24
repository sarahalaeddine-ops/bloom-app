import { test, before } from "node:test";
import assert from "node:assert/strict";

var POST, GET;
before(async function () {
  delete process.env.BLOB_READ_WRITE_TOKEN; // never touch the real store
  var route = await import("../app/api/waitlist/route.js");
  POST = route.POST;
  GET = route.GET;
});

// Runs fn with a fake Blob token and a stubbed fetch that records each call.
async function withFakeBlob(reply, fn) {
  var realFetch = globalThis.fetch;
  var calls = [];
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_STOREID_secret";
  globalThis.fetch = async function (url, init) {
    calls.push({ url: String(url), init: init || {} });
    return Response.json(reply);
  };
  try {
    await fn(calls);
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.BLOB_READ_WRITE_TOKEN;
  }
}

var n = 0;
function req(body, ip) {
  n++;
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip || "10.9.0." + n },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("rejects malformed and oversized bodies", async function () {
  assert.equal((await POST(req("{nope"))).status, 400);
  assert.equal((await POST(req("null"))).status, 400);
  assert.equal((await POST(req({ email: "a@b.co", pad: "x".repeat(3000) }))).status, 400);
});

test("rejects invalid or path-like emails", async function () {
  assert.equal((await POST(req({ email: "../../x@evil.com" }))).status, 400);
  assert.equal((await POST(req({ email: "not an email" }))).status, 400);
});

test("valid email without storage configured returns a generic 503", async function () {
  var res = await POST(req({ email: "sarah@example.com" }));
  assert.equal(res.status, 503);
  var data = await res.json();
  assert.equal(data.error.indexOf("BLOB"), -1, "no internals in the message");
});

test("limits each IP to 5 sign-up attempts per 10 minutes", async function () {
  var ip = "192.0.2.200";
  for (var i = 0; i < 5; i++) assert.notEqual((await POST(req({ email: "x@example.com" }, ip))).status, 429);
  assert.equal((await POST(req({ email: "x@example.com" }, ip))).status, 429);
});

test("with storage configured, a sign-up is saved as a private file", async function () {
  await withFakeBlob({ url: "https://blob/x" }, async function (calls) {
    var res = await POST(req({ email: "Sarah@Example.com" }));
    assert.equal(res.status, 200);
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /pathname=waitlist%2Fsarah%40example\.com\.json/);
    assert.equal(calls[0].init.method, "PUT");
    assert.equal(calls[0].init.headers.authorization, "Bearer vercel_blob_rw_STOREID_secret");
    assert.equal(calls[0].init.headers["x-vercel-blob-store-id"], "STOREID");
    assert.equal(calls[0].init.headers["x-vercel-blob-access"], "private");
  });
});

test("with storage configured, GET returns the number of sign-ups", async function () {
  await withFakeBlob({ blobs: [{}, {}, {}], hasMore: false }, async function (calls) {
    var res = await GET();
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { count: 3 });
    assert.match(calls[0].url, /prefix=waitlist%2F/);
  });
});
