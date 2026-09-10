import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("../lib/supabase", () => ({ getClient: () => mock }));
import { loadRecords, saveRecord, removeRecord } from "../lib/data";
beforeEach(() => vi.clearAllMocks());
describe("database adapter failure and ownership boundaries", () => {
  it("overwrites forged owner input with the authenticated caller supplied by the provider", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "j1" } });
    const insert = vi.fn(() => ({ select: () => ({ single }) }));
    mock.from.mockReturnValue({ insert });
    await saveRecord(
      "journal",
      { cycle_id: "c1", user_id: "forged", note: "Synthetic note" },
      "owner",
    );
    expect(insert).toHaveBeenCalledWith({
      cycle_id: "c1",
      user_id: "owner",
      note: "Synthetic note",
    });
  });
  it("requires a returned database row before claiming a saved result", async () => {
    mock.from.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: async () => ({ error: new Error("RLS denial") }),
        }),
      }),
    });
    await expect(
      saveRecord(
        "journal",
        { cycle_id: "c1", note: "Synthetic note" },
        "owner",
      ),
    ).rejects.toThrow("Not saved");
  });
  it("does not treat zero-row deletion as success", async () => {
    const query = {
      eq: vi.fn(() => query),
      select: vi.fn(() => query),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mock.from.mockReturnValue({ delete: () => query });
    await expect(removeRecord("journal", "j1", "owner")).rejects.toThrow(
      "Not deleted",
    );
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner");
  });
});

it("loads every page so large histories are not silently truncated", async () => {
  const firstPage = Array.from({ length: 500 }, (_, id) => ({ id }));
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(async (start) => ({
      data: start === 0 ? firstPage : [{ id: 500 }],
    })),
  };
  mock.from.mockReturnValue(query);
  const records = await loadRecords("owner");
  expect(records.doses).toHaveLength(501);
  expect(query.range).toHaveBeenCalledWith(500, 999);
});
