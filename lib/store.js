// Bloom storage.
// - Local mode (default): everything lives in localStorage on this device. Passwords are
//   stored only as salted PBKDF2 hashes.
// - Cloud mode (NEXT_PUBLIC_SUPABASE_URL + key set): Supabase Auth handles accounts and the
//   user's data is synced to the `user_state` table (row-level security, see supabase/schema.sql).
//   Secret Space is encrypted on the device before it is stored or synced.
import { DEMO_USER, SEED_CHECKINS } from "./demo-data";
import { hashSecret, verifySecret } from "./crypto";
import { supabase } from "./supabase";

var PREFIX = "bloom_";
var currentUser = null;

// Keys that never leave this device: other accounts, the device app-lock PIN, legacy plaintext.
var LOCAL_ONLY = ["users", "lock_pin", "secret", "lang", "reminders_fired"];

// Health-data consent (G11). Bump the version whenever the consent text changes: everyone is asked
// again. The wording is a DRAFT pending legal review (docs/sa6/architecture.md).
export var CONSENT_VERSION = "2026-09-27-draft1";

function hasWindow() {
  return typeof window !== "undefined";
}

function read(key, fallback) {
  if (!hasWindow()) return fallback;
  try {
    var raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode) — the demo keeps working in memory.
  }
  if (LOCAL_ONLY.indexOf(key) === -1) schedulePush();
}

function remove(key) {
  if (!hasWindow()) return;
  try { localStorage.removeItem(PREFIX + key); } catch {}
}

function allKeys() {
  if (!hasWindow()) return [];
  try {
    return Object.keys(localStorage).filter(function (k) { return k.indexOf(PREFIX) === 0; }).map(function (k) { return k.slice(PREFIX.length); });
  } catch {
    return [];
  }
}

// ── Cloud sync ──────────────────────────────────────────────────────────
var pushTimer = null;

function cloudUserId() {
  var u = currentUser || read("user", null);
  return supabase && u && u.cloud ? u.id : null;
}

function consentRecord() {
  var c = read("consent", null);
  return c && typeof c === "object" ? c : null;
}

// Her health data only goes to the cloud with her consent to cloud sync.
function syncAllowed() {
  var c = consentRecord();
  return !!cloudUserId() && !!c && c.cloud === true;
}

function snapshot() {
  var data = {};
  allKeys().forEach(function (k) {
    if (LOCAL_ONLY.indexOf(k) === -1) data[k] = read(k, null);
  });
  return data;
}

async function pushNow() {
  var id = cloudUserId();
  if (!id || !syncAllowed()) return;
  clearTimeout(pushTimer);
  var res = await supabase.from("user_state").upsert({ user_id: id, data: snapshot(), updated_at: new Date().toISOString() });
  if (res.error) console.error("Bloom sync failed:", res.error.message);
}

function schedulePush() {
  if (!syncAllowed()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, 1500);
}

async function pullState(id) {
  var res = await supabase.from("user_state").select("data").eq("user_id", id).maybeSingle();
  if (res.error || !res.data) return;
  Object.keys(res.data.data || {}).forEach(function (k) {
    if (k === "user" || LOCAL_ONLY.indexOf(k) !== -1) return;
    try { localStorage.setItem(PREFIX + k, JSON.stringify(res.data.data[k])); } catch {}
  });
  return res.data.data.user || null;
}

// ── Users ───────────────────────────────────────────────────────────────
function saveUser(user) {
  currentUser = user;
  write("user", user);
  if (user && user.email && !user.cloud) {
    var users = read("users", {});
    users[user.email.toLowerCase()] = { ...users[user.email.toLowerCase()], ...user };
    write("users", users);
  }
  return user;
}

// Starting values for a new real account; onboarding asks for clinic, protocol, phase and day.
// No E2 or follicle count: those are the demo persona's results, never hers (G15).
function newProfile(fields) {
  return {
    clinic: "",
    protocol: "",
    phase: "stimulation",
    stimDay: 1,
    onboarded: false,
    ...fields,
  };
}

function publicUser(u) {
  var out = { ...u };
  delete out.password;
  delete out.pw;
  return out;
}

