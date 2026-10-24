import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor wraps the static app build (out/, from `npm run build:app`) in native iOS and Android
// projects (ios/, android/). See docs/sa6/app-store.md.
// appId is an assumption the founder can change BEFORE the first store upload (it can't change after).
const config: CapacitorConfig = {
  appId: "com.bloomivfcompanion.app",
  appName: "Bloom",
  webDir: "out",
  // The bundled files are served from capacitor://localhost (iOS) and https://localhost (Android).
  // lib/cors.js allows exactly these two origins on the hosted API.
  server: {
    androidScheme: "https",
  },
  ios: {
    // The web layout handles safe areas itself with env(safe-area-inset-*) (viewport-fit=cover).
    contentInset: "never",
    // Health data: no link previews of her pages.
    allowsLinkPreview: false,
  },
  android: {
    // Only Bloom's own bundle, no mixed content, no WebView debugging in release builds.
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#FAF7F4",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#FAF7F4",
      overlaysWebView: true,
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_bloom",
      iconColor: "#9B6DC5",
    },
  },
};

export default config;
