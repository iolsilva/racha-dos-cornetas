# Seed Real

## Arquivos

- [supabase/seed-real-players.sql](../supabase/seed-real-players.sql)
- [supabase/seed-april-2026.sql](../supabase/seed-april-2026.sql)

## O que entra

`seed-real-players.sql`

- 18 mensalistas de linha
- 2 goleiros isentos
- 6 diaristas com cadastro separado
- preserva o vinculo dos usuarios existentes para Fabio, Iago e Leonardo

`seed-april-2026.sql`

- mensalidades de abril
- diaristas de `20/04`
- partida de `22/04`
- times azul x vermelho
- placar `7 x 6` para o vermelho
- refresh do ranking 2026

## Observacao

Foi adotada uma assuncao no extrato:

- `Iago PG` entrou como mensalidade de `R$ 50,00`

## Ordem de execucao

1. rode `seed-real-players.sql`
2. rode `seed-april-2026.sql`
3. rode `apply-ranking-baseline.sql`
