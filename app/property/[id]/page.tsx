"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReviewSection from "@/components/reviewsection";
type Property = {
  title: string;
  location: string;
  rent: string;
  type: string;
  description: string;
  contact: string;
  imageUrl?: string;
  imageUrls?: string[];
  propertyId?: string;
};

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const propertyRef = doc(db, "properties", propertyId);
        const propertySnap = await getDoc(propertyRef);

        if (propertySnap.exists()) {
          setProperty(propertySnap.data() as Property);
          return;
        }

        const favoriteRef = doc(db, "favorites", propertyId);
        const favoriteSnap = await getDoc(favoriteRef);

        if (favoriteSnap.exists()) {
          const favoriteData = favoriteSnap.data() as Property;

          if (favoriteData.propertyId) {
            const originalPropertyRef = doc(
              db,
              "properties",
              favoriteData.propertyId
            );

            const originalPropertySnap = await getDoc(originalPropertyRef);

            if (originalPropertySnap.exists()) {
              setProperty(originalPropertySnap.data() as Property);
              return;
            }
          }

          setProperty(favoriteData);
          return;
        }

        setNotFound(true);
      } catch (error: any) {
        alert(error.message || "Failed to load property.");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Loading property details...</p>
      </main>
    );
  }

  if (notFound || !property) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <p className="text-xl text-red-600">Property not found.</p>

        <Link href="/">
          <button className="bg-blue-600 text-white px-5 py-3 rounded-lg">
            Back to Home
          </button>
        </Link>
      </main>
    );
  }

  const images =
    property.imageUrls && property.imageUrls.length > 0
      ? property.imageUrls
      : property.imageUrl
      ? [property.imageUrl]
      : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const whatsappLink = `https://wa.me/91${property.contact}?text=${encodeURIComponent(
    `Hi, I found your property "${property.title}" on DirectNest. Is it still available?`
  )}`;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {images.length > 0 ? (
          <div>
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt={property.title}
                className="w-full h-96 object-cover rounded-xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-full"
                  >
                    ⬅
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-full"
                  >
                    ➡
                  </button>

                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Property ${index + 1}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-20 w-full object-cover rounded-lg cursor-pointer border-4 ${
                      currentImageIndex === index
                        ? "border-blue-600"
                        : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
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

          <Link href={`/book-visit/${propertyId}`}>
            <button className="bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700">
              📅 Book Visit
            </button>
          </Link>
        </div>
      </div>
      <ReviewSection propertyId={propertyId} />
    </main>
  );
}