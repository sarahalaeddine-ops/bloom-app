// Demo store: everything persists in localStorage so the demo survives reloads.
// Swap these helpers for Supabase calls when going live.
import { DEMO_USER, SEED_CHECKINS } from "./demo-data";

var PREFIX = "bloom_";
var currentUser = null;

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
}

function remove(key) {
  if (!hasWindow()) return;
  try { localStorage.removeItem(PREFIX + key); } catch {}
}

function saveUser(user) {
  currentUser = user;
  write("user", user);
  var users = read("users", {});
  if (user && user.email) {
    users[user.email.toLowerCase()] = user;
    write("users", users);
  }
  return user;
}

export var auth = {
  signUp: function (name, email, password) {
    var users = read("users", {});
    var key = email.trim().toLowerCase();
    if (users[key]) return { error: "Email already exists. Please sign in." };
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    var user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: key,
      password: password,
      clinic: "Emirates Fertility Centre",
      protocol: "Antagonist",
      phase: "stimulation",
      stimDay: 7,
      follicles: 11,
      e2: 1840,
      onboarded: false,
    };
    return { data: saveUser(user), error: null };
  },
  signIn: function (email, password) {
    var users = read("users", {});
    var user = users[email.trim().toLowerCase()];
    if (!user) return { error: "No account found. Please sign up." };
    if (user.password !== password) return { error: "Wrong email or password." };
    return { data: saveUser(user), error: null };
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
  signOut: function () {
    currentUser = null;
    remove("user");
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
  resetDemo: function () {
    if (!hasWindow()) return;
    try {
      Object.keys(localStorage)
        .filter(function (k) { return k.indexOf(PREFIX) === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
    } catch {}
    currentUser = null;
  },
};

export function todayKey() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
