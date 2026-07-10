"use client";

type AmenitiesSelectorProps = {
  selectedAmenities: string[];
  setSelectedAmenities: React.Dispatch<
    React.SetStateAction<string[]>
  >;
};

const amenities = [
  "WiFi",
  "Parking",
  "Lift",
  "CCTV",
  "Power Backup",
  "AC",
  "TV",
  "Gym",
  "Garden",
  "24x7 Water",
  "Balcony",
  "Security",
  "Pet Friendly",
  "Gas Pipeline",
  "Swimming Pool",
  "Club House",
];

export default function AmenitiesSelector({
  selectedAmenities,
  setSelectedAmenities,
}: AmenitiesSelectorProps) {
  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(
        selectedAmenities.filter((item) => item !== amenity)
      );
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  return (
    <div className="rounded-[30px] bg-white p-6 shadow-lg">
      <h2 className="text-2xl font-black text-slate-900">
        Amenities
      </h2>

      <p className="mt-2 text-slate-500">
        Select all amenities available in your property.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {amenities.map((amenity) => {
          const selected =
            selectedAmenities.includes(amenity);

          return (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={`rounded-2xl border-2 px-5 py-4 text-left font-semibold transition ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-500"
              }`}
            >
              {amenity}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-100 p-4">
        <span className="font-bold">
          Selected:
        </span>{" "}
        {selectedAmenities.length}
      </div>
    </div>
  );
}