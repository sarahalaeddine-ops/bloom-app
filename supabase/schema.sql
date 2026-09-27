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

alter table public.user_state enable row level security;

drop policy if exists "user_state: read own"   on public.user_state;
drop policy if exists "user_state: insert own" on public.user_state;
drop policy if exists "user_state: update own" on public.user_state;
drop policy if exists "user_state: delete own" on public.user_state;

create policy "user_state: read own"   on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_state: insert own" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_state: update own" on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_state: delete own" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);
