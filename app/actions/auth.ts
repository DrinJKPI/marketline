"use server";
// Server Actions for accounts. They run only on the server, even though the
// forms in the browser call them directly.

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/utils/safe-redirect";
import { logInSchema, signUpSchema, type AuthState } from "@/lib/validation/auth";
import { EmailTakenError, createUser, findUserForLogin } from "@/server/db/users";
import { endSession, startSession } from "@/server/services/session";

// bcrypt's cost factor: each +1 doubles the work. 12 takes a few hundred
// milliseconds: slow enough to make guessing passwords expensive, fast
// enough that people don't notice.
const BCRYPT_ROUNDS = 12;

// A real hash of a throwaway password. When someone logs in with an email
// that has no account, we still compare against this, so the answer takes
// just as long and doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

export async function signUp(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  const parsed = signUpSchema.safeParse({
    ...values,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { name, email, password } = parsed.data;
  try {
    const user = await createUser({
      name,
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });
    await startSession(user.id);
  } catch (error) {
    if (error instanceof EmailTakenError) {
      return { errors: { email: [error.message] }, values };
    }
    throw error;
  }

  // redirect() works by throwing, so it has to be outside the try/catch.
  redirect(safeNextPath(formData.get("next")));
}

export async function logIn(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = logInSchema.safeParse({
    ...values,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { email, password } = parsed.data;
  const found = await findUserForLogin(email);
  const passwordOk = await bcrypt.compare(password, found?.passwordHash ?? DUMMY_HASH);

  // The same message whether the email or the password was wrong.
  if (!found || !passwordOk) {
    return { message: "Incorrect email or password.", values };
  }

  await startSession(found.user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function logOut(): Promise<void> {
  await endSession();
  redirect("/");
}