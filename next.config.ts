import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The old waitlist page now lives on the homepage.
      { source: "/landing", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
