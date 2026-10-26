// Build-time settings shared by the web and the native (Capacitor) build.
//
// - Web build (`npm run build`): the app and its API live on the same origin, so API paths stay
//   relative ("/api/nora") and NEXT_PUBLIC_API_BASE is normally unset.
// - App build (`npm run build:app`): the WebView serves the bundled static files from
//   capacitor://localhost (iOS) or https://localhost (Android), so API calls and public pages
//   (privacy policy, support) go to the hosted site. scripts/build-app.mjs sets
//   NEXT_PUBLIC_BUILD_TARGET=app and NEXT_PUBLIC_API_BASE (default https://bloomivfcompanion.com).
//
// NEXT_PUBLIC_* values are inlined at build time, so these are plain constants in the bundle.

export var DEFAULT_SITE = "https://bloomivfcompanion.com";

function trimBase(value) {
  var v = typeof value === "string" ? value.trim() : "";
  if (!/^https?:\/\/[^\s/]+/i.test(v)) return "";
  return v.replace(/\/+$/, "");
}

export var API_BASE = trimBase(process.env.NEXT_PUBLIC_API_BASE);

// True in the static bundle that ships inside the iOS/Android app (even when previewed in a desktop
// browser). Use lib/native.js isNative() to check for the native runtime itself.
export var IS_APP_BUILD = process.env.NEXT_PUBLIC_BUILD_TARGET === "app";

// The real app: the native build, or the web app at app.bloomivfcompanion.com or /app. Real
// accounts only, so no demo persona, investor film, demo content or Bloom+ paywall. Read from the
// address, so it is false while the server renders (the app shows its splash screen then).
export function isRealApp() {
  if (IS_APP_BUILD) return true;
  if (typeof window === "undefined") return false;
  var loc = window.location;
  if (!loc) return false;
  return loc.hostname.indexOf("app.") === 0 || loc.pathname === "/app" || loc.pathname.indexOf("/app/") === 0;
}

// Absolute URL for Bloom's own API routes in the app build, relative on the web.
export function apiUrl(path) {
  return API_BASE + path;
}

// Public web pages (privacy policy, support, account deletion). The app build links to the hosted
// page so the policy has one source of truth; the web build links relatively.
export function siteUrl(path) {
  if (API_BASE) return API_BASE + path;
  return IS_APP_BUILD ? DEFAULT_SITE + path : path;
}

export var SUPPORT_EMAIL = "support@bloomivfcompanion.com";
