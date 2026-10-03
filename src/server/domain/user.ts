/** The authenticated caller, as resolved by the authentication layer. */
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

/** Login data. Only the authentication service may see the password hash. */
export type UserCredentials = SessionUser & { passwordHash: string | null };
