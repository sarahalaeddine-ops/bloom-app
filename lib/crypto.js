// Web Crypto helpers: password hashing (PBKDF2-SHA256) and AES-256-GCM encryption.
// Everything runs in the browser; keys never leave the device.

var ITERATIONS = 210000; // OWASP 2023 guidance for PBKDF2-SHA256

function subtle() {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) throw new Error("Web Crypto is not available");
  return window.crypto.subtle;
}

export function toB64(buf) {
  var bytes = new Uint8Array(buf);
  var s = "";
  for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

export function fromB64(b64) {
  var s = atob(b64);
  var out = new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export function randomB64(n) {
  return toB64(window.crypto.getRandomValues(new Uint8Array(n)));
}

async function pbkdf2Bits(secret, saltB64) {
  var base = await subtle().importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveBits", "deriveKey"]);
  return subtle().deriveBits({ name: "PBKDF2", salt: fromB64(saltB64), iterations: ITERATIONS, hash: "SHA-256" }, base, 256);
}

// Returns { salt, hash } (both base64). Pass an existing salt to re-hash for comparison.
export async function hashSecret(secret, salt) {
  var s = salt || randomB64(16);
  var bits = await pbkdf2Bits(secret, s);
  return { salt: s, hash: toB64(bits) };
}

// Constant-time-ish comparison of a secret against a stored { salt, hash }.
export async function verifySecret(secret, stored) {
  if (!stored || !stored.salt || !stored.hash) return false;
  var h = (await hashSecret(secret, stored.salt)).hash;
  if (h.length !== stored.hash.length) return false;
  var diff = 0;
  for (var i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ stored.hash.charCodeAt(i);
  return diff === 0;
}

// AES-GCM key derived from a passcode. Non-extractable.
export async function deriveKey(passcode, saltB64) {
  var base = await subtle().importKey("raw", new TextEncoder().encode(passcode), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "PBKDF2", salt: fromB64(saltB64), iterations: ITERATIONS, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

export async function encryptJSON(key, value) {
  var iv = window.crypto.getRandomValues(new Uint8Array(12));
  var ct = await subtle().encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(JSON.stringify(value)));
  return { iv: toB64(iv), ct: toB64(ct) };
}

// Throws if the key is wrong or the data was tampered with.
export async function decryptJSON(key, box) {
  var pt = await subtle().decrypt({ name: "AES-GCM", iv: fromB64(box.iv) }, key, fromB64(box.ct));
  return JSON.parse(new TextDecoder().decode(pt));
}
