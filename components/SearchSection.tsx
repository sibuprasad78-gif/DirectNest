"use client";

import { FormEvent } from "react";
import { Building2, MapPin, Search } from "lucide-react";

type SearchSectionProps = {
  search: string;
  setSearch: (value: string) => void;
  propertyType: string;
  setPropertyType: (value: string) => void;
};

export default function SearchSection({
  search,
  setSearch,
  propertyType,
  setPropertyType,
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
    <section className="relative z-20 mx-auto mt-8 w-full max-w-7xl px-4 md:px-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-xl md:p-5"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)_auto]">
          <div className="relative">
            <MapPin
              size={22}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-blue-600"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search city, area or property..."
              aria-label="Search property by city, area or name"
              className="h-[60px] w-full rounded-2xl border-2 border-slate-200 bg-white pl-14 pr-5 text-[16px] font-medium text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Building2
              size={21}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-blue-600"
            />

            <select
              value={propertyType}
              onChange={(event) => setPropertyType(event.target.value)}
              aria-label="Select property type"
              className="h-[60px] w-full appearance-none rounded-2xl border-2 border-slate-200 bg-white pl-14 pr-10 text-[16px] font-semibold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              <option value="All">All Property Types</option>
              <option value="Room">Room</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="Flat">Flat</option>
              <option value="PG">PG</option>
              <option value="Apartment">Apartment</option>
            </select>

            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              ▼
            </span>
          </div>

          <button
            type="submit"
            className="flex h-[60px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 text-[16px] font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Search size={21} />
            Search
          </button>
        </div>

        {(search || propertyType !== "All") && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-sm font-medium text-slate-500">
              Showing results for{" "}
              <span className="font-bold text-slate-800">
                {search || "all locations"}
              </span>
              {propertyType !== "All" && (
                <>
                  {" "}
                  in{" "}
                  <span className="font-bold text-blue-600">
                    {propertyType}
                  </span>
                </>
              )}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPropertyType("All");
              }}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Clear Search
            </button>
          </div>
        )}
      </form>
    </section>
  );
}