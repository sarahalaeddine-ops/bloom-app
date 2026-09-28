// CORS for the API routes the native app calls from its bundled WebView.
// Only the two Capacitor origins are allowed:
//   capacitor://localhost  (iOS)
//   https://localhost      (Android, androidScheme "https")
// The app authenticates with a Supabase access token in the Authorization header, never with
// cookies, so credentialed CORS (Access-Control-Allow-Credentials) is not needed and not sent.
// Requests from any other origin get no CORS headers, so browsers block cross-site reads.

export var APP_ORIGINS = ["capacitor://localhost", "https://localhost"];

var ALLOW_HEADERS = "Content-Type, Authorization";
var MAX_AGE = "600";

export function allowedOrigin(request) {
  var origin = request.headers.get("origin");
  return origin && APP_ORIGINS.indexOf(origin) !== -1 ? origin : null;
}

// Adds CORS headers to a route's response when the request comes from the app. Always sets
// Vary: Origin so caches never mix app and web responses.
export function withCors(request, response, methods) {
  var origin = allowedOrigin(request);
  try {
    response.headers.append("Vary", "Origin");
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", methods || "POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
    }
  } catch {
    // Immutable headers (should not happen for Response.json): return the response unchanged.
  }
  return response;
}

// Answers a CORS preflight. Allowed origins get 204 with the CORS headers; others get 204 without
// them, which the browser treats as a refusal.
export function preflight(request, methods) {
  var origin = allowedOrigin(request);
  var headers = { Vary: "Origin" };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = methods || "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = ALLOW_HEADERS;
    headers["Access-Control-Max-Age"] = MAX_AGE;
  }
  return new Response(null, { status: 204, headers: headers });
}
