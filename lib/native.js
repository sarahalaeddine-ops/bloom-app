// Native (Capacitor) features, feature-detected. On the web every function here is a no-op or
// returns "unsupported", so the web demo keeps its current behaviour (service-worker reminders,
// PIN-only lock).
//
// Plugins are imported lazily and only inside the native app, so the web bundle never loads them.
// The native runtime injects window.Capacitor before Bloom's code runs, which is what isNative()
// reads. See docs/sa6/app-store.md for why each plugin is here.

function cap() {
  return typeof window !== "undefined" && window.Capacitor ? window.Capacitor : null;
}

export function isNative() {
  var c = cap();
  try {
    return !!(c && typeof c.isNativePlatform === "function" && c.isNativePlatform());
  } catch {
    return false;
  }
}

export function platform() {
  var c = cap();
  try {
    return c && typeof c.getPlatform === "function" ? c.getPlatform() : "web";
  } catch {
    return "web";
  }
}

async function plugin(name) {
  if (!isNative()) return null;
  try {
    if (name === "app") return (await import("@capacitor/app")).App;
    if (name === "status") return await import("@capacitor/status-bar");
    if (name === "splash") return (await import("@capacitor/splash-screen")).SplashScreen;
    if (name === "notifications") return (await import("@capacitor/local-notifications")).LocalNotifications;
    if (name === "privacy") return (await import("@capacitor/privacy-screen")).PrivacyScreen;
    if (name === "biometric") return (await import("@capgo/capacitor-native-biometric")).NativeBiometric;
  } catch {
    return null;
  }
  return null;
}

// ── App shell ───────────────────────────────────────────────────────────
// Status bar: dark text on Bloom's light background. The web layout pads itself with
// env(safe-area-inset-*) (viewport-fit=cover; Capacitor's SystemBars "css" handling fills these on
// Android too), so the WebView runs edge to edge on both platforms.
export async function initShell() {
  if (!isNative()) return;
  document.documentElement.classList.add("native", "native-" + platform());
  var sb = await plugin("status");
  if (sb) {
    try { await sb.StatusBar.setStyle({ style: sb.Style.Light }); } catch {}
  }
  var splash = await plugin("splash");
  if (splash) {
    try { await splash.hide({ fadeOutDuration: 250 }); } catch {}
  }
}

function listen(name, event, handler) {
  var handle = null;
  var removed = false;
  plugin(name).then(function (p) {
    if (!p || removed) return;
    Promise.resolve(p.addListener(event, handler)).then(function (h) {
      if (removed) { try { h.remove(); } catch {} return; }
      handle = h;
    }).catch(function () {});
  });
  return function () {
    removed = true;
    if (handle) { try { handle.remove(); } catch {} }
  };
}

// Android back button. handler() returns true when it handled the press (closed a sheet, went back
// a screen); otherwise Bloom goes to the background like other Android apps. Returns an unsubscribe.
export function onBackButton(handler) {
  if (!isNative()) return function () {};
  return listen("app", "backButton", function () {
    if (handler()) return;
    plugin("app").then(function (a) { if (a) a.minimizeApp().catch(function () {}); });
  });
}

// App moved to the foreground (true) or background (false). Returns an unsubscribe.
export function onAppState(handler) {
  if (!isNative()) return function () {};
  return listen("app", "appStateChange", function (s) { handler(!!(s && s.isActive)); });
}

// ── Privacy screen ──────────────────────────────────────────────────────
// Hides Bloom's content in the app switcher (iOS blur, Android FLAG_SECURE, which also blocks
// screenshots). Turned on together with the app lock, so it is her choice.
export async function setPrivacyScreen(on) {
  var p = await plugin("privacy");
  if (!p) return false;
  try {
    if (on) await p.enable({ ios: { blurEffect: "light" }, android: { dimBackground: false, privacyModeOnActivityHidden: "none" } });
    else await p.disable();
    return true;
  } catch {
    return false;
  }
}

// ── Local notifications (dose and appointment reminders) ────────────────
// "granted" | "denied" | "prompt" | "unsupported"
export async function notificationPermission() {
  var ln = await plugin("notifications");
  if (!ln) return "unsupported";
  try {
    var r = await ln.checkPermissions();
    return r.display === "granted" ? "granted" : r.display === "denied" ? "denied" : "prompt";
  } catch {
    return "unsupported";
  }
}

