// The sign-up page. Works like the login page.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { safeNextPath } from "@/lib/utils/safe-redirect";
import { getCurrentUser } from "@/server/services/session";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage({ searchParams }: PageProps<"/signup">) {
  return (
    <Suspense fallback={<AuthForm mode="signup" />}>
      <SignUpForm searchParams={searchParams} />
    </Suspense>
  );
}

async function SignUpForm({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return <AuthForm mode="signup" next={next} />;
}