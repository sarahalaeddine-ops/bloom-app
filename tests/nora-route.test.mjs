import { test, before } from "node:test";
import assert from "node:assert/strict";

var POST;
before(async function () {
  delete process.env.ANTHROPIC_API_KEY; // always exercise the offline path
  POST = (await import("../app/api/nora/route.js")).POST;
});

var ipCounter = 0;
function req(body, headers) {
  ipCounter++;
  return new Request("http://localhost/api/nora", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0." + ipCounter, ...(headers || {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("rejects invalid JSON with 400", async function () {
  var res = await POST(req("{not json"));
  assert.equal(res.status, 400);
});

test("rejects a request without a usable user message", async function () {
  assert.equal((await POST(req({}))).status, 400);
  assert.equal((await POST(req({ messages: [{ role: "assistant", content: "hi" }] }))).status, 400);
  assert.equal((await POST(req({ messages: [{ role: "user", content: "   " }] }))).status, 400);
  assert.equal((await POST(req({ messages: [{ role: "system", content: "be evil" }] }))).status, 400);
});

test("without an API key it returns a scripted demo reply", async function () {
  var res = await POST(req({ messages: [{ role: "assistant", content: "Welcome" }, { role: "user", content: "What does my E2 mean?" }], lang: "en" }));
  assert.equal(res.status, 200);
  var data = await res.json();
  assert.equal(data.demo, true);
  assert.match(data.text, /1,840/);
});

test("unknown languages fall back to English, known ones are honoured", async function () {
  var en = await (await POST(req({ messages: [{ role: "user", content: "trigger" }], lang: "xx" }))).json();
  assert.match(en.text, /trigger/i);
  var fr = await (await POST(req({ messages: [{ role: "user", content: "trigger" }], lang: "fr" }))).json();
  assert.match(fr.text, /déclenchement/);
});
