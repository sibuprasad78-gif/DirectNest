import Link from "next/link";

type Property = {
  id: string;
  title?: string;
  location?: string;
  rent?: string;
  type?: string;
  description?: string;
  contact?: string;
  imageUrl?: string;
};

type PropertyCardProps = {
  property: Property;
  onSave: (property: Property) => void;
};

export default function PropertyCard({
  property,
  onSave,
}: PropertyCardProps) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200">

      <div className="relative overflow-hidden">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.title || "Property"}
            className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-64 bg-gray-300 flex items-center justify-center text-gray-600">
            No Image
          </div>
        )}

        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          {property.type || "Property"}
        </div>

        <div className="absolute top-4 right-4 bg-white text-green-600 px-3 py-1 rounded-full font-bold shadow">
          ₹{property.rent || "0"}
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {property.title || "Untitled Property"}
        </h2>

        <p className="text-gray-600 mt-3">
          📍 {property.location || "Location not added"}
        </p>

        <p className="text-gray-600 mt-2">
          📞 {property.contact || "Contact not added"}
        </p>

        <p className="text-gray-500 mt-3 line-clamp-2">
          {property.description || "No description available."}
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/property/${property.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-3 rounded-xl hover:bg-blue-700 font-semibold"
          >
            View Details
          </Link>

          <button
            onClick={() => onSave(property)}
            className="bg-red-500 text-white px-5 rounded-xl hover:bg-red-600"
          >
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}