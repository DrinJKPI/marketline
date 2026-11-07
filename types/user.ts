// A user as the rest of the app sees it. The password hash never leaves
// server/db, so it isn't part of this type.

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO date
};