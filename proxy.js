import { NextResponse } from "next/server";
import { DEMO, PILOT, TESTERS, passToken, expectedToken, sameToken, hasGateCookie } from "./lib/gates";
import { createRateLimiter, clientIp } from "./lib/rate-limit";

// Two password gates, each asked once by the browser (any username works) and then remembered by a
// cookie for 30 days. Without its password set, a gate stays locked.
//
// - The investor demo (/demo-7q4x, DEMO_PASSWORD): Sarah's demo, the self-playing film, the
//   voice-over API.
// - The real app (TESTER_PASSWORD): real accounts only, no demo. It lives at
//   app.bloomivfcompanion.com (its homepage is served from /app) and at bloomivfcompanion.com/app.
//   APP_OPEN=1 removes this gate on launch day. The public website at / is never gated.
// - The pilot dashboard (/pilot, PILOT_PASSWORD): for the founder only.
//
// The native app (docs/sa6/app-store.md) has no cookie. For Nora's APIs only (/api/nora, the chat,
// and /api/ai, Nora inside the screens):
// - requests carrying "Authorization: Bearer <token>" go through to the route, which verifies the
//   Supabase session itself and answers 401 when it is not valid;
// - CORS preflights (OPTIONS) go through so the route can answer them (they carry no data).
// Otherwise they need the demo or the tester cookie; the voice-over needs the demo cookie.
var MAX_AGE = 60 * 60 * 24 * 30;

// Wrong passwords: after 10 in 15 minutes from one address, that address gets "Too many attempts"
// for the rest of the window, so a shared password can't be guessed by trying a word list.
// In-memory, per server instance (lib/rate-limit.js), like the API limits.
var wrongPasswords = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

var blocked = new Map(); // gate + address -> blocked until (ms)

function tooMany() {
  return new Response("Too many attempts. Please try again later.", { status: 429, headers: { "Retry-After": "900" } });
}

function hasCookie(request, gate) {
  return hasGateCookie(request, gate);
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
  if (given !== null) {
    var key = gate.cookie + ":" + clientIp(request);
    if (blocked.has(key) && blocked.get(key) > Date.now()) return tooMany();
    if (expected && sameToken(await passToken(gate, given), expected)) {
      var res = pass();
      res.cookies.set(gate.cookie, expected, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MAX_AGE });
      return res;
    }
    var hit = wrongPasswords.check(key);
    if (!hit.ok) {
      if (blocked.size > 10000) blocked.forEach(function (until, k) { if (until <= Date.now()) blocked.delete(k); });
      blocked.set(key, Date.now() + hit.retryAfter * 1000);
      return tooMany();
    }
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
    if (path === "/api/nora" || path === "/api/ai") {
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

  if (path === "/pilot") return gatePage(request, PILOT, function () { return NextResponse.next(); });

  return gatePage(request, DEMO, function () { return NextResponse.next(); });
}

export const config = {
  matcher: ["/", "/app", "/app/:path*", "/demo-7q4x", "/demo-7q4x/:path*", "/pilot", "/api/nora", "/api/ai", "/api/voice"],
};
