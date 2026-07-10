"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Property = {
  id: string;
  title: string;
  location: string;
  rent: number;
  type: string;
  imageUrls?: string[];
};

type Props = {
  currentPropertyId: string;
  propertyType: string;
};

export default function SimilarProperties({
  currentPropertyId,
  propertyType,
}: Props) {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function loadProperties() {
      const snapshot = await getDocs(collection(db, "properties"));

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Property, "id">),
        }))
        .filter(
          (item) =>
            item.id !== currentPropertyId &&
            item.type === propertyType
        )
        .slice(0, 4);

      setProperties(data);
    }

    loadProperties();
  }, [currentPropertyId, propertyType]);

  if (properties.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-3xl font-black">
        Similar Properties
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/property/${property.id}`}
            className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative h-56">
              <Image
                src={
                  property.imageUrls?.[0] ||
                  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"
                }
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-5">
              <h3 className="line-clamp-1 text-lg font-bold">
                {property.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {property.location}
              </p>

              <p className="mt-4 text-2xl font-black text-blue-600">
                ₹{property.rent}
                <span className="text-base text-slate-500">
                  /month
                </span>
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Verified
                </span>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  No Brokerage
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}