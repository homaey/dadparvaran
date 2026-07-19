import { Roles } from "@/lib/roles";

/** Direct publication is an admin-only governance action. */
export function canDirectPublish(role: string | null | undefined) {
  return role === Roles.ADMIN;
}
