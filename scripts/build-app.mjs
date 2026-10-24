// Builds the static app bundle (out/) that Capacitor ships inside the iOS and Android apps.
// Cross-platform (works in PowerShell, cmd and bash): sets the build env and runs `next build`.
//
//   npm run build:app            -> out/ (then `npm run cap:sync` copies it into ios/ and android/)
//
// Env (read from the shell or .env.local / .env.production.local, like any Next build):
//   NEXT_PUBLIC_API_BASE           hosted site the app calls for /api/*; default https://bloomivfcompanion.com
//   NEXT_PUBLIC_SUPABASE_URL       required for store builds: the app needs accounts (cloud mode)
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
// Never put server secrets (ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY) in the app build: they
// are not NEXT_PUBLIC_ and are never read by client code, so they would not be bundled anyway.
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

var root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
var require = createRequire(path.join(root, "package.json"));

var env = { ...process.env, BUILD_TARGET: "app", NEXT_PUBLIC_BUILD_TARGET: "app", NEXT_TELEMETRY_DISABLED: "1" };
if (!env.NEXT_PUBLIC_API_BASE) env.NEXT_PUBLIC_API_BASE = "https://bloomivfcompanion.com";

// Warn (don't fail) so CI and local previews still build; a store build must have cloud mode on.
// .env files are loaded by Next itself, so only warn when neither the shell nor a .env file sets it.
var envFiles = [".env", ".env.local", ".env.production", ".env.production.local"].filter(function (f) { return existsSync(path.join(root, f)); });
if (!env.NEXT_PUBLIC_SUPABASE_URL && envFiles.length === 0) {
  console.warn("[build:app] NEXT_PUBLIC_SUPABASE_URL is not set: this bundle runs in local (on-device) mode. Store builds need Supabase set.");
}
console.log("[build:app] API base: " + env.NEXT_PUBLIC_API_BASE);

// Start from a clean export so files from an older build never ship.
rmSync(path.join(root, "out"), { recursive: true, force: true });

var nextBin = require.resolve("next/dist/bin/next");
var result = spawnSync(process.execPath, [nextBin, "build"], { cwd: root, env: env, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status || 1);

if (!existsSync(path.join(root, "out", "index.html"))) {
  console.error("[build:app] out/index.html is missing: the export did not produce the app page.");
  process.exit(1);
}
console.log("[build:app] Done: out/ is ready. Next: npm run cap:sync");
