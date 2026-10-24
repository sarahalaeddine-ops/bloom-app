import { test } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter, clientIp } from "../lib/rate-limit.js";

test("allows up to the limit per window, then blocks until the window resets", function () {
  var rl = createRateLimiter({ limit: 3, windowMs: 1000 });
  var t = 1000000;
  assert.equal(rl.check("a", t).ok, true);
  assert.equal(rl.check("a", t).ok, true);
  var third = rl.check("a", t);
  assert.equal(third.ok, true);
  assert.equal(third.remaining, 0);
  var fourth = rl.check("a", t + 500);
  assert.equal(fourth.ok, false);
  assert.equal(fourth.retryAfter, 1);
  assert.equal(rl.check("b", t + 500).ok, true, "keys are independent");
  assert.equal(rl.check("a", t + 1000).ok, true, "new window");
});

test("memory stays bounded", function () {
  var rl = createRateLimiter({ limit: 1, windowMs: 60000, maxKeys: 100 });
  for (var i = 0; i < 1000; i++) rl.check("ip" + i, 5000);
  assert.ok(rl.size() <= 100);
});

test("clientIp takes the first x-forwarded-for entry, then x-real-ip", function () {
  assert.equal(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" } })), "203.0.113.5");
  assert.equal(clientIp(new Request("http://x", { headers: { "x-real-ip": "203.0.113.9" } })), "203.0.113.9");
  assert.equal(clientIp(new Request("http://x")), "unknown");
});
