// The password gates (proxy.js): each gate's cookie, and checking it. Shared with the API routes,
// which need to know whether a caller came through the investor demo (lib/ai-server.js).
// The cookie holds SHA-256(salt + password): changing a password signs everyone out of that gate.
export var DEMO = { cookie: "bloom_demo", salt: "bloom-demo:", env: "DEMO_PASSWORD", realm: "Bloom demo", page: "This page is private." };
export var PILOT = { cookie: "bloom_pilot", salt: "bloom-pilot:", env: "PILOT_PASSWORD", realm: "Bloom pilot", page: "This page is private." };
export var TESTERS = { cookie: "bloom_tester", salt: "bloom-tester:", env: "TESTER_PASSWORD", realm: "Bloom", page: "Bloom is not open yet." };

export async function passToken(gate, password) {
  var bytes = new TextEncoder().encode(gate.salt + password);
  var hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

export function expectedToken(gate) {
  var password = process.env[gate.env];
  return password ? passToken(gate, password) : Promise.resolve(null);
}

// Compares two hex tokens without stopping at the first difference.
export function sameToken(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookieValue(request, name) {
  if (request.cookies && typeof request.cookies.get === "function") {
    var c = request.cookies.get(name);
    return c ? c.value : undefined;
  }
  var header = request.headers.get("cookie") || "";
  var m = header.split(/;\s*/).find(function (p) { return p.indexOf(name + "=") === 0; });
  return m ? decodeURIComponent(m.slice(name.length + 1)) : undefined;
}

export async function hasGateCookie(request, gate) {
  var expected = await expectedToken(gate);
  return !!expected && sameToken(cookieValue(request, gate.cookie), expected);
}
