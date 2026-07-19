// dadparvaran stores User.role as a plain string, not a Prisma enum.
// This object mirrors the previous `Role` enum's value ergonomics so call
// sites can keep writing `Roles.ADMIN` etc., while the underlying type is
// just `string`.
export const Roles = {
  ADMIN: "ADMIN",
  LAWYER: "LAWYER",
  CONTENT_CREATOR: "CONTENT_CREATOR",
  LEGAL_REVIEWER: "LEGAL_REVIEWER",
} as const;

export type RoleValue = (typeof Roles)[keyof typeof Roles];
