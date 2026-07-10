"use client";

import { Search, MapPin } from "lucide-react";

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
  return (
    <section className="mx-auto -mt-10 w-full max-w-7xl px-4 md:px-8 relative z-20">
      <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_auto]">
          {/* Search */}
          <div className="relative">
            <MapPin
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600"
            />

            <input
              type="text"
              placeholder="Search city, area or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-[60px] w-full rounded-2xl border-2 border-slate-200 bg-white pl-14 pr-4 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600"
            />
          </div>

          {/* Property Type */}
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="h-[60px] rounded-2xl border-2 border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none transition focus:border-blue-600"
          >
            <option value="All">All Types</option>
            <option value="Room">Room</option>
            <option value="1BHK">1 BHK</option>
            <option value="2BHK">2 BHK</option>
            <option value="Flat">Flat</option>
            <option value="PG">PG</option>
            <option value="Apartment">Apartment</option>
          </select>

          {/* Search Button */}
          <button className="flex h-[60px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 font-bold text-white transition hover:bg-blue-700">
            <Search size={20} />
            Search
          </button>
        </div>
      </div>
    </section>
  );
}