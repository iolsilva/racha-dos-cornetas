begin;

update public.players
set
  full_name = 'Fabio Maia',
  nickname = 'Fabio',
  player_type = 'fixed',
  position = 'line',
  fee_exempt = false,
  active = true
where profile_id = (
  select user_id from public.profiles where email = 'fabio@maia.com.br'
);

update public.players
set
  full_name = 'Iago Oliveira',
  nickname = 'Iago',
  player_type = 'fixed',
  position = 'line',
  fee_exempt = false,
  active = true
where profile_id = (
  select user_id from public.profiles where email = 'iago.oliveira1205@gmail.com'
);

update public.players
set
  full_name = 'Leonardo Augusto',
  nickname = 'Leonardo',
  player_type = 'fixed',
  position = 'line',
  fee_exempt = false,
  active = true
where profile_id = (
  select user_id from public.profiles where email = 'leonardo@augusto.com.br'
);

insert into public.players (
  profile_id,
  full_name,
  nickname,
  player_type,
  position,
  active,
  fee_exempt
)
select
  source.profile_id,
  source.full_name,
  source.nickname,
  source.player_type::public.player_type,
  source.position::public.position_type,
  true,
  source.fee_exempt
from (
  values
    ((select user_id from public.profiles where email = 'fabio@maia.com.br'), 'Fabio Maia', 'Fabio', 'fixed', 'line', false),
    ((select user_id from public.profiles where email = 'iago.oliveira1205@gmail.com'), 'Iago Oliveira', 'Iago', 'fixed', 'line', false),
    ((select user_id from public.profiles where email = 'leonardo@augusto.com.br'), 'Leonardo Augusto', 'Leonardo', 'fixed', 'line', false),
    (null::uuid, 'Bruno', 'Bruno', 'fixed', 'line', false),
    (null::uuid, 'Dodo', 'Dodo', 'fixed', 'line', false),
    (null::uuid, 'Felipe', 'Felipe', 'fixed', 'line', false),
    (null::uuid, 'Filipe', 'Filipe', 'fixed', 'line', false),
    (null::uuid, 'GGzin', 'GGzin', 'fixed', 'line', false),
    (null::uuid, 'Henrique', 'Henrique', 'fixed', 'line', false),
    (null::uuid, 'Joao Fernando', 'Joao Fernando', 'fixed', 'line', false),
    (null::uuid, 'Joao Melo', 'Joao Melo', 'fixed', 'line', false),
    (null::uuid, 'Joao Victor', 'Joao Victor', 'fixed', 'line', false),
    (null::uuid, 'Mike', 'Mike', 'fixed', 'line', false),
    (null::uuid, 'Oscar', 'Oscar', 'fixed', 'line', false),
    (null::uuid, 'Paulo', 'Paulo', 'fixed', 'line', false),
    (null::uuid, 'Vini', 'Vini', 'fixed', 'line', false),
    (null::uuid, 'Wesley Alves', 'Wesley Alves', 'fixed', 'line', false),
    (null::uuid, 'Wesley Floreal', 'Wesley Floreal', 'fixed', 'line', false),
    (null::uuid, 'Ale', 'Ale', 'goalkeeper', 'goalkeeper', true),
    (null::uuid, 'Michael', 'Michael', 'goalkeeper', 'goalkeeper', true),
    (null::uuid, 'Angel Diarista', 'Angel D', 'guest', 'line', false),
    (null::uuid, 'Ely Diarista', 'Ely D', 'guest', 'line', false),
    (null::uuid, 'Hugo Diarista', 'Hugo D', 'guest', 'line', false),
    (null::uuid, 'Bruno Diarista', 'Bruno D', 'guest', 'line', false),
    (null::uuid, 'Thiago Diarista', 'Thiago D', 'guest', 'line', false),
    (null::uuid, 'Higor Diarista', 'Higor D', 'guest', 'line', false)
) as source(profile_id, full_name, nickname, player_type, position, fee_exempt)
left join public.players existing
  on lower(existing.nickname) = lower(source.nickname)
where existing.id is null;

commit;
