import { describe, expect, it } from "vitest";
import { clientLinkedMessage } from "../message-templates";

/**
 * الگوی payload دستور /start — همان الگویی که در webhook-handler استفاده
 * می‌شود. deep-link «پیگیری در بله» روی آن سوار است، پس اگر شکل توکن عوض شد
 * این تست باید شکست بدهد.
 */
const START_PAYLOAD = /^\/start\s+([A-Za-z0-9_-]{8,64})$/;

describe("/start payload parsing", () => {
  it("matches a base64url token produced by createClaimToken", () => {
    // خروجی crypto.randomBytes(12).toString("base64url") — ۱۶ نویسه
    const match = "/start IbBFfvsPVJjiMM-T".match(START_PAYLOAD);
    expect(match?.[1]).toBe("IbBFfvsPVJjiMM-T");
  });

  it("matches tokens containing underscores and hyphens", () => {
    expect("/start abc_def-GHI12345".match(START_PAYLOAD)?.[1]).toBe("abc_def-GHI12345");
  });

  it("does not match a bare /start, which must fall through to the welcome branch", () => {
    expect("/start".match(START_PAYLOAD)).toBeNull();
  });

  it("rejects a payload that is too short to be a real token", () => {
    expect("/start abc".match(START_PAYLOAD)).toBeNull();
  });

  it("rejects payloads with characters that cannot appear in base64url", () => {
    expect("/start ../../etc/passwd".match(START_PAYLOAD)).toBeNull();
    expect("/start token with spaces".match(START_PAYLOAD)).toBeNull();
  });

  it("does not swallow the lawyer's /link command", () => {
    expect("/link LAW-VSQH-SXLJ".match(START_PAYLOAD)).toBeNull();
  });
});

describe("clientLinkedMessage", () => {
  it("confirms a fresh link and sets the expectation of a follow-up", () => {
    const text = clientLinkedMessage({ publicCode: "DP-1405-ABC123", alreadyLinked: false });
    expect(text).toContain("متصل شد");
    expect(text).toContain("DP-1405-ABC123");
    expect(text).toContain("گفت‌وگوی مستقیم");
  });

  it("does not claim a second link happened when the account was already bound", () => {
    const text = clientLinkedMessage({ publicCode: "DP-1405-ABC123", alreadyLinked: true });
    expect(text).toContain("از قبل");
    expect(text).not.toContain("✅");
  });
});
