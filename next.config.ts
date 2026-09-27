import type { NextConfig } from "next";

// Baseline security headers for every route. A Content-Security-Policy is still to do
// (needs nonces and testing with Supabase and Google Fonts; see docs/sa6/architecture.md, G3).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
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

export default nextConfig;
