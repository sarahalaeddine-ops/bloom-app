"use client";
import { useEffect, useState } from "react";
import { useBloom } from "../BloomData";
import { cycleDay } from "../../lib/domain.mjs";
export default function HomeScreen({ user, navigate }) {
  const { cycle, records } = useBloom();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 60000);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, []);
  const pending = records.doses
    .filter((d) => d.status === "pending")
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const next = records.appointments
    .filter((a) => Date.parse(a.scheduled_at) >= now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0];
  return (
    <div className="px-4 py-5">
      <p className="font-serif text-3xl italic text-bloom-accent mb-4">
        bloom ✦
      </p>
      <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 mb-3">
        <p className="text-bloom-muted">Welcome, {user.name}</p>
        <h1 className="text-3xl mt-2 mb-2">{cycle.title}</h1>
        <p className="capitalize">
          {cycle.phase} ·{" "}
          {cycleDay(cycle.start_date)
            ? `Cycle day ${cycleDay(cycle.start_date)}`
            : "Upcoming cycle"}
        </p>
        <p className="text-bloom-muted text-sm mt-2">
          {cycle.clinic} · {cycle.protocol}
        </p>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Next appointment</h2>
        <p className="text-bloom-muted text-sm">
          {next
            ? `${next.title} · ${new Date(next.scheduled_at).toLocaleString()}`
            : "No upcoming appointments recorded."}
        </p>
        <button
          className="text-bloom-accent mt-3"
          onClick={() => navigate("appointments")}
        >
          Manage appointments →
        </button>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Pending doses</h2>
        {pending.length ? (
          pending.slice(0, 5).map((d) => (
            <div className="py-3 border-b border-bloom-border" key={d.id}>
              <p>
                {d.name} · {d.dose}
              </p>
              <p className="text-sm text-bloom-muted">
                {new Date(d.scheduled_at).toLocaleString()} ·{" "}
                {Date.parse(d.scheduled_at) < now
                  ? "Scheduled time has passed; not logged"
                  : "Upcoming"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-bloom-muted">
            No pending doses recorded. Check your clinic schedule.
          </p>
        )}
        <button
          className="text-bloom-accent mt-3"
          onClick={() => navigate("medications")}
        >
          Manage individual doses →
        </button>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Your records</h2>
        <p className="text-bloom-muted text-sm">
          {records.results.length} results · {records.checkins.length} check-ins
        </p>
        <button
          onClick={() => navigate("results")}
          className="text-bloom-accent mt-3"
        >
          Results and charts →
        </button>
      </div>
      <p className="text-xs text-bloom-muted">
        Your clinic determines medication doses, trigger timing and treatment
        dates. Bloom does not monitor your records or alert your clinic.
      </p>
    </div>
  );
}
