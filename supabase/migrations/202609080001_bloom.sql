-- Apply to an isolated Supabase project first. No demo users or patient data.
begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);
create function public.create_bloom_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,name) values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'name'),''),'Bloom user'),100));
  return new;
end;
$$;
create trigger bloom_profile_after_signup after insert on auth.users for each row execute function public.create_bloom_profile();
-- Existing Auth users also receive an empty profile, never fabricated treatment data.
insert into public.profiles(id,name) select id,left(coalesce(nullif(trim(raw_user_meta_data->>'name'),''),'Bloom user'),100) from auth.users on conflict do nothing;

create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 100),
  clinic text not null check (length(trim(clinic)) between 1 and 200),
  protocol text not null check (length(trim(protocol)) between 1 and 200),
  phase text not null check (phase in ('planning','stimulation','retrieval','transfer','tww','completed')),
  start_date date not null,
  created_at timestamptz not null default now(),
  unique(id,user_id)
);
create table public.doses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 200),
  dose text not null check (length(trim(dose)) between 1 and 200),
  instructions text not null check (length(trim(instructions)) between 1 and 2000),
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','taken','missed')),
  taken_at timestamptz,
  site text not null default '' check (length(site) <= 500),
  note text not null default '' check (length(note) <= 2000),
  created_at timestamptz not null default now(),
  foreign key(cycle_id,user_id) references public.cycles(id,user_id),
  check ((status = 'taken' and taken_at is not null) or (status <> 'taken' and taken_at is null)),
  unique(cycle_id,name,scheduled_at)
);
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 200),
  location text not null check (length(trim(location)) between 1 and 500),
  scheduled_at timestamptz not null,
  instructions text not null default '' check (length(instructions) <= 2000),
  created_at timestamptz not null default now(),
  foreign key(cycle_id,user_id) references public.cycles(id,user_id)
);
create table public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid not null,
  test text not null check (length(trim(test)) between 1 and 100),
  value numeric not null check (value >= 0 and value <> 'NaN'::numeric and value <> 'Infinity'::numeric),
  unit text not null check (length(trim(unit)) between 1 and 80),
  measured_on date not null,
  note text not null default '' check (length(note) <= 2000),
  created_at timestamptz not null default now(),
  foreign key(cycle_id,user_id) references public.cycles(id,user_id)
);
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid not null,
  recorded_on date not null,
  mood integer not null check (mood between 0 and 4),
  anxiety integer not null check (anxiety between 1 and 5),
  hope integer not null check (hope between 1 and 5),
  symptoms text[] not null default '{}' check (cardinality(symptoms) <= 30),
  weight numeric check (weight > 0 and weight <> 'NaN'::numeric and weight <> 'Infinity'::numeric),
  note text not null default '' check (length(note) <= 10000),
  created_at timestamptz not null default now(),
  foreign key(cycle_id,user_id) references public.cycles(id,user_id)
);
create table public.journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid not null,
  note text not null check (length(trim(note)) between 1 and 10000),
  created_at timestamptz not null default now(),
  foreign key(cycle_id,user_id) references public.cycles(id,user_id)
);

-- RLS is the access boundary, not the UI or a user-supplied role.
-- No client admin roles, partner permissions, or public patient-data policies.
alter table public.profiles enable row level security;
create policy profile_read on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profile_update on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update(name) on public.profiles to authenticated;
revoke all on function public.create_bloom_profile() from public, anon, authenticated;
do $$
declare t text;
begin
  foreach t in array array['cycles','doses','appointments','results','checkins','journal'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
    if t <> 'cycles' then execute format('grant delete on public.%I to authenticated', t); end if;
    execute format('create policy owner_read on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    if t <> 'cycles' then execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t); end if;
    execute format('create index on public.%I(user_id)', t);
  end loop;
end $$;
commit;
