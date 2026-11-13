// The account link in the header: "Hi, Anna" when logged in, otherwise
// "Log in". It reads the session cookie, so the header shows it inside
// <Suspense>, with the plain link as a placeholder.

import Link from "next/link";
import { User } from "lucide-react";
import { getCurrentUser } from "@/server/services/session";

const className =
  "flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium hover:bg-white/10";

export async function AccountLink() {
  const user = await getCurrentUser();
  if (!user) return <AccountLinkFallback />;

  const firstName = user.name.split(" ")[0];
  return (
    <Link href="/account" aria-label="Your account" className={className}>
      <User aria-hidden className="h-5 w-5" />
      <span className="hidden max-w-32 truncate md:inline">Hi, {firstName}</span>
    </Link>
  );
}

export function AccountLinkFallback() {
  return (
    <Link href="/login" aria-label="Log in" className={className}>
      <User aria-hidden className="h-5 w-5" />
      <span className="hidden md:inline">Log in</span>
    </Link>
  );
}