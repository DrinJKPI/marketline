"use client";
// The last line of defence: shown if even the main layout (header, footer)
// fails. It replaces the whole page, so it has its own <html> and <body>.

import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans text-slate-900">
        <title>Something went wrong · Marketline</title>
        <div className="max-w-md text-center">
          <p className="text-xl font-bold">Marketline</p>
          <h1 className="mt-6 text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-slate-600">
            The store couldn&apos;t be loaded. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-500"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}