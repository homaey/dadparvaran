import { describe, expect, it } from "vitest";
import { canTransition, isConsultationStatus } from "../constants";

describe("consultation state policy", () => {
  it("allows the normal flow", () => {
    expect(canTransition("OPEN", "ASSIGNED")).toBe(true);
    expect(canTransition("ASSIGNED", "HANDOFF_SENT")).toBe(true);
    expect(canTransition("HANDOFF_SENT", "CONTACTED")).toBe(true);
    expect(canTransition("CONTACTED", "CLOSED")).toBe(true);
  });

  it("rejects reopening a closed request without an explicit admin policy", () => {
    expect(canTransition("CLOSED", "OPEN")).toBe(false);
  });

  it("validates known statuses", () => {
    expect(isConsultationStatus("OPEN")).toBe(true);
    expect(isConsultationStatus("UNKNOWN")).toBe(false);
  });
});
