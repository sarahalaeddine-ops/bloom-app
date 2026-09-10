"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loadRecords, saveRecord, removeRecord } from "../lib/data";
const Context = createContext(null);
export function useBloom() {
  return useContext(Context);
}
export default function BloomData({ user, children }) {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [cycleId, setCycleId] = useState("");
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    let cancelled = false;
    loadRecords(user.id)
      .then((data) => {
        if (!cancelled) {
          setRecords(data);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
      active.current = false;
    };
  }, [user.id, attempt]);
  const cycle =
    records?.cycles.find((c) => c.id === cycleId) ||
    records?.cycles.at(-1) ||
    null;
  async function save(table, values, id) {
    const row = await saveRecord(table, values, user.id, id);
    if (active.current)
      setRecords((old) => ({
        ...old,
        [table]: id
          ? old[table].map((r) => (r.id === id ? row : r))
          : [...old[table], row],
      }));
    return row;
  }
  async function remove(table, id) {
    await removeRecord(table, id, user.id);
    if (active.current)
      setRecords((old) => ({
        ...old,
        [table]: old[table].filter((r) => r.id !== id),
      }));
  }
  if (error)
    return (
      <div className="p-6">
        <p role="alert">{error}</p>
        <button className="btn mt-4" onClick={() => setAttempt((a) => a + 1)}>
          Retry loading records
        </button>
      </div>
    );
  if (!records)
    return (
      <p role="status" className="p-6">
        Loading your records…
      </p>
    );
  const current = Object.fromEntries(
    Object.entries(records).map(([table, rows]) => [
      table,
      table === "cycles" ? rows : rows.filter((r) => r.cycle_id === cycle?.id),
    ]),
  );
  return (
    <Context.Provider
      value={{
        records: current,
        cycles: records.cycles,
        cycle,
        setCycleId,
        save,
        remove,
      }}
    >
      {children}
    </Context.Provider>
  );
}
