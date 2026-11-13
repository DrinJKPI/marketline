// Rules for the sign-up and login forms. They run on the server (in the
// Server Actions), so they can't be skipped by changing the browser's form.

import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "That email address is too long.")
  .pipe(z.email("Enter a valid email address."));

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(60, "Name must be at most 60 characters."),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    // bcrypt only uses the first 72 bytes of a password.
    .max(72, "Password must be at most 72 characters."),
});

export const logInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

// What a sign-up or login action sends back to the form when it fails.
export type AuthState =
  | {
      errors?: { name?: string[]; email?: string[]; password?: string[] };
      message?: string; // a general message shown above the button
      values?: { name?: string; email?: string }; // keeps the boxes filled in
    }
  | undefined;