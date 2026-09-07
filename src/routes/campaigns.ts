import type { Env } from "../lib/env";
import { err, json } from "../lib/http";

export type Campaign = {
  id: string;
  slug: string;
  product: string;
  status: "draft" | "live" | "paused";
  created_at: string;
};

/** GET /api/campaigns — list (stub; empty until D1 migrated) */
export async function listCampaigns(_req: Request, env: Env): Promise<Response> {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, slug, product, status, created_at FROM campaigns ORDER BY created_at DESC LIMIT 100`,
    ).all<Campaign>();
    return json({ ok: true, campaigns: results ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "d1_error";
    return err("d1_unavailable", 503, msg);
  }
}

/** POST /api/campaigns — create stub (requires ADMIN_TOKEN if set) */
export async function createCampaign(req: Request, env: Env): Promise<Response> {
  if (env.ADMIN_TOKEN) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
      return err("unauthorized", 401);
    }
  }

  let body: { slug?: string; product?: string };
  try {
    body = (await req.json()) as { slug?: string; product?: string };
  } catch {
    return err("invalid_json", 400);
  }

  const slug = String(body.slug ?? "").trim().toLowerCase();
  const product = String(body.product ?? "").trim();
  if (!/^[a-z0-9-]{2,64}$/.test(slug) || product.length < 2) {
    return err("validation", 400, "slug (a-z0-9-) and product required");
  }

  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(
      `INSERT INTO campaigns (id, slug, product, status) VALUES (?, ?, ?, 'draft')`,
    )
      .bind(id, slug, product)
      .run();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "d1_error";
    return err("d1_write_failed", 503, msg);
  }

  return json({ ok: true, id, slug, product, status: "draft" }, 201);
}
