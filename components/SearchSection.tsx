"use client";

import { FormEvent } from "react";
import { MapPin, Search } from "lucide-react";

type SearchSectionProps = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};

export default function SearchSection({
  searchQuery,
  setSearchQuery,
}: SearchSectionProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const propertySection = document.getElementById("properties");

    propertySection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <MapPin
            size={21}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search city, area or property..."
            aria-label="Search property by city, area or name"
            className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-4 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <Search size={20} />
          Search
        </button>
      </div>

      {searchQuery.trim() && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">
            Searching for{" "}
            <span className="font-bold text-slate-800">
              {searchQuery}
            </span>
          </p>

          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Clear Search
          </button>
        </div>
      )}
    </form>
  );
}