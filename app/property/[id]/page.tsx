"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import Link from "next/link";

type Property = {
  title: string;
  location: string;
  rent: string;
  type: string;
  description: string;
  contact: string;
  imageUrl?: string;
};

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const docRef = doc(db, "properties", propertyId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProperty(docSnap.data() as Property);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (!property) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Loading property details...</p>
      </main>
    );
  }

  const whatsappLink = `https://wa.me/91${property.contact}?text=${encodeURIComponent(
    `Hi, I found your property "${property.title}" on DirectNest. Is it still available?`
  )}`;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-96 object-cover rounded-xl"
          />
        ) : (
          <div className="h-72 bg-gray-300 rounded-xl flex items-center justify-center text-gray-600 text-xl">
            Property Image
          </div>
        )}

        <h1 className="text-4xl font-bold mt-6 text-blue-600">
          {property.title}
        </h1>

        <p className="text-gray-600 mt-3 text-lg">📍 {property.location}</p>

        <p className="text-2xl font-bold text-green-600 mt-4">
          ₹{property.rent} / Month
        </p>

        <p className="text-gray-700 mt-4">🏠 Property Type: {property.type}</p>

        <p className="text-gray-700 mt-4">📝 {property.description}</p>

        <p className="text-gray-700 mt-4">
          📞 Owner Contact: {property.contact}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/">
            <button className="bg-gray-700 text-white px-5 py-3 rounded-lg hover:bg-gray-800">
              ⬅ Back to Home
            </button>
          </Link>

          <a href={`tel:${property.contact}`}>
            <button className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">
              📞 Call Owner
            </button>
          </a>

          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <button className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700">
              💬 WhatsApp Owner
            </button>
          </a>
        </div>
      </div>
    </main>
  );
}