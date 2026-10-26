import { NextResponse } from "next/server";

// Two password gates, each asked once by the browser (any username works) and then remembered by a
// cookie for 30 days. Without its password set, a gate stays locked.
//
// - The investor demo (/demo-7q4x, DEMO_PASSWORD): Sarah's demo, the self-playing film, the
//   voice-over API.
// - The real app (TESTER_PASSWORD): real accounts only, no demo. It lives at
//   app.bloomivfcompanion.com (its homepage is served from /app) and at bloomivfcompanion.com/app.
//   APP_OPEN=1 removes this gate on launch day. The public website at / is never gated.
//
// The native app (docs/sa6/app-store.md) has no cookie. For the Nora API only:
// - requests carrying "Authorization: Bearer <token>" go through to the route, which verifies the
//   Supabase session itself and answers 401 when it is not valid;
// - CORS preflights (OPTIONS) go through so the route can answer them (they carry no data).
// Otherwise Nora needs the demo or the tester cookie; the voice-over needs the demo cookie.
var DEMO = { cookie: "bloom_demo", salt: "bloom-demo:", env: "DEMO_PASSWORD", realm: "Bloom demo", page: "This page is private." };
var TESTERS = { cookie: "bloom_tester", salt: "bloom-tester:", env: "TESTER_PASSWORD", realm: "Bloom", page: "Bloom is not open yet." };
var MAX_AGE = 60 * 60 * 24 * 30;

async function passToken(gate, password) {
  var bytes = new TextEncoder().encode(gate.salt + password);
  var hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

function expectedToken(gate) {
  var password = process.env[gate.env];
  return password ? passToken(gate, password) : Promise.resolve(null);
}

// Compares two hex tokens without stopping at the first difference.
function sameToken(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hasCookie(request, gate) {
  var expected = await expectedToken(gate);
  return !!expected && sameToken(request.cookies.get(gate.cookie)?.value, expected);
}

function passwordFromHeader(header) {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    var decoded = atob(header.slice(6));
    return decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return null;
  }
}

function hasBearer(request) {
  var header = request.headers.get("authorization");
  return !!header && header.slice(0, 7).toLowerCase() === "bearer " && header.slice(7).trim().length > 0;
}

function appOpen() {
  var v = (process.env.APP_OPEN || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

// Lets the visitor through with the cookie or the right password (then sets the cookie);
// otherwise the browser asks for the password.
async function gatePage(request, gate, pass) {
  var expected = await expectedToken(gate);
  if (expected && sameToken(request.cookies.get(gate.cookie)?.value, expected)) return pass();
  var given = passwordFromHeader(request.headers.get("authorization"));
  if (expected && given !== null && sameToken(await passToken(gate, given), expected)) {
    var res = pass();
    res.cookies.set(gate.cookie, expected, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MAX_AGE });
    return res;
  }
  return new Response(gate.page, {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="' + gate.realm + '", charset="UTF-8"' },
  });
}

export async function proxy(request) {
  var path = request.nextUrl.pathname;

  if (path.startsWith("/api/")) {
    if (await hasCookie(request, DEMO)) return NextResponse.next();
    if (path === "/api/nora") {
      if (request.method === "OPTIONS" || hasBearer(request)) return NextResponse.next();
      if (await hasCookie(request, TESTERS)) return NextResponse.next();
    }
    return Response.json({ error: "Not authorized" }, { status: 401 });
  }

  var appHost = request.nextUrl.hostname.startsWith("app.");
  if (path === "/" && !appHost) return NextResponse.next(); // the public website

  if (path === "/" || path === "/app" || path.startsWith("/app/")) {
    var pass = function () { return path === "/" ? NextResponse.rewrite(new URL("/app", request.url)) : NextResponse.next(); };
    return appOpen() ? pass() : gatePage(request, TESTERS, pass);
  }

  return gatePage(request, DEMO, function () { return NextResponse.next(); });
}

export const config = {
  matcher: ["/", "/app", "/app/:path*", "/demo-7q4x", "/demo-7q4x/:path*", "/api/nora", "/api/voice"],
};
