import { test, before } from "node:test";
import assert from "node:assert/strict";

var POST;
before(async function () {
  delete process.env.BLOB_READ_WRITE_TOKEN; // never touch the real store
  POST = (await import("../app/api/waitlist/route.js")).POST;
});

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
