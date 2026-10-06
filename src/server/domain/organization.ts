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

/** A user of an organization, with their role there. */
export type OrganizationMember = { id: string; name: string | null; email: string; role: Role };
