import type { Role } from "./role";

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type Membership = {
  userId: string;
  organizationId: string;
  role: Role;
};

/** An organization together with the caller's role in it. */
export type OrganizationWithRole = Organization & { role: Role };
