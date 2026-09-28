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

// Baseline security headers for every route. A Content-Security-Policy is still to do
// (needs nonces and testing with Supabase and Google Fonts; see docs/sa6/architecture.md, G3).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
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
