// Login sessions: creating, reading and ending them. The browser keeps a
// random token in a cookie; the database keeps only a SHA-256 hash of it,
// so someone who reads the database still can't log in as anyone.
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { deleteSession, getSession, putSession } from "@/server/db/sessions";
import { getUserById } from "@/server/db/users";
import type { User } from "@/types/user";

const SESSION_COOKIE = "marketline_session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function startSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url"); // 256 random bits
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await putSession(hashToken(token), {
    userId,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript in the browser can't read it
    secure: process.env.NODE_ENV === "production", // HTTPS only when deployed
    sameSite: "lax", // not sent with cross-site form posts (CSRF protection)
    path: "/",
    expires: expiresAt,
  });
}

// The logged-in user, or null. cache() means that several components
// asking during the same request only read the database once.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await getSession(hashToken(token));
  // DynamoDB removes expired sessions by itself, but not instantly, so
  // the expiry date is checked here as well.
  if (!session || new Date(session.expiresAt) < new Date()) return null;

  return getUserById(session.userId);
});

// For pages that need a logged-in user: returns the user, or sends the
// visitor to the login page and back here afterwards.
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(hashToken(token));
  cookieStore.delete(SESSION_COOKIE);
}