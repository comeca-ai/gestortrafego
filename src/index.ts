import type { Env } from "./lib/env";
import { err } from "./lib/http";
import { health } from "./routes/health";
import { createCampaign, listCampaigns } from "./routes/campaigns";
import { ingestMetric } from "./routes/metrics";

export type { Env };

async function route(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;
  const method = req.method.toUpperCase();

  if (method === "GET" && (pathname === "/" || pathname === "/health")) {
    return health(req, env);
  }
  if (method === "GET" && pathname === "/api/campaigns") {
    return listCampaigns(req, env);
  }
  if (method === "POST" && pathname === "/api/campaigns") {
    return createCampaign(req, env);
  }
  if (method === "POST" && pathname === "/api/metrics/ingest") {
    return ingestMetric(req, env);
  }

  return err("not_found", 404);
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await route(req, env, ctx);
    } catch (e) {
      const detail = e instanceof Error ? e.message : "internal";
      return err("internal", 500, detail);
    }
  },

  /** Queue consumer — aggregate / fan-out jobs */
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      try {
        const body = msg.body as { type?: string; product?: string; event?: string; value?: number; at?: string };
        if (body?.type === "metric" && body.product && body.event) {
          await env.DB.prepare(
            `INSERT INTO metric_events (id, product, event, value, at)
             VALUES (?, ?, ?, ?, ?)`,
          )
            .bind(crypto.randomUUID(), body.product, body.event, body.value ?? 1, body.at ?? new Date().toISOString())
            .run();
        }
        msg.ack();
      } catch {
        msg.retry();
      }
    }
  },
};
