import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { validateBaleMiniAppInitData } from "../miniapp-auth";

function signedInitData(token: string, authDate: number) {
  const params = new URLSearchParams({
    auth_date: String(authDate),
    query_id: "query-1",
    user: JSON.stringify({ id: 123456789, first_name: "علی", username: "ali_test", allows_write_to_pm: true }),
  });
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = crypto.createHmac("sha256", token).update("WebAppData").digest();
  const hash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
  params.set("hash", hash);
  return params.toString();
}

describe("validateBaleMiniAppInitData", () => {
  it("accepts valid fresh signed data", () => {
    const now = 1_800_000_000;
    const user = validateBaleMiniAppInitData({
      initData: signedInitData("test-bot-token", now - 20),
      botToken: "test-bot-token",
      nowSeconds: now,
      maxAgeSeconds: 600,
    });
    expect(user.id).toBe("123456789");
    expect(user.username).toBe("ali_test");
  });

  it("rejects tampered or expired data", () => {
    const now = 1_800_000_000;
    expect(() => validateBaleMiniAppInitData({
      initData: signedInitData("right-token", now).replace("ali_test", "attacker"),
      botToken: "right-token",
      nowSeconds: now,
    })).toThrow();
    expect(() => validateBaleMiniAppInitData({
      initData: signedInitData("right-token", now - 1000),
      botToken: "right-token",
      nowSeconds: now,
      maxAgeSeconds: 600,
    })).toThrow("BALE_INIT_DATA_EXPIRED");
  });
});
