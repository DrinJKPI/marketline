"use client";
// The form on the login and sign-up pages. It's a client component because
// it shows the result of submitting: error messages and a "Please wait…"
// button.

import Link from "next/link";
import { useActionState } from "react";
import { logIn, signUp } from "@/app/actions/auth";

type AuthFormProps = {
  mode: "login" | "signup";
  next?: string; // where to go afterwards, e.g. "/cart"
};

export function AuthForm({ mode, next }: AuthFormProps) {
  const isLogin = mode === "login";
  // useActionState calls the Server Action and keeps whatever it returns
  // (our error messages) in `state`. `pending` is true while it runs.
  const [state, formAction, pending] = useActionState(
    isLogin ? logIn : signUp,
    undefined,
  );
  const otherPage = isLogin ? "/signup" : "/login";

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">
          {isLogin ? "Log in to Marketline" : "Create your account"}
        </h1>

        <form action={formAction} noValidate className="mt-6 space-y-4">
          {next && <input type="hidden" name="next" value={next} />}

          {!isLogin && (
            <Field
              label="Your name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={state?.values?.name}
              errors={state?.errors?.name}
            />
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state?.values?.email}
            errors={state?.errors?.email}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            hint={isLogin ? undefined : "At least 8 characters."}
            errors={state?.errors?.password}
          />

          {state?.message && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-slate-600">
        {isLogin ? "New to Marketline? " : "Already have an account? "}
        <Link
          href={next ? `${otherPage}?next=${encodeURIComponent(next)}` : otherPage}
          className="font-medium text-brand-700 hover:underline"
        >
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  defaultValue?: string;
  hint?: string;
  errors?: string[];
};

// One labelled input with its hint or error messages.
function Field({ label, name, hint, errors, ...inputProps }: FieldProps) {
  const hasError = Boolean(errors?.length);
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required
        aria-invalid={hasError}
        aria-describedby={`${name}-help`}
        className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 ${
          hasError ? "border-red-400" : "border-slate-300"
        }`}
        {...inputProps}
      />
      <div id={`${name}-help`}>
        {hasError
          ? errors!.map((error) => (
              <p key={error} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))
          : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}