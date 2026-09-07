import type { Env } from "../lib/env";
import { json } from "../lib/http";

export async function health(_req: Request, env: Env): Promise<Response> {
  let db = "unknown";
  try {
    await env.DB.prepare("SELECT 1").first();
    db = "ok";
  } catch {
    db = "error";
  }

  return json({
    ok: true,
    service: "gestortrafego",
    ts: new Date().toISOString(),
    checks: { db },
  });
}
