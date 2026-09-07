import type { Env } from "../lib/env";
import { err, json } from "../lib/http";

/** POST /api/metrics/ingest — enqueue a metrics job (Queue producer) */
export async function ingestMetric(req: Request, env: Env): Promise<Response> {
  let body: { product?: string; event?: string; value?: number };
  try {
    body = (await req.json()) as { product?: string; event?: string; value?: number };
  } catch {
    return err("invalid_json", 400);
  }

  const product = String(body.product ?? "").trim();
  const event = String(body.event ?? "").trim();
  const value = Number(body.value ?? 1);
  if (!product || !event || !Number.isFinite(value)) {
    return err("validation", 400, "product, event, value required");
  }

  const payload = {
    type: "metric" as const,
    product,
    event,
    value,
    at: new Date().toISOString(),
  };

  try {
    await env.JOBS.send(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "queue_error";
    return err("queue_unavailable", 503, msg);
  }

  return json({ ok: true, queued: true }, 202);
}
