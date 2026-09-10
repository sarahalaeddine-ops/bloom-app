export const TABLES = [
  "cycles",
  "doses",
  "appointments",
  "results",
  "checkins",
  "journal",
];
export const PHASES = [
  "planning",
  "stimulation",
  "retrieval",
  "transfer",
  "tww",
  "completed",
];
const required = (value, label, max = 500) => {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error(`Enter ${label} (up to ${max} characters).`);
  return value.trim();
};
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function validateRecord(table, input) {
  const x = { ...input };
  if (!TABLES.includes(table)) throw new Error("Unsupported record.");
  delete x.user_id;
  delete x.id;
  delete x.created_at;
  if (table !== "cycles") required(x.cycle_id, "a cycle");
  if (table === "cycles") {
    x.title = required(x.title, "a cycle name", 100);
    x.clinic = required(x.clinic, "your clinic", 200);
    x.protocol = required(
      x.protocol,
      "your clinic protocol, or Not yet specified",
      200,
    );
    if (!PHASES.includes(x.phase)) throw new Error("Choose a treatment phase.");
    if (!validDate(x.start_date))
      throw new Error("Enter a valid cycle start date.");
  }
  if (table === "doses") {
    x.name = required(x.name, "the medication name", 200);
    x.dose = required(x.dose, "the dose exactly as prescribed", 200);
    x.instructions = required(x.instructions, "the clinic instructions", 2000);
    if (!["pending", "taken", "missed"].includes(x.status))
      throw new Error("Choose a valid dose status.");
    if (!Number.isFinite(Date.parse(x.scheduled_at)))
      throw new Error("Enter the scheduled date and time.");
    if (
      x.status === "taken" &&
      (!Number.isFinite(Date.parse(x.taken_at)) ||
        Date.parse(x.taken_at) > Date.now())
    )
      throw new Error("Enter the actual time taken, not a future time.");
    if (x.status !== "taken") x.taken_at = null;
  }
  if (table === "appointments") {
    x.title = required(x.title, "an appointment name", 200);
    x.location = required(x.location, "a location", 500);
    if (!Number.isFinite(Date.parse(x.scheduled_at)))
      throw new Error("Enter the appointment date and time.");
  }
  if (table === "results") {
    x.test = required(x.test, "a test name", 100);
    x.unit = required(x.unit, "the lab unit", 80);
    if (
      x.value === "" ||
      !Number.isFinite(Number(x.value)) ||
      Number(x.value) < 0
    )
      throw new Error("Enter a non-negative numeric result.");
    x.value = Number(x.value);
    if (!validDate(x.measured_on)) throw new Error("Enter the result date.");
  }
  if (table === "checkins") {
    if (!validDate(x.recorded_on)) throw new Error("Enter the check-in date.");
    if (!Number.isInteger(x.mood) || x.mood < 0 || x.mood > 4)
      throw new Error("Choose your mood.");
    if (
      ![x.anxiety, x.hope].every((n) => Number.isInteger(n) && n >= 1 && n <= 5)
    )
      throw new Error("Choose a rating from 1 to 5.");
    if (
      x.weight !== null &&
      (x.weight === "" ||
        !Number.isFinite(Number(x.weight)) ||
        Number(x.weight) <= 0)
    )
      throw new Error("Enter a positive weight or leave it blank.");
  }
  if (table === "journal") x.note = required(x.note, "a journal entry", 10000);
  return x;
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function cycleDay(start, today = localDate()) {
  if (!validDate(start) || !validDate(today)) return null;
  const days =
    Math.round(
      (Date.parse(`${today}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) /
        86400000,
    ) + 1;
  return days > 0 ? days : null;
}
export function resultGroups(results) {
  const groups = new Map();
  for (const r of results) {
    const key = JSON.stringify([r.test, r.unit]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  return [...groups.values()].map((rows) =>
    rows.sort((a, b) => a.measured_on.localeCompare(b.measured_on)),
  );
}
export function noraReply() {
  return "Nora AI is not connected yet. I cannot interpret results, recommend doses, choose trigger timing or predict treatment success. Follow your clinic’s written instructions and contact them about treatment questions. Bloom is not monitored for emergencies.";
}
const escapeICS = (s) =>
  String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
const stamp = (date) =>
  new Date(date)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
export function doseCalendar(dose, now = new Date()) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bloom//Dose Reminder//EN",
    "BEGIN:VEVENT",
    `UID:${dose.id}@bloom`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(dose.scheduled_at)}`,
    `DTEND:${stamp(Date.parse(dose.scheduled_at) + 60000)}`,
    "SUMMARY:Bloom medication reminder",
    "DESCRIPTION:Check your clinic instructions in Bloom.",
    "BEGIN:VALARM",
    "TRIGGER:PT0S",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeICS("Check your clinic instructions in Bloom.")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
export function cycleReport(cycle, records, includePrivate = false) {
  return JSON.stringify(
    {
      format: "Bloom patient-entered cycle report v1",
      exported_at: new Date().toISOString(),
      notice:
        "Patient-entered information; not verified by the clinic. No clinical interpretation.",
      cycle,
      doses: records.doses,
      appointments: records.appointments,
      results: records.results,
      ...(includePrivate
        ? { checkins: records.checkins, journal: records.journal }
        : {}),
    },
    (key, value) => (["user_id"].includes(key) ? undefined : value),
    2,
  );
}
