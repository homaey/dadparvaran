import { describe, expect, it } from "vitest";
import { Roles } from "@/lib/roles";
import { canDirectPublish } from "./policy";

describe("article publication policy", () => {
  it("allows admins to publish", () => expect(canDirectPublish(Roles.ADMIN)).toBe(true));
  it("prevents authors from bypassing approval", () => expect(canDirectPublish(Roles.LAWYER)).toBe(false));
});
