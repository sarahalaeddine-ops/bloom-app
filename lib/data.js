import { getClient } from "./supabase";
import { TABLES, validateRecord } from "./domain.mjs";
export async function loadRecords(userId) {
  const entries = await Promise.all(
    TABLES.map(async (table) => {
      const rows = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await getClient()
          .from(table)
          .select("*")
          .eq("user_id", userId)
          .order("created_at")
          .order("id")
          .range(offset, offset + pageSize - 1);
        if (error || !data)
          throw new Error(
            "Unable to load your records. Check your connection and retry.",
          );
        rows.push(...data);
        if (data.length < pageSize) break;
      }
      return [table, rows];
    }),
  );
  return Object.fromEntries(entries);
}
export async function saveRecord(table, input, userId, id) {
  const values = { ...validateRecord(table, input), user_id: userId };
  const query = id
    ? getClient().from(table).update(values).eq("id", id).eq("user_id", userId)
    : getClient().from(table).insert(values);
  const { data, error } = await query.select().single();
  if (error?.code === "23505")
    throw new Error(
      "A dose with this medication and time already exists. Edit it instead.",
    );
  if (error || !data)
    throw new Error("Not saved. Check your connection and try again.");
  return data;
}
export async function removeRecord(table, id, userId) {
  if (!TABLES.includes(table) || table === "cycles")
    throw new Error("This record cannot be deleted here.");
  const { data, error } = await getClient()
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .single();
  if (error || !data) throw new Error("Not deleted. Please retry.");
}
