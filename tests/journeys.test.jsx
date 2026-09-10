import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BloomData from "../components/BloomData";
import AppShell from "../components/AppShell";
import AuthScreen from "../components/AuthScreen";
import { auth } from "../lib/store";
import { loadRecords, saveRecord, removeRecord } from "../lib/data";
vi.mock("../lib/data", () => ({
  loadRecords: vi.fn(),
  saveRecord: vi.fn(),
  removeRecord: vi.fn(),
}));
vi.mock("../lib/store", () => ({
  auth: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    recover: vi.fn(),
    resetPassword: vi.fn(),
    signOut: vi.fn(),
    updateUser: vi.fn(),
  },
}));
vi.mock("../lib/supabase", () => ({ isConfigured: true }));
let db;
let serial;
const person = {
  id: "synthetic-a",
  name: "Test Person",
  email: "synthetic@example.invalid",
};
function mount() {
  return render(
    <BloomData user={person}>
      <AppShell user={person} setUser={vi.fn()} />
    </BloomData>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  serial = 0;
  db = {
    cycles: [
      {
        id: "cycle-a",
        user_id: person.id,
        title: "Synthetic cycle",
        clinic: "Test clinic",
        protocol: "Not yet specified",
        phase: "planning",
        start_date: "2026-09-08",
        created_at: "2026-09-08T00:00:00Z",
      },
    ],
    doses: [],
    appointments: [],
    results: [],
    checkins: [],
    journal: [],
  };
  loadRecords.mockImplementation(async () => structuredClone(db));
  saveRecord.mockImplementation(async (table, input, userId, id) => {
    const row = {
      ...input,
      id: id || `record-${++serial}`,
      user_id: userId,
      created_at: "2026-09-08T12:00:00Z",
    };
    db[table] = id
      ? db[table].map((r) => (r.id === id ? row : r))
      : [...db[table], row];
    return row;
  });
  removeRecord.mockImplementation(async (table, id) => {
    db[table] = db[table].filter((r) => r.id !== id);
  });
});
async function more(user, label) {
  await user.click(
    await screen.findByRole("button", { name: "More", exact: true }),
  );
  await user.click(screen.getByRole("button", { name: label }));
}
describe("synthetic user journeys through the React UI (mock transport)", () => {
  it("shows load failure and retries without claiming empty saved data", async () => {
    loadRecords.mockRejectedValueOnce(new Error("Connection unavailable"));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Connection unavailable",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Retry loading records" }),
    );
    expect(
      await screen.findByText("Synthetic cycle", { selector: "h1" }),
    ).toBeVisible();
  });
  it("onboards an empty account and restores its cycle after remount", async () => {
    db.cycles = [];
    const user = userEvent.setup();
    const view = mount();
    await user.type(
      await screen.findByLabelText("Cycle name"),
      "First test cycle",
    );
    await user.type(screen.getByLabelText("Clinic"), "Test clinic");
    await user.type(
      screen.getByLabelText("Clinic protocol"),
      "Not yet specified",
    );
    await user.click(screen.getByRole("button", { name: "Save cycle" }));
    expect(
      await screen.findByRole("heading", { name: "First test cycle" }),
    ).toBeVisible();
    view.unmount();
    mount();
    expect(
      await screen.findByRole("heading", { name: "First test cycle" }),
    ).toBeVisible();
  });
  it("does not show check-in success until the save succeeds, then restores history", async () => {
    const user = userEvent.setup();
    const view = mount();
    await user.click(
      await screen.findByRole("button", { name: "Check-in", exact: true }),
    );
    await user.click(screen.getByRole("button", { name: "🌱 Hopeful" }));
    await user.click(screen.getByRole("button", { name: "Fatigue" }));
    await user.type(
      screen.getByLabelText("Journal note"),
      "Synthetic check-in note",
    );
    saveRecord.mockRejectedValueOnce(new Error("Not saved. Test failure."));
    await user.click(
      screen.getByRole("button", { name: "Save today check-in" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Not saved");
    expect(screen.queryByText("Check-in saved")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Save today check-in" }),
    );
    expect(await screen.findByText("Check-in saved")).toBeVisible();
    view.unmount();
    mount();
    await user.click(
      await screen.findByRole("button", { name: "Check-in", exact: true }),
    );
    expect(await screen.findByText("Synthetic check-in note")).toBeVisible();
  });
  it("saves two doses of one medication independently, logs one taken and preserves the other", async () => {
    const user = userEvent.setup();
    const view = mount();
    await more(user, /Medications Individual/);
    for (const time of ["2030-01-01T08:00", "2030-01-01T20:00"]) {
      await user.click(
        screen.getByRole("button", { name: "Add individual dose" }),
      );
      await user.type(
        screen.getByLabelText("Medication name"),
        "Synthetic medicine",
      );
      await user.type(
        screen.getByLabelText("Dose exactly as prescribed (include unit)"),
        "Clinic dose",
      );
      await user.type(
        screen.getByLabelText("Clinic instructions"),
        "Synthetic clinic instructions",
      );
      await user.type(screen.getByLabelText("Scheduled date and time"), time);
      await user.click(screen.getByRole("button", { name: "Save record" }));
      await screen.findByText("Saved to your account.");
    }
    expect(db.doses).toHaveLength(2);
    await user.click(
      screen.getAllByRole("button", { name: "Edit Synthetic medicine" })[0],
    );
    await user.selectOptions(screen.getByLabelText("Dose status"), "taken");
    await user.type(
      screen.getByLabelText("Actual date and time taken"),
      "2026-09-01T08:00",
    );
    await user.click(screen.getByRole("button", { name: "Save record" }));
    await waitFor(() =>
      expect(db.doses.map((d) => d.status)).toEqual(["taken", "pending"]),
    );
    view.unmount();
    mount();
    await more(user, /Medications Individual/);
    expect(await screen.findByText("taken")).toBeVisible();
    expect(screen.getByText("pending")).toBeVisible();
  });
  it("records appointments, zero results and a journal; keeps private report inclusion opt-in", async () => {
    const user = userEvent.setup();
    mount();
    await more(user, /Appointments Your/);
    await user.click(screen.getByRole("button", { name: "Add record" }));
    await user.type(
      screen.getByLabelText("Appointment name"),
      "Synthetic appointment",
    );
    await user.type(screen.getByLabelText("Location"), "Test clinic");
    await user.type(
      screen.getByLabelText("Appointment date and time"),
      "2030-01-02T09:00",
    );
    await user.click(screen.getByRole("button", { name: "Save record" }));
    expect(
      await screen.findByRole("heading", { name: "Synthetic appointment" }),
    ).toBeVisible();
    await more(user, /Results & Charts Recorded/);
    await user.click(screen.getByRole("button", { name: "Add record" }));
    await user.type(screen.getByLabelText("Test name"), "Synthetic test");
    await user.type(screen.getByLabelText("Result value"), "0");
    await user.type(screen.getByLabelText("Unit from lab report"), "U");
    await user.click(screen.getByRole("button", { name: "Save record" }));
    expect(await screen.findByText("Synthetic test (U)")).toBeVisible();
    await more(user, /Journal Saved/);
    await user.click(screen.getByRole("button", { name: "Add record" }));
    await user.type(
      screen.getByLabelText("Journal entry"),
      "Synthetic private note",
    );
    await user.click(screen.getByRole("button", { name: "Save record" }));
    expect(await screen.findByText("Synthetic private note")).toBeVisible();
    await more(user, /My Cycle Report Export/);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(
      screen.getByText("0 doses · 1 appointments · 1 results"),
    ).toBeVisible();
  });
  it("requires confirmation for deletion and reflects its successful removal", async () => {
    db.journal = [
      {
        id: "j1",
        cycle_id: "cycle-a",
        note: "Synthetic delete test",
        created_at: "2026-09-08T00:00:00Z",
      },
    ];
    const user = userEvent.setup();
    mount();
    await more(user, /Journal Saved/);
    await user.click(
      screen.getByRole("button", { name: "Delete", exact: true }),
    );
    expect(removeRecord).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));
    expect(await screen.findByText("Record deleted.")).toBeVisible();
    expect(screen.queryByText("Synthetic delete test")).not.toBeInTheDocument();
  });
  it("does not show records from another selected cycle", async () => {
    db.cycles.push({ ...db.cycles[0], id: "cycle-b", title: "Other cycle" });
    db.journal = [
      {
        id: "j1",
        cycle_id: "cycle-a",
        note: "Cycle A only",
        created_at: "2026-09-08T00:00:00Z",
      },
    ];
    const user = userEvent.setup();
    mount();
    await more(user, /Journal Saved/);
    expect(screen.queryByText("Cycle A only")).not.toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText("Selected cycle"),
      "cycle-a",
    );
    await user.click(screen.getByRole("button", { name: /Journal Saved/ }));
    expect(screen.getByText("Cycle A only")).toBeVisible();
  });
});
describe("auth forms with synthetic transport", () => {
  it("shows generic recovery confirmation only after provider success", async () => {
    const user = userEvent.setup();
    render(<AuthScreen onLogin={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    await user.type(
      screen.getByLabelText("Email"),
      "synthetic@example.invalid",
    );
    auth.recover.mockRejectedValueOnce(new Error("Reset unavailable"));
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Reset unavailable",
    );
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "If an account exists",
    );
  });
  it("handles sign-in failure without opening the app", async () => {
    const login = vi.fn();
    auth.signIn.mockRejectedValue(new Error("Unable to sign in"));
    const user = userEvent.setup();
    render(<AuthScreen onLogin={login} />);
    await user.type(
      screen.getByLabelText("Email"),
      "synthetic@example.invalid",
    );
    await user.type(screen.getByLabelText("Password"), "synthetic-password");
    await user.click(
      screen.getByRole("button", { name: "Sign in", exact: true }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to sign in",
    );
    expect(login).not.toHaveBeenCalled();
  });
});
