"use client";

type FilterType =
  | "All"
  | "Room"
  | "1BHK"
  | "2BHK"
  | "3BHK"
  | "PG";

type FilterChipsProps = {
  selectedFilter: FilterType;
  setSelectedFilter: React.Dispatch<React.SetStateAction<FilterType>>;
};

const filters: FilterType[] = [
  "All",
  "Room",
  "1BHK",
  "2BHK",
  "3BHK",
  "PG",
];

export default function FilterChips({
  selectedFilter,
  setSelectedFilter,
}: FilterChipsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((item) => {
        const isActive = selectedFilter === item;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setSelectedFilter(item)}
            className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}