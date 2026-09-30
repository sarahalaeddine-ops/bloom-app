import { test } from "node:test";
import assert from "node:assert/strict";
import { hashSecret, verifySecret, deriveKey, encryptJSON, decryptJSON, randomB64, toB64, fromB64 } from "../lib/crypto.js";

test("base64 helpers round-trip bytes", function () {
  var bytes = new Uint8Array([0, 1, 2, 250, 255]);
  assert.deepEqual(Array.from(fromB64(toB64(bytes))), Array.from(bytes));
  assert.equal(fromB64(randomB64(16)).length, 16);
});

test("hashSecret uses a random salt and verifySecret checks it", async function () {
  var a = await hashSecret("correct horse");
  var b = await hashSecret("correct horse");
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.hash, b.hash);
  assert.equal(await verifySecret("correct horse", a), true);
  assert.equal(await verifySecret("wrong horse", a), false);
  assert.equal(await verifySecret("x", null), false);
  assert.equal(await verifySecret("x", { salt: a.salt }), false);
});

test("AES-GCM encrypt/decrypt round-trips and rejects the wrong passphrase", async function () {
  var salt = randomB64(16);
  var key = await deriveKey("my passphrase", salt);
  var box = await encryptJSON(key, { entry: "private thought", n: 1 });
  assert.ok(box.iv && box.ct);
  assert.equal(box.ct.indexOf("private"), -1);
  assert.deepEqual(await decryptJSON(key, box), { entry: "private thought", n: 1 });
  var wrong = await deriveKey("not my passphrase", salt);
  await assert.rejects(decryptJSON(wrong, box));
});
