"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

const SAVED_PROPERTIES_KEY = "directnest-saved-properties";

type Property = {
  id: string;
  title: string;
  location: string;
  rent: string;
  type: string;
  description: string;
  contact: string;
  imageUrls: string[];
};

function getSavedPropertyIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedData = localStorage.getItem(SAVED_PROPERTIES_KEY);

    if (!savedData) {
      return [];
    }

    const parsedData: unknown = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.filter(
      (id): id is string =>
        typeof id === "string" && id.trim().length > 0
    );
  } catch (error) {
    console.error("Unable to read saved properties:", error);
    return [];
  }
}

function formatPhoneNumber(contact: string) {
  const digits = contact.replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length === 12) {
    return digits.slice(2);
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return digits.slice(1);
  }

  return digits;
}

function formatRent(rent: string) {
  const numericRent = rent.replace(/[^\d]/g, "");

  if (!numericRent) {
    return rent;
  }

  return Number(numericRent).toLocaleString("en-IN");
}

export default function FavoritesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSavedProperties = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const savedIds = getSavedPropertyIds();

      if (savedIds.length === 0) {
        setProperties([]);
        return;
      }

      const querySnapshot = await getDocs(
        collection(db, "properties")
      );

      const allProperties: Property[] =
        querySnapshot.docs.map((document) => {
          const data = document.data();

          return {
            id: document.id,
            title: String(data.title || ""),
            location: String(data.location || ""),
            rent: String(data.rent || ""),
            type: String(data.type || ""),
            description: String(data.description || ""),
            contact: String(data.contact || ""),
            imageUrls: Array.isArray(data.imageUrls)
              ? data.imageUrls.filter(
                  (image): image is string =>
                    typeof image === "string"
                )
              : [],
          };
        });

      const propertyMap = new Map(
        allProperties.map((property) => [
          property.id,
          property,
        ])
      );

      const savedProperties = savedIds
        .map((propertyId) =>
          propertyMap.get(propertyId)
        )
        .filter(
          (property): property is Property =>
            property !== undefined
        );

      setProperties(savedProperties);
    } catch (loadError) {
      console.error(
        "Unable to load saved properties:",
        loadError
      );

      setError(
        "Saved properties load nahi ho paayi. Internet check karke dobara try karo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedProperties();
  }, [loadSavedProperties]);

  const handleRemove = (propertyId: string) => {
    try {
      const currentSavedIds = getSavedPropertyIds();

      const updatedSavedIds =
        currentSavedIds.filter(
          (savedId) => savedId !== propertyId
        );

      localStorage.setItem(
        SAVED_PROPERTIES_KEY,
        JSON.stringify(updatedSavedIds)
      );

      setProperties((currentProperties) =>
        currentProperties.filter(
          (property) => property.id !== propertyId
        )
      );
    } catch (removeError) {
      console.error(
        "Unable to remove saved property:",
        removeError
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mt-7">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
            Your Favourite Homes
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
            Saved Properties
          </h1>

          <p className="mt-2 text-slate-500">
            Your favourite properties ek jagah par.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 flex items-center justify-center gap-3 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <LoaderCircle
              size={26}
              className="animate-spin text-blue-600"
            />

            <p className="font-bold text-slate-600">
              Saved properties loading...
            </p>
          </div>
        ) : error ? (
          <div className="mt-12 rounded-[30px] border border-red-100 bg-white p-10 text-center shadow-sm">
            <Building2
              size={48}
              className="mx-auto text-red-400"
            />

            <h2 className="mt-4 text-2xl font-black text-slate-900">
              Unable to load properties
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadSavedProperties}
              className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="mt-12 rounded-[34px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-red-50">
              <Heart
                size={46}
                className="text-red-400"
              />
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-950">
              No saved properties
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">
              Home page me kisi property ka heart
              button dabao. Saved property yahan
              automatically dikh jayegi.
            </p>

            <Link
              href="/#properties"
              className="mt-7 inline-flex rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => {
              const phoneNumber =
                formatPhoneNumber(
                  property.contact || ""
                );

              const whatsappMessage =
                `Hi, I am interested in your property "${property.title}" located at ${property.location}. I found it on DirectNest.`;

              const propertyImage =
                property.imageUrls[0] ||
                "/placeholder-property.jpg";

              return (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-60 overflow-hidden bg-slate-200">
                    <img
                      src={propertyImage}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-blue-600 shadow">
                      No Brokerage
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(property.id)
                      }
                      aria-label="Remove saved property"
                      title="Remove saved property"
                      className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow-lg transition hover:scale-105 hover:bg-red-50"
                    >
                      <Heart
                        size={23}
                        className="fill-current"
                      />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 text-xl font-black leading-7 text-slate-950">
                          {property.title ||
                            "Untitled Property"}
                        </h2>

                        <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-slate-500">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-500"
                          />

                          <span className="line-clamp-2">
                            {property.location ||
                              "Location not provided"}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xl font-black text-blue-600">
                          ₹{formatRent(property.rent)}
                        </p>

                        <p className="text-xs font-semibold text-slate-400">
                          /month
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                        {property.type || "Property"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(property.id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                        Remove
                      </button>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2.5">
                      <Link
                        href={`/property/${property.id}`}
                        className="flex h-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Details
                      </Link>

                      <a
                        href={
                          phoneNumber
                            ? `tel:${phoneNumber}`
                            : undefined
                        }
                        aria-disabled={!phoneNumber}
                        className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold transition ${
                          phoneNumber
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "pointer-events-none bg-slate-200 text-slate-400"
                        }`}
                      >
                        <Phone size={17} />
                        Call
                      </a>

                      <a
                        href={
                          phoneNumber
                            ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
                                whatsappMessage
                              )}`
                            : undefined
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!phoneNumber}
                        className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold transition ${
                          phoneNumber
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "pointer-events-none bg-slate-200 text-slate-400"
                        }`}
                      >
                        <MessageCircle size={17} />
                        WA
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}