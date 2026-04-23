begin;

update public.players
set
  position = 'goalkeeper',
  fee_exempt = true
where player_type = 'goalkeeper'
  and (position <> 'goalkeeper' or fee_exempt = false);

update public.players
set position = 'line'
where player_type in ('fixed', 'guest')
  and position <> 'line';

alter table public.players
  drop constraint if exists players_type_position_check;

alter table public.players
  add constraint players_type_position_check check (
    (player_type = 'goalkeeper' and position = 'goalkeeper')
    or (player_type in ('fixed', 'guest') and position = 'line')
  );

commit;