export async function requestNotificationPermission() {
  var ln = await plugin("notifications");
  if (!ln) return "unsupported";
  try {
    var r = await ln.requestPermissions();
    return r.display === "granted" ? "granted" : r.display === "denied" ? "denied" : "prompt";
  } catch {
    return "denied";
  }
}

// Stable positive 31-bit id from a reminder id ("med-gonal-0-2") and its time, as Android needs ints.
export function notificationId(key) {
  var h = 2166136261;
  for (var i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 2147483000 + 1;
}

// Replaces every pending Bloom notification with `items`: [{ key, at: Date, title, body, extra }].
// iOS keeps at most 64 pending local notifications, so the list is capped (soonest first).
export var MAX_PENDING = 60;

export async function replaceScheduled(items) {
  var ln = await plugin("notifications");
  if (!ln) return false;
  try {
    var pending = await ln.getPending();
    if (pending && pending.notifications && pending.notifications.length) {
      await ln.cancel({ notifications: pending.notifications.map(function (n) { return { id: n.id }; }) });
    }
    var now = Date.now();
    var list = (items || [])
      .filter(function (n) { return n.at instanceof Date && n.at.getTime() > now + 5000; })
      .sort(function (a, b) { return a.at - b.at; })
      .slice(0, MAX_PENDING)
      .map(function (n) {
        return {
          id: notificationId(n.key + "@" + n.at.getTime()),
          title: n.title,
          body: n.body,
          // allowWhileIdle: delivered in Android Doze without the exact-alarm permission (may be a
          // few minutes late); iOS delivers on time.
          schedule: { at: n.at, allowWhileIdle: true },
          smallIcon: "ic_stat_bloom",
          iconColor: "#9B6DC5",
          extra: n.extra || null,
        };
      });
    if (list.length) await ln.schedule({ notifications: list });
    return true;
  } catch {
    return false;
  }
}

export async function cancelAllScheduled() {
  return replaceScheduled([]);
}

// Shows a notification a few seconds from now (the "Send a test reminder" button).
export async function notifySoon(title, body) {
  var ln = await plugin("notifications");
  if (!ln) return false;
  try {
    var at = new Date(Date.now() + 3000);
    await ln.schedule({ notifications: [{ id: notificationId("test@" + at.getTime()), title: title, body: body, schedule: { at: at, allowWhileIdle: true }, smallIcon: "ic_stat_bloom", iconColor: "#9B6DC5" }] });
    return true;
  } catch {
    return false;
  }
}

// She tapped a reminder: handler(extra) with the extra saved at scheduling ({ kind }).
export function onNotificationTap(handler) {
  if (!isNative()) return function () {};
  return listen("notifications", "localNotificationActionPerformed", function (e) {
    handler((e && e.notification && e.notification.extra) || {});
  });
}

// ── Biometrics (Face ID / Touch ID / fingerprint) ────────────────────────
// { available, kind: "face" | "fingerprint" | "touch" | "biometric" | null }
export async function biometricInfo() {
  var b = await plugin("biometric");
  if (!b) return { available: false, kind: null };
  try {
    var r = await b.isAvailable({ useFallback: false });
    var t = r.biometryType;
    var kind = t === 2 || t === 4 ? "face" : t === 1 ? "touch" : t === 3 ? "fingerprint" : "biometric";
    return { available: !!r.isAvailable, kind: r.isAvailable ? kind : null };
  } catch {
    return { available: false, kind: null };
  }
}

// Shows the system Face ID / fingerprint prompt. Resolves true only on success; cancel or failure
// resolves false (the PIN pad stays on screen as the fallback).
export async function verifyBiometric(text) {
  var b = await plugin("biometric");
  if (!b) return false;
  try {
    await b.verifyIdentity({
      reason: text.reason,
      title: text.title,
      subtitle: text.subtitle || "",
      negativeButtonText: text.cancel,
      useFallback: false,
    });
    return true;
  } catch {
    return false;
  }
}
