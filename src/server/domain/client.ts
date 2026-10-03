export const CLIENT_STATUSES = ["LEAD", "ACTIVE", "INACTIVE"] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export type Client = {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientCreateData = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  status?: ClientStatus;
};

export type ClientUpdateData = Partial<ClientCreateData>;

export type ClientListFilter = {
  search?: string;
  status?: ClientStatus;
  page: number;
  pageSize: number;
};

export type Page<T> = {
  data: T[];
  meta: { total: number; page: number; pageSize: number };
};
