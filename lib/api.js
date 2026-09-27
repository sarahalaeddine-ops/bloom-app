// Browser helpers for Bloom's own API routes. In cloud mode every call carries the user's Supabase
// access token (Authorization: Bearer) so the server can verify who she is; local and demo mode
// send no token and rely on the proxy.js demo gate.
import { auth } from "./store";

export async function authHeaders() {
  var token = await auth.accessToken();
  return token ? { Authorization: "Bearer " + token } : {};
}

async function post(url, payload) {
  var headers = { "Content-Type": "application/json", ...(await authHeaders()) };
  var res = await fetch(url, { method: "POST", headers: headers, body: JSON.stringify(payload || {}) });
  var data = await res.json().catch(function () { return {}; });
  return { status: res.status, ok: res.ok, data: data };
}

// Nora chat. payload: { user, messages, lang }. Returns { status, ok, data: { text, demo?, urgent? } }.
export function askNora(payload) {
  return post("/api/nora", payload);
}
