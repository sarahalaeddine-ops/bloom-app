import type { NextConfig } from "next";

// Two build targets from one codebase:
// - Web (default, `npm run build`): the marketing site, the private demo, the API routes and
//   proxy.js, deployed on Vercel.
// - App (`npm run build:app` sets BUILD_TARGET=app): a static export in out/ that Capacitor bundles
//   into the iOS and Android apps. Only files ending in `.app.jsx` are routes in this build
//   (app/layout.app.jsx, app/page.app.jsx), so API routes (route.js), proxy.js and the web pages are
//   left out: a static export can't run them (node_modules/next/dist/docs/01-app/02-guides/static-exports.md).
//   The app calls the hosted API instead (NEXT_PUBLIC_API_BASE, lib/config.js).
const isApp = process.env.BUILD_TARGET === "app";

// Content-Security-Policy (G3). Limits where the pages may load code from and send data to: Bloom
// itself, Google Fonts, and Supabase (accounts and sync). So even if someone managed to inject
// script, it couldn't load code from elsewhere or send her data or her session to another site.
// 'unsafe-inline' is still needed for scripts: Next.js inlines its startup data, and nonces would
// need every page rendered per request (docs/sa6/architecture.md, G3). Vercel's preview toolbar is
// blocked by this on preview deployments; production is unaffected.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Baseline security headers for every route.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // Microphone: Bloom's own pages only, for voice typing (lib/dictation.js).
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const webConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The old waitlist page now lives on the homepage.
      { source: "/landing", destination: "/", permanent: false },
    ];
  },
};

// Headers, redirects, rewrites, proxy and request-reading route handlers are not supported in a
// static export, so the app config has none of them.
const appConfig: NextConfig = {
  output: "export",
  pageExtensions: ["app.jsx"],
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

const nextConfig: NextConfig = isApp ? appConfig : webConfig;

export default nextConfig;
