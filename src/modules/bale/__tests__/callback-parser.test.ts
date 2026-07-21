import { describe, expect, it } from "vitest";
import { parseBaleCallbackData } from "../callback-parser";

describe("parseBaleCallbackData", () => {
  it("parses claim callbacks", () => {
    expect(parseBaleCallbackData("claim:abcDEF123")).toEqual({ kind: "claim", token: "abcDEF123" });
  });

  it("parses lawyer status callbacks", () => {
    expect(parseBaleCallbackData("status:abcDEF123:contacted")).toEqual({
      kind: "status",
      token: "abcDEF123",
      action: "contacted",
    });
  });

  it("rejects oversized or malformed callbacks", () => {
    expect(parseBaleCallbackData("x".repeat(65))).toBeNull();
    expect(parseBaleCallbackData("status:token:unknown")).toBeNull();
    expect(parseBaleCallbackData("claim:" )).toBeNull();
  });
});
