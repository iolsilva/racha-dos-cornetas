begin;

insert into public.payments (
  player_id,
  reference_month,
  payment_type,
  amount,
  paid_at,
  notes
)
select
  p.id,
  date '2026-04-01',
  'monthly_fee'::public.payment_type,
  monthly.amount,
  date '2026-04-06',
  'Carga inicial abril/2026'
from (
  values
    ('Bruno', 50.00),
    ('Dodo', 50.00),
    ('Fabio', 50.00),
    ('Felipe', 50.00),
    ('Filipe', 50.00),
    ('GGzin', 50.00),
    ('Henrique', 50.00),
    ('Iago', 50.00),
    ('Joao Fernando', 50.00),
    ('Joao Melo', 50.00),
    ('Joao Victor', 50.00),
    ('Leonardo', 50.00),
    ('Mike', 50.00),
    ('Oscar', 50.00),
    ('Paulo', 50.00),
    ('Vini', 50.00),
    ('Wesley Alves', 50.00),
    ('Wesley Floreal', 50.00)
) as monthly(nickname, amount)
join public.players p
  on lower(p.nickname) = lower(monthly.nickname)
where not exists (
  select 1
  from public.payments existing
  where existing.player_id = p.id
    and existing.reference_month = date '2026-04-01'
    and existing.payment_type = 'monthly_fee'
);

insert into public.payments (
  player_id,
  reference_month,
  payment_type,
  amount,
  paid_at,
  notes
)
select
  p.id,
  date '2026-04-01',
  'guest_fee'::public.payment_type,
  15.00,
  date '2026-04-20',
  'Diarista 20/04'
from (
  values
    ('Ely D'),
    ('Angel D'),
    ('Hugo D'),
    ('Bruno D'),
    ('Thiago D'),
    ('Higor D')
) as guests(nickname)
join public.players p
  on lower(p.nickname) = lower(guests.nickname)
where not exists (
  select 1
  from public.payments existing
  where existing.player_id = p.id
    and existing.paid_at = date '2026-04-20'
    and existing.payment_type = 'guest_fee'
);

insert into public.matches (
  match_date,
  starts_at,
  location,
  status,
  notes,
  counts_for_ranking,
  blue_score,
  red_score,
  completed_at
)
select
  date '2026-04-22',
  timestamptz '2026-04-22 20:00:00+00',
  'Segunda-feira / carga inicial',
  'completed'::public.match_status,
  'Carga inicial abril/2026',
  false,
  6,
  7,
  timezone('utc', now())
where not exists (
  select 1
  from public.matches
  where match_date = date '2026-04-22'
);

with target_match as (
  select id from public.matches where match_date = date '2026-04-22'
),
attendance_rows as (
  select tm.id as match_id, p.id as player_id
  from target_match tm
  join public.players p
    on lower(p.nickname) in (
      'thiago d',
      'hugo d',
      'higor d',
      'bruno d',
      'dodo',
      'fabio',
      'michael',
      'angel d',
      'ely d',
      'iago',
      'bruno',
      'paulo',
      'filipe',
      'ale'
    )
)
insert into public.attendance (match_id, player_id, status, confirmed_at)
select match_id, player_id, 'confirmed'::public.attendance_status, timezone('utc', now())
from attendance_rows
where not exists (
  select 1
  from public.attendance existing
  where existing.match_id = attendance_rows.match_id
    and existing.player_id = attendance_rows.player_id
);

with target_match as (
  select id from public.matches where match_date = date '2026-04-22'
),
teams as (
  select mt.id, mt.team_color
  from public.match_teams mt
  join target_match tm on tm.id = mt.match_id
),
source as (
  select * from (
    values
      ('Thiago D', 'red', false, false, 1),
      ('Hugo D', 'red', false, false, 2),
      ('Higor D', 'red', false, false, 3),
      ('Bruno D', 'red', false, false, 4),
      ('Dodo', 'red', false, false, 5),
      ('Fabio', 'red', false, false, 6),
      ('Michael', 'red', true, false, 7),
      ('Angel D', 'blue', false, false, 1),
      ('Ely D', 'blue', false, false, 2),
      ('Iago', 'blue', false, false, 3),
      ('Bruno', 'blue', false, false, 4),
      ('Paulo', 'blue', false, false, 5),
      ('Filipe', 'blue', false, false, 6),
      ('Ale', 'blue', true, false, 7)
  ) as data(nickname, team_color, is_goalkeeper, is_reserve, lineup_order)
)
insert into public.match_players (
  match_id,
  match_team_id,
  player_id,
  is_goalkeeper,
  is_reserve,
  lineup_order
)
select
  tm.id,
  teams.id,
  p.id,
  source.is_goalkeeper,
  source.is_reserve,
  source.lineup_order
from source
join public.players p
  on lower(p.nickname) = lower(source.nickname)
join teams
  on teams.team_color = source.team_color::public.team_color
join target_match tm on true
where not exists (
  select 1
  from public.match_players existing
  where existing.match_id = tm.id
    and existing.player_id = p.id
);

update public.match_teams
set
  score = case when team_color = 'blue' then 6 else 7 end,
  is_winner = case when team_color = 'red' then true else false end
where match_id = (select id from public.matches where match_date = date '2026-04-22');

select public.refresh_rankings(2026);

commit;
