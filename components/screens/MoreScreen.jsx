"use client";
import { useState } from "react";
import { auth } from "../../lib/store";
import { useBloom } from "../BloomData";
import OnboardingScreen from "../OnboardingScreen";
import RecordsScreen, { ReportScreen } from "./RecordsScreen";
const SECTIONS = [
  [
    "medications",
    "◎",
    "Medications",
    "Individual doses and calendar reminders",
  ],
  ["appointments", "◔", "Appointments", "Your clinic-arranged schedule"],
  ["results", "↗", "Results & Charts", "Recorded values, grouped by unit"],
  ["report", "↓", "My Cycle Report", "Export your recorded cycle"],
  ["journal", "▣", "Journal", "Saved personal notes"],
  ["cycle", "✦", "Edit cycle", "Clinic, phase and start date"],
];
const DEFERRED = [
  "Partner Space",
  "Therapy & Coaching",
  "Wellbeing Videos",
  "Community",
  "Two Week Wait guide",
  "After a Failed Cycle",
  "Pregnancy Journey",
  "Bloom+ paid plans",
];
export default function MoreScreen({ user, setUser, active, setActive }) {
  const { cycle } = useBloom();
  const [name, setName] = useState(user.name);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const back = (
    <button
      className="text-bloom-accent px-4 py-4"
      onClick={() => {
        setActive(null);
        setError("");
        setMessage("");
      }}
    >
      ← Back
    </button>
  );
  if (active === "cycle")
    return (
      <>
        {back}
        <OnboardingScreen existing={cycle} onComplete={() => setActive(null)} />
      </>
    );
  if (active === "new-cycle")
    return (
      <>
        {back}
        <OnboardingScreen onComplete={() => setActive(null)} />
      </>
    );
  if (active === "report")
    return (
      <>
        {back}
        <ReportScreen />
      </>
    );
  const table = {
    medications: "doses",
    appointments: "appointments",
    results: "results",
    journal: "journal",
  }[active];
  if (table)
    return (
      <>
        {back}
        <RecordsScreen key={`${table}-${cycle.id}`} table={table} />
      </>
    );
  async function saveProfile(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const updated = await auth.updateUser({ name });
      setUser(updated);
      setMessage("Profile saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setError("");
    setBusy(true);
    try {
      await auth.signOut();
      setUser(null);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold py-3">More in Bloom</h1>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {SECTIONS.map(([id, icon, label, desc]) => (
          <button
            className="card text-left mb-0"
            key={id}
            onClick={() => setActive(id)}
          >
            <span className="text-bloom-accent text-2xl">{icon}</span>
            <h2 className="font-semibold text-sm mt-3">{label}</h2>
            <p className="text-xs text-bloom-muted mt-1">{desc}</p>
          </button>
        ))}
      </div>
      <button className="btn mb-4" onClick={() => setActive("new-cycle")}>
        Add another cycle
      </button>
      <form className="card space-y-3" onSubmit={saveProfile}>
        <h2 className="font-semibold">My profile</h2>
        <p className="text-bloom-muted text-sm">{user.email}</p>
        <label className="block">
          Your name
          <input
            className="field mt-2"
            value={name}
            required
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button className="btn" disabled={busy}>
          Save profile
        </button>
        <button
          className="ml-4 text-bloom-muted"
          disabled={busy}
          type="button"
          onClick={logout}
        >
          Sign out
        </button>
      </form>
      <div className="card">
        <h2 className="font-semibold mb-3">Not available in this release</h2>
        <ul className="text-sm text-bloom-muted space-y-2">
          {DEFERRED.map((label) => (
            <li key={label}>{label} — not connected</li>
          ))}
        </ul>
        <p className="text-xs text-bloom-muted mt-4">
          No partner invitations, bookings, payments or clinic notifications are
          sent. These features need further development and review.
        </p>
      </div>
    </section>
  );
}
