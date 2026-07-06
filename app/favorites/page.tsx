"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Property = {
  id: string;
  title: string;
  location: string;
  rent: string;
  type: string;
  contact: string;
  imageUrl?: string;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Property[]>([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const snapshot = await getDocs(collection(db, "favorites"));

    const data = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as Property[];

    setFavorites(data);
  };

  const removeFavorite = async (id: string) => {
    const confirmDelete = confirm(
      "Remove this property from favorites?"
    );

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "favorites", id));

    setFavorites((prev) =>
      prev.filter((property) => property.id !== id)
    );

    alert("Removed from Favorites ❤️");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        ❤️ Saved Properties
      </h1>

      {favorites.length === 0 ? (
        <p className="text-center text-gray-500">
          No favorite properties yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-lg p-5"
            >
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="bg-gray-300 h-48 rounded-lg flex items-center justify-center">
                  No Image
                </div>
              )}

              <h2 className="text-2xl font-bold mt-4">
                {property.title}
              </h2>

              <p className="mt-2">📍 {property.location}</p>

              <p className="text-blue-600 font-bold mt-2">
                ₹{property.rent} / Month
              </p>

              <p className="mt-2">🏠 {property.type}</p>

              <p className="mt-2">📞 {property.contact}</p>

              <div className="flex gap-3 mt-5">
                <Link
                  href={`/property/${property.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  View Details
                </Link>

                <button
                  onClick={() => removeFavorite(property.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}