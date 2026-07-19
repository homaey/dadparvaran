import { describe, expect, it } from "vitest";
import { Roles } from "@/lib/roles";
import { TaskStatus } from "@/lib/content-enums";
import { calculatePriority, canTransition, getAllowedTransitions, isArticleEditableStatus } from "./workflow";

describe("workflow state machine", () => {
  it("lets content creators and lawyers submit drafts", () => {
    expect(canTransition(Roles.CONTENT_CREATOR, TaskStatus.DRAFT, TaskStatus.REVIEW)).toBe(true);
    expect(canTransition(Roles.LAWYER, TaskStatus.DRAFT, TaskStatus.REVIEW)).toBe(true);
  });
  it("prevents creators from approving", () => expect(canTransition(Roles.CONTENT_CREATOR, TaskStatus.REVIEW, TaskStatus.APPROVED)).toBe(false));
  it("keeps final review decisions with admins", () => {
    expect(canTransition(Roles.LEGAL_REVIEWER, TaskStatus.REVIEW, TaskStatus.REVISION)).toBe(false);
    expect(canTransition(Roles.ADMIN, TaskStatus.REVIEW, TaskStatus.REVISION)).toBe(true);
  });
  it("does not let admins skip workflow stages", () => {
    expect(canTransition(Roles.ADMIN, TaskStatus.PLANNED, TaskStatus.PUBLISHED)).toBe(false);
    expect(getAllowedTransitions(Roles.ADMIN, TaskStatus.APPROVED)).toEqual([TaskStatus.PUBLISHED]);
  });
  it("keeps approved and published articles immutable", () => {
    expect(isArticleEditableStatus(TaskStatus.DRAFT)).toBe(true);
    expect(isArticleEditableStatus(TaskStatus.APPROVED)).toBe(false);
    expect(isArticleEditableStatus(TaskStatus.PUBLISHED)).toBe(false);
  });
  it("calculates weighted priority", () => expect(calculatePriority(100, 80, 60, 40)).toBe(75));
});
