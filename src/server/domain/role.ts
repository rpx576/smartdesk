export const ROLES = ["ADMIN", "EMPLOYEE", "CLIENT"] as const;

export type Role = (typeof ROLES)[number];
