"use client";
// Shown instead of a page when something unexpected goes wrong while
// rendering it, for example when the database can't be reached. The header
// and footer stay, and "Try again" re-renders the page.

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error); // shows up in the browser console
  }, [error]);

  // Errors from the server carry a short ID (digest) that matches the
  // server's log, without revealing any details to the visitor.
  const digest =
    error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
      <div className="mt-6">
        <EmptyState
          icon={TriangleAlert}
          title="This page couldn't be loaded"
          text="This is a problem on our side, not yours. Please try again in a moment."
          action={{ href: "/", label: "Go to the homepage" }}
        >
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
          >
            Try again
          </button>
        </EmptyState>
      </div>
      {digest && <p className="mt-4 text-center text-xs text-slate-400">Error ID: {digest}</p>}
    </div>
  );
}