# Smoke Test

## Objetivo

Executar um teste de ponta a ponta automatizado contra o projeto real do Supabase usando a `service role key`.

## O que o script valida

- encontra os 3 jogadores de teste por e-mail
- cria uma partida de teste
- registra 3 presencas
- salva os times azul e vermelho
- registra 1 pagamento e 1 despesa
- fecha o placar
- recalcula o ranking
- valida os resultados finais

## Arquivo

- [scripts/smoke-test.mjs](../scripts/smoke-test.mjs)

## Execucao

```bash
node scripts/smoke-test.mjs
```

## Dados usados

- data da partida: `2026-12-28`
- local: `Arena Smoke Test`
- marcador interno: `codex-smoke-test`

## Observacao

O script remove os dados do smoke test anterior antes de recriar o fluxo, para permitir reexecucao.
