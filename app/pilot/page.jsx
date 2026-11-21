import { connection } from "next/server";
import { supabaseServerConfig, pilotStats } from "../../lib/supabase-server";

// Private pilot dashboard for the founder (proxy.js: PILOT_PASSWORD). Measured from accounts only
// (founder decision, 2026-11-21): sign-ups and active accounts from Supabase, and how often each Nora
// feature was used in total. No names, emails or health data are shown or stored for this.
export const metadata = {
  title: "Bloom pilot",
  robots: { index: false, follow: false },
};

var FEATURES = [
  ["nora_chat", "Nora chat replies"],
  ["ai_brief", "Today with Nora"],
  ["ai_log", "Tell Nora"],
  ["ai_results", "Read my results"],
  ["ai_prep", "Prepare with Nora"],
];

function fmtWeek(iso) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function pct(part, whole) {
  return whole ? Math.round((part / whole) * 100) + "%" : "–";
}

function Cell({ children, head }) {
  var cls = "px-3 py-2 text-sm whitespace-nowrap " + (head ? "text-bloom-muted font-semibold text-xs uppercase tracking-wider text-start" : "text-bloom-text");
  return head ? <th scope="col" className={cls}>{children}</th> : <td className={cls}>{children}</td>;
}

export default async function PilotPage() {
  await connection();
  var out = await pilotStats(supabaseServerConfig(), process.env.SUPABASE_SERVICE_ROLE_KEY, 8);
  var s = out.stats;

  return (
    <main className="min-h-screen bg-bloom-bg px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <p className="logo text-3xl mb-1">bloom ✦</p>
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Pilot dashboard</h1>
        <p className="text-bloom-muted text-sm mb-6">Weeks start on Monday (UTC). An account counts as active on a day it saved something to the cloud. Feature counts are totals, not linked to anyone.</p>

        {!s ? (
          <div className="bg-white rounded-2xl border border-bloom-border p-5">
            <p className="text-bloom-text font-semibold mb-1">Not set up yet</p>
            <p className="text-bloom-muted text-sm">The dashboard needs the Supabase project connected (with <code>SUPABASE_SERVICE_ROLE_KEY</code>) and <code>supabase/schema.sql</code> run again.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl border border-bloom-border p-4">
                <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold">Accounts</p>
                <p className="text-3xl font-bold text-bloom-text">{s.accounts}</p>
              </div>
              <div className="bg-white rounded-2xl border border-bloom-border p-4">
                <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold">Active this week</p>
                <p className="text-3xl font-bold text-bloom-accent">{s.weeks[0] ? s.weeks[0].active : 0}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-bloom-text mb-2">Week by week</h2>
            <div className="bg-white rounded-2xl border border-bloom-border mb-6 overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-bloom-border">
                  <tr><Cell head>Week of</Cell><Cell head>New accounts</Cell><Cell head>Active accounts</Cell>{FEATURES.map(function (f) { return <Cell key={f[0]} head>{f[1]}</Cell>; })}</tr>
                </thead>
                <tbody>
                  {s.weeks.map(function (w) {
                    return (
                      <tr key={w.week} className="border-b border-bloom-border last:border-0">
                        <Cell>{fmtWeek(w.week)}</Cell><Cell>{w.signups}</Cell><Cell>{w.active}</Cell>
                        {FEATURES.map(function (f) { return <Cell key={f[0]}>{(w.usage && w.usage[f[0]]) || 0}</Cell>; })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold text-bloom-text mb-1">Do testers come back?</h2>
            <p className="text-bloom-muted text-sm mb-2">For each week&apos;s new accounts: the share that were active again 1, 2 and 4 weeks after signing up.</p>
            <div className="bg-white rounded-2xl border border-bloom-border mb-6 overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-bloom-border">
                  <tr><Cell head>Signed up week of</Cell><Cell head>Accounts</Cell><Cell head>Week 1</Cell><Cell head>Week 2</Cell><Cell head>Week 4</Cell></tr>
                </thead>
                <tbody>
                  {s.cohorts.filter(function (c) { return c.size > 0; }).map(function (c) {
                    return (
                      <tr key={c.week} className="border-b border-bloom-border last:border-0">
                        <Cell>{fmtWeek(c.week)}</Cell><Cell>{c.size}</Cell><Cell>{pct(c.week1, c.size)}</Cell><Cell>{pct(c.week2, c.size)}</Cell><Cell>{pct(c.week4, c.size)}</Cell>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-bloom-dim text-xs">Recent sign-ups can&apos;t have a week 4 yet, so those columns fill in over time.</p>
          </>
        )}
      </div>
    </main>
  );
}
