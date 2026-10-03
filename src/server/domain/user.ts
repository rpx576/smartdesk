/** The authenticated caller, as resolved by the authentication layer. */
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};
