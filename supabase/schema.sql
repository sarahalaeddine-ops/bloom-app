-- Bloom cloud schema. Run in the Supabase SQL editor (or `supabase db push`).
-- One JSON document per user holds their synced app state. Row-level security means
-- a signed-in user can only ever read or write their own row.
-- Secret Space entries arrive already encrypted on the device (AES-256-GCM), so
-- they are unreadable here.

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Size guard: one user's synced state stays under 2 MB, so a buggy or abusive client can't
-- fill the database. Added "not valid" so re-running never fails on existing rows.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'user_state_data_size') then
    alter table public.user_state add constraint user_state_data_size check (pg_column_size(data) < 2097152) not valid;
  end if;
end $$;

alter table public.user_state enable row level security;

drop policy if exists "user_state: read own"   on public.user_state;
drop policy if exists "user_state: insert own" on public.user_state;
drop policy if exists "user_state: update own" on public.user_state;
drop policy if exists "user_state: delete own" on public.user_state;

create policy "user_state: read own"   on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_state: insert own" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_state: update own" on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_state: delete own" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);

-- ── Consent records (G11) ──────────────────────────────────────────────────
-- Append-only log of her health-data consent choices: which consent text version she saw and
-- what she chose for cloud sync and Nora AI. The timestamp is set by the database, not the client.
-- She can read and add her own rows but never change or delete them; deleting her account
-- (auth.users) removes them through the cascade. Her current choice also lives in
-- user_state.data.consent, which /api/nora reads to decide whether the AI path is allowed.
create table if not exists public.consent_events (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  version    text        not null check (char_length(version) between 1 and 40),
  cloud      boolean     not null,
  ai         boolean     not null,
  created_at timestamptz not null default now()
);

create index if not exists consent_events_user_idx on public.consent_events (user_id, created_at desc);

create or replace function public.consent_events_server_time()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := now();
  return new;
end $$;

drop trigger if exists consent_events_server_time on public.consent_events;
create trigger consent_events_server_time before insert on public.consent_events
  for each row execute function public.consent_events_server_time();

alter table public.consent_events enable row level security;

drop policy if exists "consent_events: read own"   on public.consent_events;
drop policy if exists "consent_events: insert own" on public.consent_events;

create policy "consent_events: read own"   on public.consent_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "consent_events: insert own" on public.consent_events for insert to authenticated with check ((select auth.uid()) = user_id);
-- No update or delete policies on purpose: the log is append-only for users.
