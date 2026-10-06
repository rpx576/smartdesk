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

export type ClientCapabilities = { canRead: boolean; canWrite: boolean; canDelete: boolean };

/**
 * What the client-directory UI may offer to a role (buttons and links).
 * Derived from the same matrix the services enforce, so the UI can never show
 * more than the server allows; the server still re-checks every operation.
 */
export function clientCapabilities(role: Role): ClientCapabilities {
  return {
    canRead: roleHasPermission(role, "client:read"),
    canWrite: roleHasPermission(role, "client:write"),
    canDelete: roleHasPermission(role, "client:delete"),
  };
}
