import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidEmail } from "../lib/validate.js";

test("accepts ordinary emails", function () {
  ["sarah@example.com", "first.last+ivf@mail.co.uk", "a_b-c@sub.domain.ae"].forEach(function (e) { assert.equal(isValidEmail(e), true, e); });
});

test("rejects anything that could escape the blob path or isn't an email", function () {
  ["", "no-at-sign", "a@b", "../x@evil.com", "a/b@example.com", "a\\b@example.com", "a b@example.com", "a..b@example.com", "a@exa..mple.com", "a@example.c", "x".repeat(250) + "@example.com", null, 42].forEach(function (e) {
    assert.equal(isValidEmail(e), false, String(e));
  });
});
