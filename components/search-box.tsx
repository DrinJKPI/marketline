"use client";
// The search box in the header. On a results page it shows the current
// search (?q=...), so you can see and change what you searched for.

import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

// Reads ?q= from the URL. useSearchParams only works in the browser, so the
// header shows <SearchForm /> without a value until this is ready.
export function SearchBox() {
  const query = useSearchParams().get("q") ?? "";
  // A new key resets the box whenever the search in the URL changes.
  return <SearchForm key={query} defaultValue={query} />;
}

// next/form: a normal GET form (?q=...) that navigates without a full reload.
export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <Form
      action="/products"
      role="search"
      className="order-last flex w-full sm:order-none sm:w-auto sm:flex-1"
    >
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search Marketline"
        maxLength={100}
        className="min-w-0 flex-1 rounded-l-lg border-0 bg-white px-4 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500"
      />
      <button
        type="submit"
        aria-label="Search"
        className="rounded-r-lg bg-amber-400 px-4 text-slate-900 hover:bg-amber-300"
      >
        <Search aria-hidden className="h-5 w-5" />
      </button>
    </Form>
  );
}