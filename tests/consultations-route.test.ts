import { beforeEach, describe, expect, it, vi } from "vitest";

const { create } = vi.hoisted(() => ({
  create: vi.fn(async (args?: { data: Record<string, unknown> }) => ({ id: "c1", ...(args?.data ?? {}) })),
}));

vi.mock("@/lib/db", () => ({ db: { consultation: { create } } }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

const { POST } = await import("@/app/api/consultations/route");

function request(body: unknown, headers: Record<string, string> = {}, ip = "10.0.0.1") {
  return new Request("http://localhost:3113/api/consultations", {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost:3113", "x-forwarded-for": ip, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = { name: "سارة العتيبي", phone: "+966 55 123 4567", topic: "استفسار عن دواء", message: "هل يمكن تناول الدواء مع الطعام؟" };

describe("POST /api/consultations", () => {
  beforeEach(() => create.mockClear());

  it("rejects cross-site requests", async () => {
    const res = await POST(request(valid, { origin: "https://evil.example" }, "10.0.0.2"));
    expect(res.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects invalid input with an Arabic message", async () => {
    const res = await POST(request({ ...valid, message: "قصير" }, {}, "10.0.0.3"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("10 أحرف");
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const res = await POST(request("{not json", {}, "10.0.0.4"));
    expect(res.status).toBe(400);
  });

  it("stores a valid consultation with a normalised phone", async () => {
    const res = await POST(request(valid, {}, "10.0.0.5"));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "c1" });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]?.[0]?.data.phone).toBe("0551234567");
  });

  it("rate limits repeated submissions from one address", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await POST(request(valid, {}, "10.0.0.6"))).status);
    expect(statuses.slice(0, 5).every((s) => s === 201)).toBe(true);
    expect(statuses[6]).toBe(429);
  });
});
