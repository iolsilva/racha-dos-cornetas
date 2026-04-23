# Deploy na Vercel

## 1. Criar projeto no Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Rode o arquivo [`supabase/schema.sql`](../supabase/schema.sql).
4. No painel de Auth, crie os usuarios iniciais.
5. Ajuste `raw_user_meta_data.role` para `admin` nos dois administradores.

## 2. Configurar variaveis

Na Vercel e localmente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3. Subir projeto

```bash
npm install
npm run build
```

## 4. Conectar na Vercel

1. Suba o repositorio para GitHub.
2. Importe o projeto na Vercel.
3. Framework preset: `Next.js`.
4. Configure as variaveis de ambiente.
5. Faça o deploy.

## 5. Pos deploy

- validar login admin e jogador
- validar leitura do ranking
- validar criacao de partida
- validar pagamento e despesa
- validar resultado e recalculo do ranking
