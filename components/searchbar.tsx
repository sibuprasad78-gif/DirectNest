type SearchBarProps = {
  search: string;
  setSearch: (value: string) => void;
  propertyType: string;
  setPropertyType: (value: string) => void;
  minRent: string;
  setMinRent: (value: string) => void;
  maxRent: string;
  setMaxRent: (value: string) => void;
  clearFilters: () => void;
};

export default function SearchBar({
  search,
  setSearch,
  propertyType,
  setPropertyType,
  minRent,
  setMinRent,
  maxRent,
  setMaxRent,
  clearFilters,
}: SearchBarProps) {
  return (
    <section className="-mt-12 relative z-10 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          🔍 Search Properties
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search city, area, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-4 text-black placeholder:text-gray-500 focus:outline-none focus:border-blue-600"
          />

          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-4 text-black focus:outline-none focus:border-blue-600"
          >
            <option value="">All Types</option>
            <option value="Single Room">Single Room</option>
            <option value="1 BHK">1 BHK</option>
            <option value="2 BHK">2 BHK</option>
            <option value="3 BHK">3 BHK</option>
            <option value="PG">PG</option>
          </select>

          <input
            type="number"
            placeholder="Min Rent"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-4 text-black placeholder:text-gray-500 focus:outline-none focus:border-blue-600"
          />

          <input
            type="number"
            placeholder="Max Rent"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-4 text-black placeholder:text-gray-500 focus:outline-none focus:border-blue-600"
          />

          <button
            onClick={clearFilters}
            className="bg-gray-900 text-white rounded-xl px-6 py-4 hover:bg-black font-semibold"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </section>
  );
}