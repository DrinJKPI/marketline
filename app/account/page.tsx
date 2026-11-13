// "Your account": the logged-in user's details and a log-out button.
// Visitors who aren't logged in are sent to the login page first.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Heart, LogOut, ShoppingCart } from "lucide-react";
import { logOut } from "@/app/actions/auth";
import { HeadingSkeleton } from "@/components/skeletons";
import { requireUser } from "@/server/services/session";

export const metadata: Metadata = { title: "Your account" };

const memberSince = new Intl.DateTimeFormat("en-IE", { dateStyle: "long" });

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<HeadingSkeleton />}>
        <AccountDetails />
      </Suspense>
    </div>
  );
}

async function AccountDetails() {
  const user = await requireUser("/account");

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Hi, {user.name}</h1>
      <p className="mt-1 text-slate-600">Manage your Marketline account.</p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Your details</h2>
        <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-slate-500">Name</dt>
          <dd>{user.name}</dd>
          <dt className="text-slate-500">Email</dt>
          <dd className="break-all">{user.email}</dd>
          <dt className="text-slate-500">Member since</dt>
          <dd>{memberSince.format(new Date(user.createdAt))}</dd>
        </dl>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/cart"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 font-medium hover:border-slate-300 hover:shadow-sm"
        >
          <ShoppingCart aria-hidden className="h-5 w-5 text-brand-700" /> Your cart
        </Link>
        <Link
          href="/wishlist"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 font-medium hover:border-slate-300 hover:shadow-sm"
        >
          <Heart aria-hidden className="h-5 w-5 text-brand-700" /> Your wishlist
        </Link>
      </div>

      <form action={logOut} className="mt-8">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          <LogOut aria-hidden className="h-4 w-4" /> Log out
        </button>
      </form>
    </>
  );
}