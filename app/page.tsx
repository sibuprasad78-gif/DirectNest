"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { db } from "@/lib/firebase";

type Property = {
  id: string;
  title: string;
  location: string;
  rent: string;
  type: string;
  description: string;
  contact: string;
};

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");

  const filteredProperties = properties.filter((property) => {
    const text = `${property.title} ${property.location} ${property.type}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  useEffect(() => {
    const fetchProperties = async () => {
      const querySnapshot = await getDocs(collection(db, "properties"));

      const propertyList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Property[];

      setProperties(propertyList);
    };

    fetchProperties();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />

      <section className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <h2 className="text-5xl font-bold">Find Rooms Without Brokerage</h2>

        <p className="mt-4 text-gray-600 text-lg">
          Connect Directly with Property Owners.
        </p>

        <div className="mt-8 flex gap-3">
          <input
            type="text"
            placeholder="Search City, Area or Room Type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-3 rounded-lg w-80"
          />

          <button className="bg-blue-600 text-white px-6 rounded-lg">
            Search
          </button>
        </div>

        <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-blue-700">
          Find Room
        </button>
      </section>

      <section className="py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-10">
          Available Properties
        </h2>

        {filteredProperties.length === 0 ? (
          <p className="text-center text-gray-500">
            No matching properties found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-lg p-5"
              >
                <div className="bg-gray-300 h-48 rounded-lg flex items-center justify-center text-gray-600">
                  Property Image
                </div>

                <h3 className="text-2xl font-semibold mt-4">
                  {property.title}
                </h3>

                <p className="text-gray-600 mt-2">📍 {property.location}</p>

                <p className="text-blue-600 font-bold mt-2">
                  ₹{property.rent} / Month
                </p>

                <p className="text-gray-600 mt-2">🏠 {property.type}</p>

                <p className="text-gray-600 mt-2">📞 {property.contact}</p>

                <Link
                  href={`/property/${property.id}`}
                  className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}