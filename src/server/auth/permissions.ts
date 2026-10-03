import type { Role } from "@/server/domain/role";

/**
 * Authorization matrix: which roles hold each permission inside an
 * organization. This is the single source of truth for role checks.
 */
const PERMISSIONS = {
  "organization:read": ["ADMIN", "EMPLOYEE", "CLIENT"],
  "client:read": ["ADMIN", "EMPLOYEE"],
  "client:write": ["ADMIN", "EMPLOYEE"],
  "client:delete": ["ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
