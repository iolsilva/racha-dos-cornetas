begin;

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'player');
create type public.player_type as enum ('fixed', 'guest', 'goalkeeper');
create type public.position_type as enum ('line', 'goalkeeper');
create type public.match_status as enum ('scheduled', 'completed', 'cancelled');
create type public.team_color as enum ('blue', 'red');
create type public.attendance_status as enum ('confirmed', 'waitlist', 'declined');
create type public.payment_type as enum ('monthly_fee', 'guest_fee', 'adjustment');
create type public.expense_category as enum (
  'field_rent',
  'barbecue',
  'equipment',
  'awards',
  'other'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role public.app_role not null default 'player',
  phone text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(user_id) on delete set null,
  full_name text not null,
  nickname text not null,
  player_type public.player_type not null default 'fixed',
  position public.position_type not null default 'line',
  phone text,
  active boolean not null default true,
  fee_exempt boolean not null default false,
  joined_at date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint players_type_position_check check (
    (player_type = 'fixed' and position = 'line')
    or (player_type = 'goalkeeper' and position = 'goalkeeper')
    or (player_type = 'guest' and position in ('line', 'goalkeeper'))
  )
);

create unique index players_nickname_unique_idx on public.players (lower(nickname));
create index players_profile_id_idx on public.players (profile_id);
create index players_active_idx on public.players (active);
create index players_type_active_idx on public.players (player_type, active);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  match_date date not null unique,
  starts_at timestamptz,
  location text not null,
  status public.match_status not null default 'scheduled',
  notes text,
  counts_for_ranking boolean not null default true,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  blue_score integer,
  red_score integer,
  constraint matches_score_check check (
    (blue_score is null and red_score is null)
    or (blue_score >= 0 and red_score >= 0)
  )
);

create index matches_match_date_idx on public.matches (match_date desc);

create table public.match_teams (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_color public.team_color not null,
  label text not null,
  score integer not null default 0,
  is_winner boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (match_id, team_color)
);

create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  match_team_id uuid not null references public.match_teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  is_goalkeeper boolean not null default false,
  is_reserve boolean not null default false,
  lineup_order smallint,
  created_at timestamptz not null default timezone('utc', now()),
  unique (match_id, player_id)
);

create index match_players_match_idx on public.match_players (match_id);
create index match_players_team_idx on public.match_players (match_team_id);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status public.attendance_status not null default 'confirmed',
  confirmed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (match_id, player_id)
);

