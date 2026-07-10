"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MapPin,
  Phone,
  Share2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import PropertyGallery from "@/components/PropertyGallery";
import OwnerCard from "@/components/OwnerCard";
import Amenities from "@/components/Amenities";
import VisitBooking from "@/components/VisitBooking";
import SimilarProperties from "@/components/SimilarProperties";

export default function PropertyDetailsPage() {
  const { id } = useParams();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;

      const ref = doc(db, "properties", id as string);

      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProperty({
          id: snap.id,
          ...snap.data(),
        });
      }

      setLoading(false);
    }

    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">
          Loading Property...
        </h2>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">
          Property not found
        </h2>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Top Bar */}

      <div className="sticky top-0 z-50 bg-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link
            href="/"
            className="flex items-center gap-2 font-bold"
          >
            <ArrowLeft />
            Back
          </Link>

          <div className="flex gap-3">

            <button className="rounded-full bg-white p-3 shadow">
              <Heart size={20} />
            </button>

            <button className="rounded-full bg-white p-3 shadow">
              <Share2 size={20} />
            </button>

          </div>

        </div>

      </div>

      {/* Gallery */}

      <PropertyGallery
        images={property.imageUrls || []}
      />

      {/* Main */}

      <section className="mx-auto max-w-7xl px-4 py-8">

        <div className="flex flex-wrap gap-3">

          <span className="rounded-full bg-blue-100 px-4 py-2 font-bold text-blue-700">
            No Brokerage
          </span>

          <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 font-bold text-green-700">
            <BadgeCheck size={18} />
            Verified Owner
          </span>

        </div>

        <h1 className="mt-5 text-4xl font-black">
          {property.title}
        </h1>

        <div className="mt-4 flex items-center gap-2 text-slate-500">

          <MapPin size={18} />

          {property.location}

        </div>

        <div className="mt-6 text-5xl font-black text-blue-600">

          ₹{property.rent}

          <span className="text-xl text-slate-500">
            {" "}
            /month
          </span>

        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Bedrooms
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {property.bedrooms || 2}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Bathrooms
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {property.bathrooms || 2}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Area
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {property.area || 1200} sqft
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Furnished
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {property.furnished || "Semi"}
            </h2>
          </div>

        </div>

        <div className="mt-10">

          <h2 className="text-3xl font-black">
            Description
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            {property.description}
          </p>

        </div>
        <div className="mt-10">
          <Amenities
            amenities={
              Array.isArray(property.amenities)
                ? property.amenities
                : [
                    "24x7 Water",
                    "Parking",
                    "CCTV",
                    "Power Backup",
                    "Balcony",
                    "Security",
                  ]
            }
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <h2 className="text-3xl font-black text-slate-950">
              Contact Property Owner
            </h2>

            <p className="mt-2 text-slate-500">
              Contact the owner directly without paying brokerage.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <a
                href={`tel:${String(property.contact || "").replace(
                  /\D/g,
                  ""
                )}`}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 font-bold text-white shadow-lg transition hover:bg-blue-700"
              >
                <Phone size={20} />
                Call Owner
              </a>

              <a
                href={`https://wa.me/91${String(
                  property.contact || ""
                ).replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hi, I am interested in your property: ${property.title} at ${property.location}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-green-600 font-bold text-white shadow-lg transition hover:bg-green-700"
              >
                <MessageCircle size={20} />
                WhatsApp
              </a>

              <Link
                href={`/chat/${property.id}`}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 font-bold text-white shadow-lg transition hover:bg-slate-800"
              >
                <MessageCircle size={20} />
                Message
              </Link>
            </div>

            <div className="mt-10">
              <VisitBooking
                propertyId={property.id}
                propertyTitle={property.title}
                ownerContact={property.contact}
              />
            </div>
          </div>

          <OwnerCard
            ownerName={property.ownerName || "DirectNest Owner"}
            ownerEmail={property.ownerEmail || ""}
            contact={property.contact || ""}
            verified={property.verified !== false}
          />
        </div>

        <div className="mt-14">
          <SimilarProperties
            currentPropertyId={property.id}
            propertyType={property.type || ""}
          />
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-3 shadow-2xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          <a
            href={`tel:${String(property.contact || "").replace(/\D/g, "")}`}
            className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white"
          >
            <Phone size={20} />
            Call
          </a>

          <a
            href={`https://wa.me/91${String(
              property.contact || ""
            ).replace(/\D/g, "")}?text=${encodeURIComponent(
              `Hi, I am interested in your property: ${property.title}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 font-bold text-white"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}