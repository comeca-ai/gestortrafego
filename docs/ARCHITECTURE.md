# Architecture — gestortrafego

## Por que Workers-first

O gestor é **máquina de orquestração na edge**: rotas leves, baixo cold start, perto do usuário e dos produtos públicos. Workers é o compute default.

## O que entra no v0

| Peça | Uso |
|------|-----|
| **Workers** | API + lógica do gestor |
| **D1** | Campanhas + eventos de métrica (SQLite na CF) |
| **KV** | Feature flags / cache de config (`FLAGS`) |
| **Queues** | Ingest assíncrono de métricas (`JOBS`) |

## O que fica de fora (de propósito)

- **Pages** — sem dashboard ainda; evita monólito front+API no dia 0.
- **R2** — sem assets/blob no path atual.
- **Durable Objects** — sem sessão/estado forte ainda; adicionar quando houver contador em tempo real / lease.

## Fluxos

```
Client → Worker (fetch)
         ├─ /health → D1 SELECT 1
         ├─ /api/campaigns → D1
         └─ /api/metrics/ingest → Queue → Worker.queue → D1 metric_events
```

## Extensão

Próximos cortes naturais: agregações por produto, fan-out pra canais (só Cloudflare: Workers + Queues), Pages dashboard minimal se o professor pedir UI.
