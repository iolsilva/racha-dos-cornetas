# Arquitetura

## Resumo do sistema

O app centraliza a operacao do racha semanal de segunda-feira, substituindo WhatsApp e Excel por um painel unico com controle financeiro, jogos, confirmacoes, times e ranking anual.

## Modulos

- `auth`: login por `Supabase Auth` com perfil `admin` ou `player`
- `financeiro`: pagamentos, despesas, saldo, reserva e extrato consolidado
- `jogadores`: cadastro de fixos, goleiros e diaristas
- `partidas`: agenda, presenca, escalacao, placar e historico
- `ranking`: tabela anual, top 3, melhor goleiro e estatisticas avancadas

## Estrutura de pastas

```text
src/
|-- app/
|   |-- login/
|   `-- (protected)/
|       |-- dashboard/
|       |-- financeiro/
|       |-- jogos/
|       |-- ranking/
|       |-- perfil/
|       `-- admin/
|           |-- jogadores/
|           |-- financeiro/
|           `-- partidas/
|-- components/
|   |-- forms/
|   |-- layout/
|   `-- ui/
|-- lib/
|   |-- data/
|   |-- supabase/
|   `-- types/
`-- server/
    `-- actions/
```

## Telas principais

- `/`: landing premium com CTA
- `/login`: autenticacao
- `/dashboard`: visao geral do jogador
- `/financeiro`: extrato consolidado e pagamentos do usuario
- `/jogos`: agenda, historico e times salvos
- `/ranking`: ranking anual e estatisticas
- `/perfil`: vinculo do usuario com o jogador
- `/admin`: overview operacional
- `/admin/jogadores`: CRUD base
- `/admin/financeiro`: pagamentos e despesas
- `/admin/partidas`: partidas, escalacao e resultado

## Componentes principais

- `src/components/layout/app-shell.tsx`: shell responsivo estilo app
- `src/components/layout/mobile-nav.tsx`: navegacao mobile
- `src/components/ui/*`: botoes, cards, inputs, tabela e estados vazios
- `src/components/forms/*`: formularios com server actions, loading e toast

## Fluxo funcional

1. Admin cria a partida da semana.
2. Jogadores confirmam presenca ate 16h.
3. Admin acompanha confirmados e diaristas.
4. Admin monta os times azul e vermelho.
5. Admin fecha o placar.
6. O sistema recalcula ranking anual.
7. Financeiro consolida recebimentos, despesas, reserva e saldo.

## Regras de negocio aplicadas

- mensalidade dinamica: `50 / 60 / 70`
- goleiros podem ser marcados como isentos
- diarista paga por jogo
- prioridade para quem confirma ate o horario definido pela operacao
- ranking com desempate por `vitorias > empates > jogos`

## Banco de dados

Tabelas principais:

- `profiles`
- `players`
- `matches`
- `match_teams`
- `match_players`
- `attendance`
- `payments`
- `expenses`
- `rankings`

Views e funcoes principais:

- `player_rankings_current_year`
- `attendance_overview`
- `match_team_assignments`
- `player_pairing_stats`
- `team_result_stats`
- `get_financial_summary()`
- `get_player_home_snapshot()`
- `assign_player_to_team()`
- `finalize_match_result()`
- `refresh_rankings()`

## Seguranca

- `RLS` habilitado em todas as tabelas expostas
- admin com acesso total
- jogador com acesso apenas ao proprio perfil e pagamentos
- financeiro consolidado exposto via funcao segura, sem abrir dados sensiveis linha a linha
