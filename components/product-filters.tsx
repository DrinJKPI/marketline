"use client";
// The filter panel next to a product list, plus the sort menu above it.
// It's a normal GET form, so it works without JavaScript too. With
// JavaScript, ticking a box or changing the sort applies it straight away.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS, defaultSort } from "@/lib/utils/filters-url";
import type { Category, ProductFilters } from "@/types/catalog";

const FORM_ID = "product-filters";
const RATINGS = [4.5, 4, 3];

type BrandCount = { name: string; count: number };

type ProductFiltersProps = {
  basePath: string; // the page's own URL, e.g. "/products"
  filters: ProductFilters;
  brands: BrandCount[];
  categories?: Category[]; // only on /products, not on a category page
};

export function ProductFiltersPanel({
  basePath,
  filters,
  brands,
  categories,
}: ProductFiltersProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false); // phones only: show/hide the panel

  // Builds the URL from the form, leaving out empty boxes and the default
  // sort, then navigates there without reloading the page.
  function apply(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value.trim() !== "") {
        params.append(key, value.trim());
      }
    }
    if (params.get("sort") === defaultSort(params.get("q") ?? undefined)) {
      params.delete("sort");
    }
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={FORM_ID}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium lg:hidden"
      >
        <SlidersHorizontal aria-hidden className="h-4 w-4" />
        {open ? "Hide filters" : "Show filters"}
      </button>

      <form
        id={FORM_ID}
        action={basePath}
        onSubmit={(event) => {
          event.preventDefault();
          apply(event.currentTarget);
        }}
        onChange={(event) => {
          // Tick boxes, radio buttons and menus apply at once; the price
          // boxes wait for the Apply button (or Enter).
          const field = event.target;
          if (!(field instanceof HTMLInputElement && field.type === "number")) {
            event.currentTarget.requestSubmit();
          }
        }}
        className={`${open ? "block" : "hidden"} mt-4 space-y-6 rounded-xl border border-slate-200 bg-white p-4 lg:mt-0 lg:block`}
      >
        {filters.query && <input type="hidden" name="q" value={filters.query} />}

        {categories && (
          <Section title="Category">
            <select
              name="category"
              defaultValue={filters.categorySlug ?? ""}
              aria-label="Category"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </Section>
        )}

        {brands.length > 0 && (
          <Section title="Brand">
            <ul className="space-y-1.5">
              {brands.map((brand) => (
                <li key={brand.name}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="brand"
                      value={brand.name}
                      defaultChecked={filters.brands?.includes(brand.name)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    {brand.name}
                    <span className="text-slate-400">({brand.count})</span>
                  </label>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Price (€)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min"
              min={0}
              step={1}
              placeholder="Min"
              aria-label="Minimum price in euro"
              defaultValue={euros(filters.minPriceCents)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            />
            <span aria-hidden>–</span>
            <input
              type="number"
              name="max"
              min={0}
              step={1}
              placeholder="Max"
              aria-label="Maximum price in euro"
              defaultValue={euros(filters.maxPriceCents)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
        </Section>

        <Section title="Customer rating">
          <div className="space-y-1.5 text-sm">
            {[...RATINGS, undefined].map((rating) => (
              <label key={rating ?? "any"} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rating"
                  value={rating ?? ""}
                  defaultChecked={filters.minRating === rating}
                  className="h-4 w-4 accent-brand-600"
                />
                {rating ? `${rating} ★ & up` : "Any rating"}
              </label>
            ))}
          </div>
        </Section>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="stock"
            value="1"
            defaultChecked={filters.inStockOnly}
            className="h-4 w-4 accent-brand-600"
          />
          In stock only
        </label>

        <div className="flex items-center justify-between gap-2">
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            Apply
          </button>
          <Link
            href={filters.query ? `${basePath}?q=${encodeURIComponent(filters.query)}` : basePath}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Clear filters
          </Link>
        </div>
      </form>
    </div>
  );
}

// The sort menu sits above the results, outside the panel. The form
// attribute still makes it part of the filter form.
export function SortSelect({ filters }: { filters: ProductFilters }) {
  const options = SORT_OPTIONS.filter(
    (option) => option.value !== "relevance" || filters.query,
  );

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">Sort by</span>
      <select
        name="sort"
        form={FORM_ID}
        defaultValue={filters.sort}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

const euros = (cents?: number) => (cents === undefined ? "" : cents / 100);