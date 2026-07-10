"use client";

type FilterChipsProps = {
  selectedFilter: string;
  setSelectedFilter: (value: string) => void;
};

const filters = ["All", "Room", "1BHK", "2BHK", "Flat", "PG", "Apartment"];

export default function FilterChips({
  selectedFilter,
  setSelectedFilter,
}: FilterChipsProps) {
  return (
    <section className="mx-auto mt-5 w-full max-w-7xl px-4 md:px-8">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {filters.map((item) => {
          const isActive = selectedFilter === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => setSelectedFilter(item)}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold shadow-sm transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:text-blue-600"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </section>
  );
}