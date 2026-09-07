import { describe, expect, it } from "vitest";
import { err, json } from "../src/lib/http";

describe("http helpers", () => {
  it("json sets content-type and status", async () => {
    const res = json({ ok: true }, 201);
    expect(res.status).toBe(201);
    expect(res.headers.get("content-type")).toContain("application/json");
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("err shapes error body", async () => {
    const res = err("validation", 400, "bad");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "validation",
      detail: "bad",
    });
  });
});
