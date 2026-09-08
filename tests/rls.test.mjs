// @vitest-environment node
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
let db;
const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
const cycleA = "10000000-0000-4000-8000-000000000001";
const cycleB = "10000000-0000-4000-8000-000000000002";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth, public to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;`);
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/202609080001_bloom.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.query(
    'insert into auth.users values ($1, \'{"name":"Synthetic A"}\'), ($2, \'{"name":"Synthetic B"}\')',
    [A, B],
  );
  for (const [id, owner] of [
    [cycleA, A],
    [cycleB, B],
  ]) {
    await db.query(
      "insert into cycles(id,user_id,title,clinic,protocol,phase,start_date) values ($1,$2,'Test','Synthetic clinic','Not specified','planning','2026-09-08')",
      [id, owner],
    );
    await db.query(
      "insert into doses(user_id,cycle_id,name,dose,instructions,scheduled_at) values ($1,$2,'Synthetic medicine','Clinic dose','Clinic instructions','2030-01-01T08:00:00Z')",
      [owner, id],
    );
    await db.query(
      "insert into appointments(user_id,cycle_id,title,location,scheduled_at) values ($1,$2,'Test visit','Test clinic','2030-01-01T08:00:00Z')",
      [owner, id],
    );
    await db.query(
      "insert into results(user_id,cycle_id,test,value,unit,measured_on) values ($1,$2,'Test',0,'U','2026-09-08')",
      [owner, id],
    );
    await db.query(
      "insert into checkins(user_id,cycle_id,recorded_on,mood,anxiety,hope) values ($1,$2,'2026-09-08',0,1,1)",
      [owner, id],
    );
    await db.query(
      "insert into journal(user_id,cycle_id,note) values ($1,$2,'Synthetic private note')",
      [owner, id],
    );
  }
}, 30000);
afterAll(async () => {
  await db?.close();
});
async function asUser(id, fn, role = "authenticated") {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}
describe("real PostgreSQL row-level policies in isolated PGlite", () => {
  it("creates profiles via the auth signup trigger", async () => {
    expect(
      (await db.query("select name from profiles order by id")).rows.map(
        (r) => r.name,
      ),
    ).toEqual(["Synthetic A", "Synthetic B"]);
  });
  for (const table of [
    "cycles",
    "doses",
    "appointments",
    "results",
    "checkins",
    "journal",
  ]) {
    it(`${table}: A and B can only read their own records`, async () => {
      for (const user of [A, B])
        await asUser(user, async () => {
          const { rows } = await db.query(`select * from ${table}`);
          expect(rows).toHaveLength(1);
          expect(rows[0].user_id).toBe(user);
        });
    });
    it(`${table}: A cannot modify or take ownership of B records`, async () => {
      await asUser(A, async () => {
        expect(
          (
            await db.query(
              `update ${table} set user_id=$1 where user_id=$2 returning id`,
              [A, B],
            )
          ).rows,
        ).toHaveLength(0);
        await expect(
          db.query(`update ${table} set user_id=$1 where user_id=$2`, [B, A]),
        ).rejects.toThrow();
        if (table !== "cycles")
          expect(
            (
              await db.query(
                `delete from ${table} where user_id=$1 returning id`,
                [B],
              )
            ).rows,
          ).toHaveLength(0);
      });
    });
    it(`${table}: anonymous access is denied`, async () => {
      await asUser(
        "",
        async () => {
          await expect(db.query(`select * from ${table}`)).rejects.toThrow();
        },
        "anon",
      );
    });
  }
  it("blocks forged ownership and cross-user cycle references", async () => {
    await asUser(A, async () => {
      await expect(
        db.query(
          "insert into journal(user_id,cycle_id,note) values ($1,$2,$3)",
          [B, cycleB, "Forged"],
        ),
      ).rejects.toThrow();
      await expect(
        db.query(
          "insert into journal(user_id,cycle_id,note) values ($1,$2,$3)",
          [A, cycleB, "Wrong cycle"],
        ),
      ).rejects.toThrow();
    });
  });
  it("allows owner writes, edits, reload reads and deletes", async () => {
    await asUser(A, async () => {
      const {
        rows: [row],
      } = await db.query(
        "insert into journal(user_id,cycle_id,note) values ($1,$2,$3) returning id",
        [A, cycleA, "New synthetic note"],
      );
      await db.query("update journal set note=$1 where id=$2", [
        "Edited synthetic note",
        row.id,
      ]);
      expect(
        (await db.query("select note from journal where id=$1", [row.id]))
          .rows[0].note,
      ).toBe("Edited synthetic note");
      expect(
        (
          await db.query("delete from journal where id=$1 returning id", [
            row.id,
          ])
        ).rows,
      ).toHaveLength(1);
    });
  });
  it("protects profiles from cross-user reads and privilege escalation", async () => {
    await asUser(A, async () => {
      expect((await db.query("select id from profiles")).rows).toEqual([
        { id: A },
      ]);
      expect(
        (
          await db.query(
            "update profiles set name=$1 where id=$2 returning id",
            ["Forged", B],
          )
        ).rows,
      ).toHaveLength(0);
      await expect(
        db.query("update profiles set id=$1 where id=$2", [B, A]),
      ).rejects.toThrow();
      await expect(
        db.query("update profiles set role='admin' where id=$1", [A]),
      ).rejects.toThrow();
    });
  });
  it("enforces taken timestamps and duplicate individual dose constraints", async () => {
    await asUser(A, async () => {
      await expect(
        db.query("update doses set status='taken' where user_id=$1", [A]),
      ).rejects.toThrow();
      await expect(
        db.query(
          "insert into doses(user_id,cycle_id,name,dose,instructions,scheduled_at) values ($1,$2,'Synthetic medicine','Clinic dose','Clinic instructions','2030-01-01T08:00:00Z')",
          [A, cycleA],
        ),
      ).rejects.toThrow();
    });
  });
});
