# gestortrafego

**Gestor de tráfego** Começa AI — orquestra atenção/rua pra produtos públicos (academy, olhodetandera, agência, …).

Stack lock: **GitHub + Cloudflare** (Workers + D1 + KV + Queues). Sem AWS/Vercel/Railway/etc.

> **PR ≠ produção.** Abrir / mergear PR não muda o live até deploy explícito com ok do Jhonata.

## O que é (v0 scaffold)

Worker TypeScript na edge:

| Rota | Método | Função |
|------|--------|--------|
| `/health` | GET | Liveness + ping D1 |
| `/api/campaigns` | GET | Lista campanhas (D1) |
| `/api/campaigns` | POST | Cria draft (opcional `ADMIN_TOKEN`) |
| `/api/metrics/ingest` | POST | Enfileira métrica (Queue → D1) |

Bindings: `DB` (D1), `FLAGS` (KV), `JOBS` (Queue producer + consumer).

Pages dashboard: **ainda não** — API-first; front entra quando o produto pedir.

## Local

```bash
pnpm install
# crie D1/KV/Queue locais via wrangler ou use --local
pnpm db:migrate:local
# IDs reais em wrangler.jsonc (REPLACE_WITH_*)
pnpm dev
curl -s localhost:8787/health
```

Secrets locais: copie `.env.example` → `.dev.vars`.

## Deploy Cloudflare

1. `wrangler d1 create gestortrafego` → cola `database_id` no `wrangler.jsonc`
2. `wrangler kv namespace create FLAGS` → cola `id`
3. `wrangler queues create gestortrafego-jobs`
4. `pnpm db:migrate` (remote)
5. `pnpm deploy` **só com ok explícito**

CI (PR): lint + test + `wrangler deploy --dry-run`.

## Cutover checklist

- [ ] PR review + Codespace smoke (`/health`, campanhas)
- [ ] CI verde
- [ ] Bindings reais (D1/KV/Queue) no account CF de produção
- [ ] Secrets (`ADMIN_TOKEN` se usar) via `wrangler secret put`
- [ ] Ok explícito do Jhonata pra merge **e** `wrangler deploy`
- [ ] Smoke pós-deploy no `*.workers.dev` / custom domain

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Cutover](docs/CUTOVER.md)

## Branch

Scaffold vive em `scaffold/v2`. `main` só tem placeholder até o merge aprovado.
