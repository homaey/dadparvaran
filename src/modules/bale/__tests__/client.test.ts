import { describe, expect, it, vi } from "vitest";
import { BaleApiError, BaleClient } from "../client";

describe("BaleClient", () => {
  it("posts sendMessage to the configured API", async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      ok: true,
      result: { message_id: 12, chat: { id: 9, type: "private" }, date: 1, text: "hello" },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const client = new BaleClient({ token: "token", baseUrl: "https://example.test", fetchImpl: fetchImpl as typeof fetch });
    await client.sendMessage({ chatId: "9", text: "hello" });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(String(fetchImpl.mock.calls[0][0])).toBe("https://example.test/bottoken/sendMessage");
  });

  it("throws a structured API error", async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ ok: false, description: "bad request", error_code: 400 }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }));
    const client = new BaleClient({ token: "token", baseUrl: "https://example.test", fetchImpl: fetchImpl as typeof fetch });
    await expect(client.sendMessage({ chatId: "9", text: "hello" })).rejects.toBeInstanceOf(BaleApiError);
  });
});