create index attendance_match_idx on public.attendance (match_id);
create index attendance_player_idx on public.attendance (player_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  match_id uuid references public.matches(id) on delete set null,
  reference_month date not null,
  payment_type public.payment_type not null,
  amount numeric(10,2) not null check (amount >= 0),
  paid_at date not null,
  recorded_by uuid references public.profiles(user_id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index payments_player_idx on public.payments (player_id);
create index payments_reference_month_idx on public.payments (reference_month desc);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  reference_month date not null,
  amount numeric(10,2) not null check (amount > 0),
  category public.expense_category not null,
  expense_date date not null,
  description text not null,
  reserve_for_awards boolean not null default false,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index expenses_reference_month_idx on public.expenses (reference_month desc);

create table public.rankings (
  season_year integer not null,
  player_id uuid not null references public.players(id) on delete cascade,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  matches_played integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (season_year, player_id)
);

create table public.ranking_baselines (
  season_year integer not null,
  player_id uuid not null references public.players(id) on delete cascade,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  matches_played integer not null default 0,
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (season_year, player_id)
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_players_updated_at
before update on public.players
for each row
execute function public.set_updated_at();

create trigger set_ranking_baselines_updated_at
before update on public.ranking_baselines
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'player')
  )
  on conflict (user_id) do update
  set full_name = excluded.full_name,
      email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.current_player_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from public.players
  where profile_id = auth.uid()
  limit 1;
$$;

create or replace function public.player_belongs_to_me(target_player_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.players
    where id = target_player_id
      and profile_id = auth.uid()
  );
$$;

create or replace function public.current_month_fee(target_date date default current_date)
returns numeric
language sql
immutable
as $$
  select case
    when extract(day from target_date) <= 15 then 50
    when extract(day from target_date) between 16 and 20 then 60
    else 70
  end::numeric;
$$;

create or replace function public.ensure_default_match_teams()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.match_teams (match_id, team_color, label)
  values
    (new.id, 'blue', 'Azul'),
    (new.id, 'red', 'Vermelho')
  on conflict (match_id, team_color) do nothing;

  return new;
end;
$$;

create trigger create_match_teams_after_match
after insert on public.matches
for each row
execute function public.ensure_default_match_teams();

create or replace function public.stamp_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'matches' and new.created_by is null then
    new.created_by = auth.uid();
  elsif tg_table_name = 'expenses' and new.created_by is null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.stamp_recorded_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.recorded_by is null then
    new.recorded_by = auth.uid();
  end if;
  return new;
end;
$$;

create trigger stamp_match_created_by
before insert on public.matches
for each row
execute function public.stamp_created_by();

create trigger stamp_payment_recorded_by
before insert on public.payments
for each row
execute function public.stamp_recorded_by();

create trigger stamp_expense_created_by
before insert on public.expenses
for each row
execute function public.stamp_created_by();

create or replace function public.assign_player_to_team(
  p_match_id uuid,
  p_player_id uuid,
  p_team_color public.team_color,
  p_is_goalkeeper boolean default false,
  p_is_reserve boolean default false,
  p_lineup_order smallint default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem montar os times.';
  end if;

  select id
    into v_team_id
  from public.match_teams
  where match_id = p_match_id
    and team_color = p_team_color;

  if v_team_id is null then
    raise exception 'Time nao encontrado para a partida.';
  end if;

  insert into public.match_players (
    match_id,
    match_team_id,
    player_id,
    is_goalkeeper,
    is_reserve,
    lineup_order
  )
  values (
    p_match_id,
    v_team_id,
    p_player_id,
    p_is_goalkeeper,
    p_is_reserve,
    p_lineup_order
  )
  on conflict (match_id, player_id) do update
  set match_team_id = excluded.match_team_id,
      is_goalkeeper = excluded.is_goalkeeper,
      is_reserve = excluded.is_reserve,
      lineup_order = excluded.lineup_order;
end;
$$;

create or replace function public.refresh_rankings(target_season integer default extract(year from current_date)::integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.rankings
  where season_year = target_season;

  insert into public.rankings (
    season_year,
    player_id,
    wins,
    draws,
    losses,
    matches_played,
    updated_at
  )
  with baseline as (
    select
      player_id,
      wins,
      draws,
      losses,
      matches_played
    from public.ranking_baselines
    where season_year = target_season
  ),
  computed as (
    select
      mp.player_id,
      count(*) filter (
        where mt.is_winner is true
      )::integer as wins,
      count(*) filter (
        where m.blue_score = m.red_score
      )::integer as draws,
      count(*) filter (
        where mt.is_winner is false
          and m.blue_score <> m.red_score
      )::integer as losses,
      count(*)::integer as matches_played
    from public.match_players mp
    join public.match_teams mt on mt.id = mp.match_team_id
    join public.matches m on m.id = mp.match_id
    join public.players p on p.id = mp.player_id
    where m.status = 'completed'
      and coalesce(m.counts_for_ranking, true) is true
      and p.player_type <> 'guest'
      and extract(year from m.match_date)::integer = target_season
    group by mp.player_id
  )
  select
    target_season as season_year,
    coalesce(baseline.player_id, computed.player_id) as player_id,
    coalesce(baseline.wins, 0) + coalesce(computed.wins, 0) as wins,
    coalesce(baseline.draws, 0) + coalesce(computed.draws, 0) as draws,
    coalesce(baseline.losses, 0) + coalesce(computed.losses, 0) as losses,
    coalesce(baseline.matches_played, 0) + coalesce(computed.matches_played, 0) as matches_played,
    timezone('utc', now())
  from baseline
  full join computed on computed.player_id = baseline.player_id;
end;
$$;

create or replace function public.finalize_match_result(
  p_match_id uuid,
  p_blue_score integer,
  p_red_score integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match_date date;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem registrar resultados.';
  end if;

  update public.matches
  set status = 'completed',
      blue_score = p_blue_score,
      red_score = p_red_score,
      completed_at = timezone('utc', now())
  where id = p_match_id
  returning match_date into v_match_date;

  update public.match_teams
  set score = case
      when team_color = 'blue' then p_blue_score
      when team_color = 'red' then p_red_score
      else score
    end,
    is_winner = case
      when p_blue_score = p_red_score then false
      when team_color = 'blue' and p_blue_score > p_red_score then true
      when team_color = 'red' and p_red_score > p_blue_score then true
      else false
    end
  where match_id = p_match_id;

  perform public.refresh_rankings(extract(year from v_match_date)::integer);
end;
$$;

create or replace function public.admin_update_match_bundle(
  p_match_id uuid,
  p_match_date date,
  p_starts_at timestamptz default null,
  p_location text default null,
  p_notes text default null,
  p_status public.match_status default 'scheduled',
  p_counts_for_ranking boolean default true,
  p_blue_score integer default null,
  p_red_score integer default null,
  p_assignments jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_match_date date;
  v_old_season integer;
  v_new_season integer;
  v_assignment_count integer;
  v_unique_players integer;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem editar partidas.';
  end if;

  select match_date
    into v_old_match_date
  from public.matches
  where id = p_match_id
  for update;

  if v_old_match_date is null then
    raise exception 'Partida nao encontrada.';
  end if;

  if p_status = 'completed' and (p_blue_score is null or p_red_score is null) then
    raise exception 'Informe o placar completo para concluir a partida.';
  end if;

  select
    count(*),
    count(distinct (entry ->> 'player_id'))
  into v_assignment_count, v_unique_players
  from jsonb_array_elements(coalesce(p_assignments, '[]'::jsonb)) entry;

  if v_assignment_count <> v_unique_players then
    raise exception 'Um jogador nao pode aparecer duas vezes na mesma partida.';
  end if;

  update public.matches
  set match_date = p_match_date,
      starts_at = p_starts_at,
      location = coalesce(nullif(trim(p_location), ''), location),
      notes = nullif(trim(coalesce(p_notes, '')), ''),
      status = p_status,
      counts_for_ranking = coalesce(p_counts_for_ranking, true),
      blue_score = case
        when p_status = 'completed' then p_blue_score
        else null
      end,
      red_score = case
        when p_status = 'completed' then p_red_score
        else null
      end,
      completed_at = case
        when p_status = 'completed' then coalesce(completed_at, timezone('utc', now()))
        else null
      end
  where id = p_match_id;

  insert into public.match_teams (match_id, team_color, label)
  values
    (p_match_id, 'blue', 'Azul'),
    (p_match_id, 'red', 'Vermelho')
  on conflict (match_id, team_color) do nothing;

  delete from public.match_players
  where match_id = p_match_id;

  insert into public.match_players (
    match_id,
    match_team_id,
    player_id,
    is_goalkeeper,
    is_reserve,
    lineup_order
  )
  select
    p_match_id,
    mt.id,
    (entry ->> 'player_id')::uuid,
    coalesce((entry ->> 'is_goalkeeper')::boolean, false),
    coalesce((entry ->> 'is_reserve')::boolean, false),
    nullif(entry ->> 'lineup_order', '')::smallint
  from jsonb_array_elements(coalesce(p_assignments, '[]'::jsonb)) entry
  join public.match_teams mt
    on mt.match_id = p_match_id
   and mt.team_color = coalesce(
     nullif(entry ->> 'team_color', '')::public.team_color,
     'blue'::public.team_color
   );

  delete from public.attendance
  where match_id = p_match_id
    and player_id not in (
      select (entry ->> 'player_id')::uuid
      from jsonb_array_elements(coalesce(p_assignments, '[]'::jsonb)) entry
    );

  insert into public.attendance (
    match_id,
    player_id,
    status,
    confirmed_at
  )
  select
    p_match_id,
    (entry ->> 'player_id')::uuid,
    'confirmed'::public.attendance_status,
    timezone('utc', now())
  from jsonb_array_elements(coalesce(p_assignments, '[]'::jsonb)) entry
  on conflict (match_id, player_id) do update
  set status = excluded.status,
      confirmed_at = excluded.confirmed_at;

  update public.match_teams
  set score = case
      when p_status = 'completed' and team_color = 'blue' then p_blue_score
      when p_status = 'completed' and team_color = 'red' then p_red_score
      else 0
    end,
    is_winner = case
      when p_status <> 'completed' then false
      when p_blue_score = p_red_score then false
      when team_color = 'blue' and p_blue_score > p_red_score then true
      when team_color = 'red' and p_red_score > p_blue_score then true
      else false
    end
  where match_id = p_match_id;

  v_old_season := extract(year from v_old_match_date)::integer;
  v_new_season := extract(year from p_match_date)::integer;

  perform public.refresh_rankings(v_old_season);

  if v_new_season <> v_old_season then
    perform public.refresh_rankings(v_new_season);
  end if;
end;
$$;

create or replace function public.get_financial_summary(p_reference_month date default null)
returns table (
  reference_month date,
  total_payments numeric,
  total_expenses numeric,
  prize_reserve numeric,
  balance numeric
)
language sql
security definer
set search_path = public
stable
as $$
  with months as (
    select distinct reference_month from public.payments
    union
    select distinct reference_month from public.expenses
  ),
  base as (
    select
      months.reference_month,
      coalesce((
        select sum(amount)
        from public.payments p
        where p.reference_month = months.reference_month
      ), 0)::numeric as total_payments,
      coalesce((
        select sum(amount)
        from public.expenses e
        where e.reference_month = months.reference_month
          and e.reserve_for_awards is false
      ), 0)::numeric as total_expenses,
      coalesce((
        select sum(amount)
        from public.expenses e
        where e.reference_month = months.reference_month
          and e.reserve_for_awards is true
      ), 0)::numeric as prize_reserve
    from months
  )
  select
    reference_month,
    total_payments,
    total_expenses,
    prize_reserve,
    (total_payments - total_expenses - prize_reserve)::numeric as balance
  from base
  where p_reference_month is null
     or reference_month = p_reference_month
  order by reference_month desc;
$$;

create or replace function public.get_player_home_snapshot()
returns table (
  player_id uuid,
  nickname text,
  wins integer,
  draws integer,
  losses integer,
  matches_played integer,
  pending_amount numeric,
  confirmed_next_match boolean
)
language sql
security definer
set search_path = public
stable
as $$
  with me as (
    select p.id, p.nickname, p.player_type, p.fee_exempt
    from public.players p
    where p.profile_id = auth.uid()
    limit 1
  ),
  current_ranking as (
    select r.player_id, r.wins, r.draws, r.losses, r.matches_played
    from public.rankings r
    where r.season_year = extract(year from current_date)::integer
  ),
  next_match as (
    select id
    from public.matches
    where status = 'scheduled'
      and match_date >= current_date
    order by match_date asc
    limit 1
  )
  select
    me.id as player_id,
    me.nickname,
    coalesce(cr.wins, 0),
    coalesce(cr.draws, 0),
    coalesce(cr.losses, 0),
    coalesce(cr.matches_played, 0),
    case
      when me.player_type <> 'fixed' or me.fee_exempt then 0
      when exists (
        select 1
        from public.payments py
        where py.player_id = me.id
          and py.payment_type = 'monthly_fee'
          and py.reference_month = date_trunc('month', current_date)::date
      ) then 0
      else public.current_month_fee(current_date)
    end::numeric as pending_amount,
    exists (
      select 1
      from public.attendance a
      join next_match nm on nm.id = a.match_id
      where a.player_id = me.id
        and a.status = 'confirmed'
    ) as confirmed_next_match
  from me
  left join current_ranking cr on cr.player_id = me.id;
$$;

create or replace view public.player_rankings_current_year as
select
  r.season_year,
  r.player_id,
  p.full_name,
  p.nickname,
  p.position,
  r.wins,
  r.draws,
  r.losses,
  r.matches_played,
  p.active
from public.rankings r
join public.players p on p.id = r.player_id
where r.season_year = extract(year from current_date)::integer;

create or replace view public.attendance_overview as
select
  m.id as match_id,
  m.match_date,
  count(*) filter (
    where a.status = 'confirmed'
      and p.player_type <> 'guest'
  )::integer as confirmed_players,
  count(*) filter (
    where a.status = 'confirmed'
      and p.player_type = 'guest'
  )::integer as guests_confirmed,
  greatest(
    count(*) filter (where a.status = 'confirmed')::integer - 14,
    0
  ) as reserve_spots
from public.matches m
left join public.attendance a on a.match_id = m.id
left join public.players p on p.id = a.player_id
group by m.id, m.match_date;

create or replace view public.match_team_assignments as
select
  mp.id,
  mp.match_id,
  mp.player_id,
  m.match_date,
  mt.team_color,
  p.full_name,
  p.nickname,
  mp.is_goalkeeper,
  mp.is_reserve,
  mp.lineup_order
from public.match_players mp
join public.match_teams mt on mt.id = mp.match_team_id
join public.matches m on m.id = mp.match_id
join public.players p on p.id = mp.player_id;

create or replace view public.player_pairing_stats as
select
  least(a.player_id, b.player_id) as player_a_id,
  greatest(a.player_id, b.player_id) as player_b_id,
  pa.nickname as player_a_nickname,
  pb.nickname as player_b_nickname,
  count(*)::integer as matches_together
from public.match_players a
join public.match_players b
  on a.match_id = b.match_id
 and a.match_team_id = b.match_team_id
 and a.player_id < b.player_id
join public.players pa on pa.id = a.player_id
join public.players pb on pb.id = b.player_id
join public.matches m on m.id = a.match_id
where m.status = 'completed'
group by
  least(a.player_id, b.player_id),
  greatest(a.player_id, b.player_id),
  pa.nickname,
  pb.nickname;

create or replace view public.team_result_stats as
select
  mt.team_color,
  string_agg(p.nickname, ', ' order by p.nickname) as team_signature,
  count(*) filter (where mt.is_winner is true)::integer as wins,
  max(m.match_date) as last_match_date
from public.match_teams mt
join public.match_players mp on mp.match_team_id = mt.id
join public.players p on p.id = mp.player_id
join public.matches m on m.id = mt.match_id
where m.status = 'completed'
group by mt.id, mt.team_color;

grant usage on schema public to authenticated;
grant select on table public.player_rankings_current_year to authenticated;
grant select on table public.attendance_overview to authenticated;
grant select on table public.match_team_assignments to authenticated;
grant select on table public.player_pairing_stats to authenticated;
grant select on table public.team_result_stats to authenticated;
grant execute on function public.get_financial_summary(date) to authenticated;
grant execute on function public.get_player_home_snapshot() to authenticated;
grant execute on function public.assign_player_to_team(uuid, uuid, public.team_color, boolean, boolean, smallint) to authenticated;
grant execute on function public.finalize_match_result(uuid, integer, integer) to authenticated;
grant execute on function public.admin_update_match_bundle(uuid, date, timestamptz, text, text, public.match_status, boolean, integer, integer, jsonb) to authenticated;
grant execute on function public.refresh_rankings(integer) to authenticated;

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_teams enable row level security;
alter table public.match_players enable row level security;
alter table public.attendance enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.rankings enable row level security;
alter table public.ranking_baselines enable row level security;

create policy "profiles select own or admin"
on public.profiles
for select
to authenticated
using ((select public.is_admin()) or user_id = auth.uid());

create policy "profiles update own or admin"
on public.profiles
for update
to authenticated
using ((select public.is_admin()) or user_id = auth.uid())
with check ((select public.is_admin()) or user_id = auth.uid());

create policy "players select authenticated"
on public.players
for select
to authenticated
using (true);

create policy "players insert admin"
on public.players
for insert
to authenticated
with check ((select public.is_admin()));

create policy "players update admin"
on public.players
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "matches select authenticated"
on public.matches
for select
to authenticated
using (true);

create policy "matches write admin"
on public.matches
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "match teams select authenticated"
on public.match_teams
for select
to authenticated
using (true);

create policy "match teams write admin"
on public.match_teams
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "match players select authenticated"
on public.match_players
for select
to authenticated
using (true);

create policy "match players write admin"
on public.match_players
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "attendance select authenticated"
on public.attendance
for select
to authenticated
using (true);

create policy "attendance insert own or admin"
on public.attendance
for insert
to authenticated
with check (
  (select public.is_admin())
  or (select public.player_belongs_to_me(player_id))
);

create policy "attendance update own or admin"
on public.attendance
for update
to authenticated
using (
  (select public.is_admin())
  or (select public.player_belongs_to_me(player_id))
)
with check (
  (select public.is_admin())
  or (select public.player_belongs_to_me(player_id))
);

create policy "attendance delete own or admin"
on public.attendance
for delete
to authenticated
using (
  (select public.is_admin())
  or (select public.player_belongs_to_me(player_id))
);

create policy "payments select own or admin"
on public.payments
for select
to authenticated
using (
  (select public.is_admin())
  or (select public.player_belongs_to_me(player_id))
);

create policy "payments write admin"
on public.payments
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "expenses select admin"
on public.expenses
for select
to authenticated
using ((select public.is_admin()));

create policy "expenses write admin"
on public.expenses
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "rankings select authenticated"
on public.rankings
for select
to authenticated
using (true);

create policy "rankings write admin"
on public.rankings
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "ranking baselines select admin"
on public.ranking_baselines
for select
to authenticated
using ((select public.is_admin()));

create policy "ranking baselines write admin"
on public.ranking_baselines
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

commit;
