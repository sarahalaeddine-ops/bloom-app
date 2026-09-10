"use client";
import { useState } from "react";
import { useBloom } from "../BloomData";
import {
  doseCalendar,
  localDate,
  resultGroups,
  cycleReport,
} from "../../lib/domain.mjs";

const CONFIG = {
  doses: {
    title: "Medications",
    fields: [
      ["name", "Medication name", "text"],
      ["dose", "Dose exactly as prescribed (include unit)", "text"],
      ["instructions", "Clinic instructions", "textarea"],
      ["scheduled_at", "Scheduled date and time", "datetime-local"],
      ["status", "Dose status", "status"],
      ["taken_at", "Actual date and time taken", "datetime-local"],
      ["site", "Injection site (optional)", "optional"],
      ["note", "Note (optional)", "textarea?"],
    ],
  },
  appointments: {
    title: "Appointments",
    fields: [
      ["title", "Appointment name", "text"],
      ["location", "Location", "text"],
      ["scheduled_at", "Appointment date and time", "datetime-local"],
      [
        "instructions",
        "Clinic preparation instructions (optional)",
        "textarea?",
      ],
    ],
  },
  results: {
    title: "Results & Charts",
    fields: [
      ["test", "Test name", "text"],
      ["value", "Result value", "number"],
      ["unit", "Unit from lab report", "text"],
      ["measured_on", "Result date", "date"],
      ["note", "Lab notes (optional)", "textarea?"],
    ],
  },
  journal: {
    title: "Journal",
    fields: [["note", "Journal entry", "textarea"]],
  },
};
const localTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return `${localDate(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
export function download(text, filename, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function RecordsScreen({ table }) {
  const { cycle, records, save, remove } = useBloom();
  const config = CONFIG[table];
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  function open(row) {
    setError("");
    setMessage("");
    setEditing(row?.id || null);
    setDraft(
      row
        ? {
            ...row,
            scheduled_at: localTime(row.scheduled_at),
            taken_at: localTime(row.taken_at),
          }
        : {
            status: "pending",
            measured_on: localDate(),
            name: "",
            dose: "",
            instructions: "",
            scheduled_at: "",
            taken_at: "",
            site: "",
            note: "",
            title: "",
            location: "",
            test: "",
            value: "",
            unit: "",
          },
    );
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const values = { cycle_id: cycle.id };
      for (const [key] of config.fields) {
        if (key === "taken_at")
          values[key] =
            draft.status === "taken" && draft[key]
              ? new Date(draft[key]).toISOString()
              : null;
        else if (key === "scheduled_at")
          values[key] = draft[key] ? new Date(draft[key]).toISOString() : "";
        else values[key] = draft[key] ?? "";
      }
      await save(table, values, editing);
      setDraft(null);
      setEditing(null);
      setMessage("Saved to your account.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function destroy(id) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await remove(table, id);
      setConfirmDelete(null);
      setMessage("Record deleted.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const rows = [...records[table]].sort((a, b) =>
    (a.scheduled_at || a.measured_on || a.created_at).localeCompare(
      b.scheduled_at || b.measured_on || b.created_at,
    ),
  );
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">{config.title}</h1>
      {table === "doses" && (
        <div className="card text-sm text-bloom-muted">
          Add each dose separately using your clinic’s exact instructions. For
          missed or unclear doses, contact your clinic; Bloom does not suggest
          catch-up doses.
          <p className="mt-2">
            Reminders use a calendar file you import yourself. Bloom sends no
            push, email or SMS alerts. Check the imported time and enable alerts
            in your calendar; keep a backup alarm.
          </p>
        </div>
      )}
      {table === "appointments" && (
        <p className="text-sm text-bloom-muted mb-4">
          This records an appointment already arranged with your clinic; it does
          not book or notify them.
        </p>
      )}
      {table === "results" && (
        <p className="text-sm text-bloom-muted mb-4">
          Copy values and units from your lab report. Charts group only matching
          test names and units. Bloom does not interpret results or set alert
          thresholds.
        </p>
      )}
      {table === "journal" && (
        <p className="text-sm text-bloom-muted mb-4">
          Saved to your account. Partner sharing is unavailable. This is not an
          encrypted vault or a monitored chat.
        </p>
      )}
      {error && (
        <p role="alert" className="card text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="card text-bloom-muted">
          {message}
        </p>
      )}
      {!draft && (
        <button onClick={() => open(null)} className="btn mb-4">
          {table === "doses" ? "Add individual dose" : "Add record"}
        </button>
      )}
      {draft && (
        <form onSubmit={submit} className="card space-y-4">
          <h2 className="font-semibold">
            {editing ? "Edit record" : "New record"}
          </h2>
          {config.fields
            .filter(([key]) => key !== "taken_at" || draft.status === "taken")
            .map(([key, label, type]) => (
              <label className="block text-sm" key={key}>
                {label}
                {type === "status" ? (
                  <select
                    className="field mt-1"
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                  >
                    {["pending", "taken", "missed"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : type.startsWith("textarea") ? (
                  <textarea
                    className="field mt-1"
                    maxLength={table === "journal" ? 10000 : 2000}
                    rows={3}
                    required={!type.endsWith("?")}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                  />
                ) : (
                  <input
                    className="field mt-1"
                    required={type !== "optional"}
                    type={type === "optional" ? "text" : type}
                    maxLength={500}
                    min={type === "number" ? 0 : undefined}
                    step={type === "number" ? "any" : undefined}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                  />
                )}
              </label>
            ))}
          {config.fields.some(([, , type]) => type === "datetime-local") && (
            <p className="text-xs text-bloom-muted">
              Times are entered in this device’s timezone (
              {Intl.DateTimeFormat().resolvedOptions().timeZone}). Confirm
              against your clinic’s timezone, especially when travelling.
            </p>
          )}
          <div className="flex gap-3">
            <button className="btn" disabled={busy}>
              {busy ? "Saving…" : "Save record"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft(null);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {!rows.length && (
        <p className="card text-bloom-muted">No records in this cycle yet.</p>
      )}
      {rows.map((row) => (
        <article key={row.id} className="card">
          <h2 className="font-semibold">
            {row.name ||
              row.title ||
              row.test ||
              new Date(row.created_at).toLocaleDateString()}
          </h2>
          {table === "doses" && (
            <>
              <p>
                {row.dose} · <span className="capitalize">{row.status}</span>
              </p>
              <p className="text-sm text-bloom-muted">
                Scheduled: {new Date(row.scheduled_at).toLocaleString()}
              </p>
              {row.taken_at && (
                <p className="text-sm text-bloom-muted">
                  Taken: {new Date(row.taken_at).toLocaleString()}
                </p>
              )}
              {row.site && <p className="text-sm">Site: {row.site}</p>}
            </>
          )}
          {table === "appointments" && (
            <>
              <p>{new Date(row.scheduled_at).toLocaleString()}</p>
              <p className="text-bloom-muted">{row.location}</p>
            </>
          )}
          {table === "results" && (
            <p>
              {row.value} {row.unit} · {row.measured_on}
            </p>
          )}
          <p className="text-sm text-bloom-muted whitespace-pre-wrap break-words">
            {row.instructions || ""}
          </p>
          <p className="text-sm whitespace-pre-wrap break-words">
            {row.note || ""}
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <button
              className="text-bloom-accent"
              onClick={() => open(row)}
              aria-label={`Edit ${row.name || row.title || row.test || "journal entry"}`}
            >
              Edit
            </button>
            <button
              className="text-bloom-muted"
              onClick={() => setConfirmDelete(row.id)}
            >
              Delete
            </button>
            {table === "doses" && row.status === "pending" && (
              <button
                className="text-bloom-accent"
                onClick={() => {
                  download(
                    doseCalendar(row),
                    `bloom-dose-${row.id}.ics`,
                    "text/calendar",
                  );
                  setMessage(
                    "Calendar file prepared. Import it, verify the time and enable its alert in your calendar. Updating this dose in Bloom does not update an imported reminder.",
                  );
                }}
              >
                Export calendar reminder
              </button>
            )}
          </div>
          {confirmDelete === row.id && (
            <div className="mt-3" role="group" aria-label="Confirm deletion">
              <p>
                Delete this record permanently? Remove any imported calendar
                reminder separately.
              </p>
              <button
                className="btn mt-2 mr-3"
                disabled={busy}
                onClick={() => destroy(row.id)}
              >
                Confirm delete
              </button>
              <button disabled={busy} onClick={() => setConfirmDelete(null)}>
                Keep record
              </button>
            </div>
          )}
        </article>
      ))}
      {table === "results" && <Charts results={rows} />}
    </section>
  );
}
export function Charts({ results }) {
  return (
    <div>
      {resultGroups(results).map((rows) => {
        const max = Math.max(...rows.map((r) => Number(r.value)), 1);
        return (
          <div className="card" key={`${rows[0].test}-${rows[0].unit}`}>
            <h2 className="font-semibold mb-3">
              {rows[0].test} ({rows[0].unit})
            </h2>
            <p className="text-xs text-bloom-muted mb-2">
              Relative values; no target range or clinical interpretation.
            </p>
            {rows.map((r) => (
              <div key={r.id} className="mb-3">
                <p className="text-xs mb-1">
                  {r.measured_on}: {r.value} {r.unit}
                </p>
                <div className="bg-bloom-surface rounded h-3">
                  <div
                    className="h-3 bg-bloom-accent rounded"
                    style={{ width: `${(Number(r.value) / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
export function ReportScreen() {
  const { cycle, records } = useBloom();
  const [includePrivate, setIncludePrivate] = useState(false);
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-4">My Cycle Report</h1>
      <div className="card">
        <h2 className="font-semibold">{cycle.title}</h2>
        <p>
          {cycle.clinic} · {cycle.phase}
        </p>
        <p className="text-sm text-bloom-muted mt-2">
          {records.doses.length} doses · {records.appointments.length}{" "}
          appointments · {records.results.length} results
        </p>
        <p className="text-sm text-bloom-muted my-3">
          The downloadable JSON report contains your recorded treatment details
          without clinical interpretation. It is not sent to anyone
          automatically.
        </p>
        <label className="flex gap-2 my-4">
          <input
            type="checkbox"
            checked={includePrivate}
            onChange={(e) => setIncludePrivate(e.target.checked)}
          />
          Include mood, symptoms and private journal notes
        </label>
        <button
          className="btn"
          onClick={() =>
            download(
              cycleReport(cycle, records, includePrivate),
              "bloom-cycle-report.json",
              "application/json",
            )
          }
        >
          Download report
        </button>
        <p className="text-xs text-bloom-muted mt-3">
          Downloaded reports contain personal information. Choose carefully
          where you save and share them.
        </p>
      </div>
    </section>
  );
}
