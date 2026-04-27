begin;

alter table public.players
  drop constraint if exists players_type_position_check;

alter table public.players
  add constraint players_type_position_check check (
    (player_type = 'fixed' and position = 'line')
    or (player_type = 'goalkeeper' and position = 'goalkeeper')
    or (player_type = 'guest' and position in ('line', 'goalkeeper'))
  );

update public.players
set fee_exempt = true
where player_type = 'guest'
  and position = 'goalkeeper'
  and fee_exempt = false;

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

commit;
