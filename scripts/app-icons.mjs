// Regenerates the native app icons, splash screens and notification icon from the Bloom brand mark
// (the four-point star in public/icon.svg). The PNGs are committed, so this only needs to run again
// when the brand mark changes.
//
//   node scripts/app-icons.mjs
//
// Needs Playwright with Chromium (dev machine only; not a project dependency). It is looked up from
// the project, then from the global npm folder. Sizes are read from the PNGs Capacitor generated, so
// every file keeps the dimensions its platform expects.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

var root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadPlaywright() {
  var req = createRequire(path.join(root, "package.json"));
  try { return req("playwright"); } catch {}
  var globalRoot = execSync("npm root -g").toString().trim();
  return createRequire(path.join(globalRoot, "noop.js"))("playwright");
}

var STAR = "M256 96 C270 200 312 242 416 256 C312 270 270 312 256 416 C242 312 200 270 96 256 C200 242 242 200 256 96 Z";
var BG_A = "#FDF0F5";
var BG_B = "#EDE0F5";
var MARK = "#B388D9";
var SPLASH_BG = "#FAF7F4";

function pngSize(file) {
  var b = readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

// shape: "square" (iOS, full bleed), "rounded" (Android legacy), "circle" (Android round),
// "foreground" (adaptive icon layer), "splash", "notification" (white on transparent).
function svgFor(shape, w, h) {
  var grad = '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + BG_A + '"/><stop offset="1" stop-color="' + BG_B + '"/></linearGradient></defs>';
  var star = function (scale, color) {
    // Scale the 512-unit mark around its centre and place it in the middle of a w x h canvas.
    var s = (Math.min(w, h) / 512) * scale;
    var tx = w / 2 - 256 * s;
    var ty = h / 2 - 256 * s;
    return '<path transform="translate(' + tx + " " + ty + ") scale(" + s + ')" d="' + STAR + '" fill="' + color + '"/>';
  };
  var body;
  if (shape === "square") body = grad + '<rect width="' + w + '" height="' + h + '" fill="url(#bg)"/>' + star(1.05, MARK);
  else if (shape === "rounded") body = grad + '<rect width="' + w + '" height="' + h + '" rx="' + w * 0.22 + '" fill="url(#bg)"/>' + star(1, MARK);
  else if (shape === "circle") body = grad + '<circle cx="' + w / 2 + '" cy="' + h / 2 + '" r="' + w / 2 + '" fill="url(#bg)"/>' + star(0.95, MARK);
  else if (shape === "foreground") body = star(0.62, MARK); // inside the 66/108 adaptive safe zone
  else if (shape === "splash") body = '<rect width="' + w + '" height="' + h + '" fill="' + SPLASH_BG + '"/>' + star(0.32, MARK);
  else body = star(1.3, "#FFFFFF");
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">' + body + "</svg>";
}

async function render(page, shape, w, h, file) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svgFor(shape, w, h) + "</body></html>");
  var opaque = shape === "square" || shape === "splash";
  var png = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h }, omitBackground: !opaque });
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, png);
  console.log("  " + path.relative(root, file) + " " + w + "x" + h);
}

var jobs = [];
var ios = path.join(root, "ios/App/App/Assets.xcassets");
jobs.push({ shape: "square", file: path.join(ios, "AppIcon.appiconset/AppIcon-512@2x.png") });
readdirSync(path.join(ios, "Splash.imageset")).filter(function (f) { return f.endsWith(".png"); }).forEach(function (f) {
  jobs.push({ shape: "splash", file: path.join(ios, "Splash.imageset", f) });
});

var res = path.join(root, "android/app/src/main/res");
readdirSync(res).forEach(function (dir) {
  var d = path.join(res, dir);
  if (dir.indexOf("mipmap-") === 0 && dir !== "mipmap-anydpi-v26") {
    jobs.push({ shape: "rounded", file: path.join(d, "ic_launcher.png") });
    jobs.push({ shape: "circle", file: path.join(d, "ic_launcher_round.png") });
    jobs.push({ shape: "foreground", file: path.join(d, "ic_launcher_foreground.png") });
  }
  if (dir.indexOf("drawable") === 0 && existsSync(path.join(d, "splash.png"))) jobs.push({ shape: "splash", file: path.join(d, "splash.png") });
});

// Notification small icon (status bar): 24 dp, white on transparent.
var NOTIF = { mdpi: 24, hdpi: 36, xhdpi: 48, xxhdpi: 72, xxxhdpi: 96 };
Object.keys(NOTIF).forEach(function (dpi) {
  jobs.push({ shape: "notification", file: path.join(res, "drawable-" + dpi, "ic_stat_bloom.png"), w: NOTIF[dpi], h: NOTIF[dpi] });
});

var { chromium } = loadPlaywright();
var browser = await chromium.launch();
var page = await browser.newPage({ deviceScaleFactor: 1 });
console.log("Rendering " + jobs.length + " images:");
for (var job of jobs) {
  var size = job.w ? { w: job.w, h: job.h } : pngSize(job.file);
  await render(page, job.shape, size.w, size.h, job.file);
}
await browser.close();

// Adaptive icon background: the light end of the brand gradient.
writeFileSync(path.join(res, "values/ic_launcher_background.xml"), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#F6E8F5</color>\n</resources>\n');
console.log("Done.");
