"use client";
import { useState } from "react";
import { useBloom } from "./BloomData";
import { PHASES, localDate } from "../lib/domain.mjs";
export default function OnboardingScreen({ onComplete, existing = null }) {
  const { save, setCycleId } = useBloom();
  const [values, setValues] = useState(
    existing || {
      title: "",
      clinic: "",
      protocol: "",
      phase: "planning",
      start_date: localDate(),
    },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { title, clinic, protocol, phase, start_date } = values;
      const row = await save(
        "cycles",
        { title, clinic, protocol, phase, start_date },
        existing?.id,
      );
      setCycleId(row.id);
      onComplete?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="px-5 py-6">
      <p className="text-4xl italic font-serif text-bloom-accent mb-4">
        bloom ✦
      </p>
      <h1 className="text-2xl mb-3">
        {existing ? "Edit cycle" : "Set up your cycle"}
      </h1>
      <p className="text-bloom-muted mb-4">
        Copy details from your clinic. If the protocol is not confirmed, enter
        “Not yet specified”. This does not connect to your clinic.
      </p>
      <form className="card space-y-4" onSubmit={submit}>
        {[
          ["title", "Cycle name", "text"],
          ["clinic", "Clinic", "text"],
          ["protocol", "Clinic protocol", "text"],
          ["start_date", "Cycle start date", "date"],
        ].map(([key, label, type]) => (
          <label key={key} className="block">
            {label}
            <input
              className="field mt-1"
              type={type}
              required
              maxLength={key === "title" ? 100 : 200}
              value={values[key]}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="block">
          Phase
          <select
            className="field mt-1"
            value={values.phase}
            onChange={(e) => setValues({ ...values, phase: e.target.value })}
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-bloom-muted">
          Cycle day counts from the date you enter; it is not a stimulation-day
          or retrieval estimate.
        </p>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <button className="btn w-full" disabled={busy}>
          {busy ? "Saving…" : "Save cycle"}
        </button>
      </form>
    </main>
  );
}
