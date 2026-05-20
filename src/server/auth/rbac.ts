import type { UserRole } from "@prisma/client";

export type AllowedRoles = readonly UserRole[];

export function canAccess(role: UserRole, allowed: AllowedRoles) {
  return allowed.includes(role);
}

export const L2_ALLOWED_ROLES = ["L2", "LEAD"] as const satisfies AllowedRoles;
