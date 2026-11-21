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

-- ── Pilot measurement (2026-11-21) ─────────────────────────────────────────
-- Founder decision: measure the pilot from accounts only, with no tracking in the app.
-- 1. activity_days: one row per account per UTC day on which her synced data changed (written by a
--    trigger on user_state). Only the day, never what changed. Deleted with her account.
-- 2. usage_daily: how many times each Nora feature was used per day, in total. No user id, no content.
-- 3. bloom_pilot_stats(): weekly sign-ups, weekly active accounts, return rates and feature use,
--    for the private /pilot page. Only the service role (server) can read these; users can't.
create table if not exists public.activity_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  primary key (user_id, day)
);
alter table public.activity_days enable row level security; -- no policies: server (service role) only

create or replace function public.bloom_note_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.activity_days (user_id, day) values (new.user_id, (now() at time zone 'utc')::date)
    on conflict do nothing;
  return new;
end $$;

drop trigger if exists user_state_activity on public.user_state;
create trigger user_state_activity after insert or update on public.user_state
  for each row execute function public.bloom_note_activity();

create table if not exists public.usage_daily (
  day   date    not null,
  event text    not null check (event ~ '^[a-z_]{1,32}$'),
  count integer not null default 0,
  primary key (day, event)
);
alter table public.usage_daily enable row level security; -- no policies: server (service role) only

create or replace function public.bloom_count(event_name text)
returns void language sql security definer set search_path = '' as $$
  insert into public.usage_daily (day, event, count) values ((now() at time zone 'utc')::date, event_name, 1)
    on conflict (day, event) do update set count = public.usage_daily.count + 1;
$$;

create or replace function public.bloom_pilot_stats(weeks integer default 8)
returns jsonb language sql stable security definer set search_path = '' as $$
  with w as (
    select (date_trunc('week', now() at time zone 'utc')::date - (7 * g)) as week
    from generate_series(0, greatest(1, least(weeks, 26)) - 1) as g
  )
  select jsonb_build_object(
    'accounts', (select count(*) from auth.users),
    'weeks', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'week', w.week,
        'signups', (select count(*) from auth.users u where u.created_at >= w.week and u.created_at < w.week + 7),
        'active', (select count(distinct a.user_id) from public.activity_days a where a.day >= w.week and a.day < w.week + 7),
        'usage', (select coalesce(jsonb_object_agg(x.event, x.n), '{}'::jsonb) from (
          select d.event, sum(d.count) as n from public.usage_daily d where d.day >= w.week and d.day < w.week + 7 group by d.event
        ) x)
      ) order by w.week desc), '[]'::jsonb) from w
    ),
    'cohorts', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'week', w.week,
        'size', (select count(*) from auth.users u where u.created_at >= w.week and u.created_at < w.week + 7),
        'week1', (select count(distinct u.id) from auth.users u join public.activity_days a on a.user_id = u.id
                  where u.created_at >= w.week and u.created_at < w.week + 7 and a.day >= u.created_at::date + 7 and a.day < u.created_at::date + 14),
        'week2', (select count(distinct u.id) from auth.users u join public.activity_days a on a.user_id = u.id
                  where u.created_at >= w.week and u.created_at < w.week + 7 and a.day >= u.created_at::date + 14 and a.day < u.created_at::date + 21),
        'week4', (select count(distinct u.id) from auth.users u join public.activity_days a on a.user_id = u.id
                  where u.created_at >= w.week and u.created_at < w.week + 7 and a.day >= u.created_at::date + 28 and a.day < u.created_at::date + 35)
      ) order by w.week desc), '[]'::jsonb) from w
    )
  );
$$;

revoke all on function public.bloom_count(text) from public, anon, authenticated;
revoke all on function public.bloom_pilot_stats(integer) from public, anon, authenticated;
grant execute on function public.bloom_count(text) to service_role;
grant execute on function public.bloom_pilot_stats(integer) to service_role;

-- ── Daily AI allowance per account (security, 2026-11-21) ─────────────────────
-- Anyone can create an account with the public anon key, so the AI routes cap how often one
-- account can use each AI feature per UTC day. Counted here, not in server memory, so the cap holds
-- across all server instances. Server (service role) only; deleted with her account.
create table if not exists public.ai_quota (
  user_id uuid    not null references auth.users (id) on delete cascade,
  day     date    not null,
  kind    text    not null check (kind ~ '^[a-z_]{1,32}$'),
  count   integer not null default 0,
  primary key (user_id, day, kind)
);
alter table public.ai_quota enable row level security; -- no policies: server (service role) only

-- Adds one use and says whether it is still within the day's limit.
create or replace function public.bloom_take_quota(p_user uuid, p_kind text, p_limit integer)
returns boolean language sql security definer set search_path = '' as $$
  insert into public.ai_quota (user_id, day, kind, count) values (p_user, (now() at time zone 'utc')::date, p_kind, 1)
    on conflict (user_id, day, kind) do update set count = public.ai_quota.count + 1
    returning count <= p_limit;
$$;

revoke all on function public.bloom_take_quota(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.bloom_take_quota(uuid, text, integer) to service_role;
