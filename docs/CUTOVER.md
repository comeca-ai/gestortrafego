# Cutover — produção

**Regra:** merge no GitHub ≠ deploy no Cloudflare. Os dois precisam de ok explícito.

1. Review do PR `scaffold/v2` → `main`
2. Codespace: `pnpm i && pnpm test && pnpm lint && pnpm dev`
3. CI verde (Actions)
4. Criar recursos CF e preencher IDs no `wrangler.jsonc` (commit separado ou secrets via dashboard)
5. `pnpm db:migrate` remote
6. Ok do Jhonata → merge
7. Ok do Jhonata → `pnpm deploy` (ou Action de deploy gated)
8. Smoke: `/health`, POST métrica, GET campanhas

Rollback: `wrangler rollback` / redeploy do commit anterior.
