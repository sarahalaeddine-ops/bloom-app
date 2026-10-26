"use client";
import BloomApp from "../../components/BloomApp";

// The real app on the web: app.bloomivfcompanion.com (proxy.js serves its homepage from here) and
// bloomivfcompanion.com/app. Real accounts only: no demo persona, film or demo content
// (lib/config.js isRealApp). proxy.js keeps it behind TESTER_PASSWORD until launch.
export default function RealAppPage() {
  return <BloomApp />;
}
