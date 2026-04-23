begin;

alter table public.players
  add column if not exists active boolean not null default true;

alter table public.matches
  add column if not exists counts_for_ranking boolean not null default true;

create index if not exists players_type_active_idx
  on public.players (player_type, active);

drop policy if exists "players select authenticated" on public.players;

create policy "players select authenticated"
on public.players
for select
to authenticated
using (true);

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

grant execute on function public.admin_update_match_bundle(
  uuid,
  date,
  timestamptz,
  text,
  text,
  public.match_status,
  boolean,
  integer,
  integer,
  jsonb
) to authenticated;

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

commit;
