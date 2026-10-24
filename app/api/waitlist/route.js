// Waitlist sign-ups. Each email is saved as one private file in the Vercel Blob
// store "bloom-waitlist" (Vercel dashboard → Storage), so nothing is lost and
// re-joining the same email just overwrites its entry.
// Talks to the Blob REST API directly to avoid adding the @vercel/blob package.
import { createRateLimiter, clientIp } from "../../../lib/rate-limit";
import { isValidEmail } from "../../../lib/validate";

var BLOB_API = "https://vercel.com/api/blob";
var MAX_BODY_CHARS = 2000;

// Per-IP, per server instance (see lib/rate-limit.js).
var signupLimit = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

// Number of people on the waitlist, shown on the homepage. Cached for a minute at the edge.
export async function GET() {
  var token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return Response.json({ error: "Unavailable" }, { status: 503 });

  var count = 0;
  var cursor = "";
  try {
    for (var page = 0; page < 50; page++) {
      var params = new URLSearchParams({ prefix: "waitlist/", limit: "1000" });
      if (cursor) params.set("cursor", cursor);
      var res = await fetch(BLOB_API + "?" + params.toString(), { headers: blobHeaders(token), cache: "no-store" });
      if (!res.ok) throw new Error("Blob API " + res.status + ": " + (await res.text()).slice(0, 200));
      var data = await res.json();
      count += (data.blobs || []).length;
      if (!data.hasMore || !data.cursor) break;
      cursor = data.cursor;
    }
  } catch (err) {
    console.error("Waitlist count error:", err.message);
    return Response.json({ error: "Unavailable" }, { status: 502 });
  }

  return Response.json({ count: count }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}

export async function POST(request) {
  if (!signupLimit.check(clientIp(request)).ok) {
    return Response.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }

  var body;
  try {
    var raw = await request.text();
    if (raw.length > MAX_BODY_CHARS) throw new Error("too large");
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  var email = body && typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return Response.json({ error: "Please enter a valid email" }, { status: 400 });
  }

  var token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("Waitlist error: BLOB_READ_WRITE_TOKEN is not set");
    return Response.json({ error: "Sign-ups are unavailable right now. Please try again later." }, { status: 503 });
  }

  var entry = { email: email, joinedAt: new Date().toISOString(), source: "landing" };
  var params = new URLSearchParams({ pathname: "waitlist/" + email + ".json" });

  try {
    var res = await fetch(BLOB_API + "/?" + params.toString(), {
      method: "PUT",
      headers: {
        ...blobHeaders(token),
        "x-vercel-blob-access": "private",
        "x-content-type": "application/json",
        "x-add-random-suffix": "0",
        "x-allow-overwrite": "1",
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Blob API " + res.status + ": " + (await res.text()).slice(0, 200));
  } catch (err) {
    console.error("Waitlist error:", err.message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
