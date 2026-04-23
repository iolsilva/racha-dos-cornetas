begin;

create table if not exists public.ranking_baselines (
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

alter table public.matches
add column if not exists counts_for_ranking boolean not null default true;

drop trigger if exists set_ranking_baselines_updated_at on public.ranking_baselines;
create trigger set_ranking_baselines_updated_at
before update on public.ranking_baselines
for each row
execute function public.set_updated_at();

update public.matches
set counts_for_ranking = false
where notes = 'Carga inicial abril/2026';

delete from public.payments where notes = 'codex-smoke-test';
delete from public.expenses where description = 'codex-smoke-test-despesa';
delete from public.matches where notes = 'codex-smoke-test';

insert into public.ranking_baselines (
  season_year,
  player_id,
  wins,
  draws,
  losses,
  matches_played,
  source
)
select
  2026,
  p.id,
  baseline.wins,
  baseline.draws,
  baseline.losses,
  baseline.matches_played,
  'Ranking real enviado pelo organizador'
from (
  values
    ('Fabio', 7, 1, 5, 13),
    ('Wesley Floreal', 7, 1, 2, 10),
    ('Leonardo', 7, 1, 1, 9),
    ('Paulo', 6, 1, 6, 13),
    ('Oscar', 6, 0, 3, 9),
    ('Wesley Alves', 5, 1, 6, 12),
    ('Joao Victor', 5, 1, 6, 12),
    ('GGzin', 5, 1, 4, 10),
    ('Iago', 5, 1, 3, 9),
    ('Felipe', 5, 0, 1, 6),
    ('Dodo', 4, 1, 5, 10),
    ('Henrique', 4, 1, 3, 8),
    ('Joao Melo', 4, 0, 4, 8),
    ('Bruno', 3, 1, 5, 9),
    ('Vini', 3, 1, 3, 7),
    ('Mike', 2, 1, 4, 7),
    ('Joao Fernando', 2, 0, 7, 9),
    ('Filipe', 2, 0, 5, 7),
    ('Ale', 5, 1, 2, 8),
    ('Michael', 2, 0, 5, 7)
) as baseline(nickname, wins, draws, losses, matches_played)
join public.players p
  on lower(p.nickname) = lower(baseline.nickname)
on conflict (season_year, player_id) do update
set
  wins = excluded.wins,
  draws = excluded.draws,
  losses = excluded.losses,
  matches_played = excluded.matches_played,
  source = excluded.source,
  updated_at = timezone('utc', now());

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
    where m.status = 'completed'
      and coalesce(m.counts_for_ranking, true) is true
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

select public.refresh_rankings(2026);

commit;
