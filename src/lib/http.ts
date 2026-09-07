import type { Json } from "./env";

export function json(data: Json, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

export function err(code: string, status: number, detail?: string): Response {
  return json({ ok: false, error: code, ...(detail ? { detail } : {}) }, status);
}