export var auth = {
  mode: function () { return supabase ? "cloud" : "local"; },

  signUp: async function (name, email, password) {
    var key = email.trim().toLowerCase();
    if (password.length < 8) return { error: "Password must be at least 8 characters." };
    if (supabase) {
      var res = await supabase.auth.signUp({ email: key, password: password, options: { data: { name: name.trim() } } });
      if (res.error) return { error: res.error.message };
      if (!res.data.session) return { error: "Check your email to confirm your account, then sign in." };
      return { data: saveUser(newProfile({ id: res.data.user.id, name: name.trim(), email: key, cloud: true })), error: null };
    }
    var users = read("users", {});
    if (users[key]) return { error: "Email already exists. Please sign in." };
    var pw = await hashSecret(password);
    var user = newProfile({ id: Date.now().toString(), name: name.trim(), email: key });
    users[key] = { ...user, pw: pw };
    write("users", users);
    return { data: saveUser(user), error: null };
  },

  signIn: async function (email, password) {
    var key = email.trim().toLowerCase();
    if (supabase) {
      var res = await supabase.auth.signInWithPassword({ email: key, password: password });
      if (res.error) return { error: res.error.message };
      var id = res.data.user.id;
      currentUser = { id: id, cloud: true };
      var saved = await pullState(id);
      var meta = res.data.user.user_metadata || {};
      return { data: saveUser(newProfile({ ...(saved || {}), id: id, email: key, name: (saved && saved.name) || meta.name || key.split("@")[0], cloud: true })), error: null };
    }
    var users = read("users", {});
    var stored = users[key];
    if (!stored) return { error: "No account found. Please sign up." };
    var ok;
    if (stored.pw) ok = await verifySecret(password, stored.pw);
    else ok = stored.password === password; // accounts created before hashing
    if (!ok) return { error: "Wrong email or password." };
    if (!stored.pw) {
      users[key] = { ...publicUser(stored), pw: await hashSecret(password) };
      write("users", users);
    }
    return { data: saveUser(publicUser(users[key])), error: null };
  },

  demo: function () {
    if (read("checkins", null) === null) write("checkins", SEED_CHECKINS);
    return saveUser({ ...DEMO_USER });
  },

  getUser: function () {
    if (currentUser) return currentUser;
    currentUser = read("user", null);
    return currentUser;
  },

  updateUser: function (updates) {
    var user = auth.getUser();
    if (!user) return null;
    return saveUser({ ...user, ...updates });
  },

  // Supabase access token for Bloom's own API routes (Authorization: Bearer). null in local/demo
  // mode or without a session. supabase-js refreshes an expired token here if it can.
  accessToken: async function () {
    if (!cloudUserId()) return null;
    try {
      var res = await supabase.auth.getSession();
      return res.data && res.data.session ? res.data.session.access_token : null;
    } catch {
      return null;
    }
  },

  // Session expired: forget the signed-in user but keep their data until they sign back in.
  expire: function () {
    currentUser = null;
    remove("user");
  },

  signOut: async function () {
    var wasCloud = !!cloudUserId();
    if (wasCloud) {
      await pushNow();
      await supabase.auth.signOut();
      // Don't leave the previous user's health data on a shared device.
      allKeys().forEach(function (k) { if (k !== "users" && k !== "lang") remove(k); });
    }
    currentUser = null;
    remove("user");
  },
};

// Her consent choices. { version, cloud, ai, at, history[] } in bloom_consent (synced as a record,
// also without cloud consent, so the server can see whether Nora's AI path is allowed).
export var consent = {
  get: consentRecord,
  // True once she has answered the current version. The demo persona is fictional: never asked.
  answered: function (user) {
    if (user && user.id === "demo") return true;
    var c = consentRecord();
    return !!c && c.version === CONSENT_VERSION;
  },
  cloudAllowed: function () {
    var c = consentRecord();
    return !!c && c.cloud === true;
  },
  syncing: function () { return syncAllowed(); },
  aiAllowed: function (user) {
    if (user && user.id === "demo") return true;
    var c = consentRecord();
    return !!c && c.ai === true;
  },
  // Saves a new choice. Cloud accounts: logs it in consent_events (server timestamp) and updates
  // the cloud copy. Withdrawing cloud consent replaces the synced data with the consent record
  // alone, so her health data leaves the cloud but stays on this device.
  set: async function (choice) {
    var prev = consentRecord();
    var at = new Date().toISOString();
    var entry = { version: CONSENT_VERSION, cloud: !!(choice && choice.cloud), ai: !!(choice && choice.ai), at: at };
    var rec = { ...entry, history: ((prev && Array.isArray(prev.history)) ? prev.history : []).concat([entry]).slice(-20) };
    clearTimeout(pushTimer);
    try { localStorage.setItem(PREFIX + "consent", JSON.stringify(rec)); } catch {}
    var id = cloudUserId();
    if (!id) return rec;
    var log = await supabase.from("consent_events").insert({ user_id: id, version: entry.version, cloud: entry.cloud, ai: entry.ai });
    if (log.error) console.error("Bloom consent log failed:", log.error.message);
    if (entry.cloud) {
      await pushNow();
    } else {
      var res = await supabase.from("user_state").upsert({ user_id: id, data: { consent: rec }, updated_at: at });
      if (res.error) console.error("Bloom consent sync failed:", res.error.message);
    }
    return rec;
  },
};

// Generic per-feature storage (check-ins, med logs, saved videos, partner, etc.)
export var store = {
  get: read,
  set: write,
  remove: remove,
  push: function (key, item) {
    var list = read(key, []);
    list.unshift(item);
    write(key, list);
    return list;
  },
  syncNow: pushNow,
  // Deletes synced data in the cloud (if any) and everything Bloom stored on this device.
  resetDemo: async function () {
    var id = cloudUserId();
    if (id) {
      clearTimeout(pushTimer);
      await supabase.from("user_state").delete().eq("user_id", id);
      await supabase.auth.signOut();
    }
    allKeys().forEach(remove);
    currentUser = null;
  },
  // "Delete everything" in the Privacy Centre.
  // Cloud: the server verifies her session, deletes her synced data and her Supabase account (email
  // and sign-in) for good, then Bloom's data is wiped from this device. Nothing local is removed if
  // the server step fails, so she can try again. Local: wipes this device (as resetDemo).
  // Returns { ok: true } or { error: "session" | "failed" }.
  eraseAccount: async function () {
    if (!cloudUserId()) {
      await store.resetDemo();
      return { ok: true };
    }
    clearTimeout(pushTimer);
    var token = await auth.accessToken();
    if (!token) return { error: "session" };
    var res;
    try {
      res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ confirm: true }),
      });
    } catch {
      return { error: "failed" };
    }
    if (!res.ok) return { error: res.status === 401 ? "session" : "failed" };
    clearTimeout(pushTimer);
    // The account no longer exists: only clear the session stored on this device.
    try { await supabase.auth.signOut({ scope: "local" }); } catch {}
    allKeys().forEach(function (k) { if (k !== "lang") remove(k); });
    currentUser = null;
    return { ok: true };
  },
};

export function todayKey() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
