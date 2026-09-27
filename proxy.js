import { NextResponse } from "next/server";

// Password gate for the private app demo and the Nora API it uses.
// The browser asks for the password once (any username works); after that a
// cookie keeps the visitor in for 30 days. Without DEMO_PASSWORD set, both stay locked.
var COOKIE = "bloom_demo";
var MAX_AGE = 60 * 60 * 24 * 30;

async function passToken(password) {
  var bytes = new TextEncoder().encode("bloom-demo:" + password);
  var hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
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

export async function proxy(request) {
  var isApi = request.nextUrl.pathname.startsWith("/api/");
  var password = process.env.DEMO_PASSWORD;
  var expected = password ? await passToken(password) : null;

  if (expected && request.cookies.get(COOKIE)?.value === expected) return NextResponse.next();

  if (isApi) return Response.json({ error: "Not authorized" }, { status: 401 });

  var given = passwordFromHeader(request.headers.get("authorization"));
  if (expected && given !== null && (await passToken(given)) === expected) {
    var res = NextResponse.next();
    res.cookies.set(COOKIE, expected, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MAX_AGE });
    return res;
  }

  return new Response("This page is private.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Bloom demo", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/demo-7q4x", "/demo-7q4x/:path*", "/api/nora"],
};
