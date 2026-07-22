"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";

import ImageSlider from "./ImageSlider";

export type Property = {
  id: string;
  title: string;
  location: string;
  rent: string | number;
  type: string;
  description: string;
  contact: string;
  imageUrls?: string[];
  images?: string[];
  amenities?: string[];
  address?: string;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
  isVerified?: boolean;
  noBrokerage?: boolean;
  createdAt?: unknown;
};

type PropertyCardProps = {
  property: Property;
};

const SAVED_PROPERTIES_KEY = "directnest-saved-properties";

function formatPhoneNumber(contact: string | number | null | undefined) {
  const contactValue =
    contact === null || contact === undefined ? "" : String(contact);

  const digits = contactValue.replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length === 12) {
    return digits.slice(2);
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return digits.slice(1);
  }

  return digits;
}

function formatRent(rent: string | number | null | undefined) {
  if (rent === null || rent === undefined || rent === "") {
    return "Price on request";
  }

  if (typeof rent === "number") {
    if (!Number.isFinite(rent)) {
      return "Price on request";
    }

    return rent.toLocaleString("en-IN");
  }

  const numericRent = Number(rent.replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(numericRent)) {
    return rent;
  }

  return numericRent.toLocaleString("en-IN");
}

function getPropertyImages(property: Property) {
  if (Array.isArray(property.imageUrls) && property.imageUrls.length > 0) {
    return property.imageUrls.filter(
      (image): image is string =>
        typeof image === "string" && image.trim().length > 0
    );
  }

  if (Array.isArray(property.images) && property.images.length > 0) {
    return property.images.filter(
      (image): image is string =>
        typeof image === "string" && image.trim().length > 0
    );
  }

  return [];
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const phoneNumber = formatPhoneNumber(property.contact);
  const propertyImages = getPropertyImages(property);

  const whatsappMessage = `Hi, I am interested in your property "${
    property.title || "Property"
  }" located at ${
    property.location || "the listed location"
  }. I found it on DirectNest.`;

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(SAVED_PROPERTIES_KEY);
      const parsedValue: unknown = storedValue
        ? JSON.parse(storedValue)
        : [];

      const savedProperties = Array.isArray(parsedValue)
        ? parsedValue.filter(
            (value): value is string => typeof value === "string"
          )
        : [];

      setIsSaved(savedProperties.includes(property.id));
    } catch {
      setIsSaved(false);
    }
  }, [property.id]);

  const handleSave = () => {
    try {
      const storedValue = localStorage.getItem(SAVED_PROPERTIES_KEY);
      const parsedValue: unknown = storedValue
        ? JSON.parse(storedValue)
        : [];

      const savedProperties = Array.isArray(parsedValue)
        ? parsedValue.filter(
            (value): value is string => typeof value === "string"
          )
        : [];

      const updatedProperties = savedProperties.includes(property.id)
        ? savedProperties.filter((id) => id !== property.id)
        : [...savedProperties, property.id];

      localStorage.setItem(
        SAVED_PROPERTIES_KEY,
        JSON.stringify(updatedProperties)
      );

      setIsSaved(updatedProperties.includes(property.id));
    } catch (error) {
      console.error("Unable to save property:", error);
    }
  };

  const handleShare = async () => {
    const propertyPath = `/property/${property.id}`;

    const propertyUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${propertyPath}`
        : propertyPath;

    const shareData = {
      title: property.title || "DirectNest Property",
      text: `${property.title || "Property"} in ${
        property.location || "the listed location"
      } for ₹${formatRent(property.rent)}/month`,
      url: propertyUrl,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(propertyUrl);
      } else if (typeof window !== "undefined") {
        window.prompt("Copy this property link:", propertyUrl);
      }

      setIsShared(true);

      window.setTimeout(() => {
        setIsShared(false);
      }, 2000);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Unable to share property:", error);
      }
    }
  };

  const showVerifiedBadge =
    property.verified !== false && property.isVerified !== false;

  const showNoBrokerageBadge = property.noBrokerage !== false;

  return (
    <article className="group overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <ImageSlider
          images={propertyImages}
          title={property.title || "Property"}
        />

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex max-w-[calc(100%-72px)] flex-wrap gap-2 sm:left-4 sm:top-4">
          {showNoBrokerageBadge && (
            <span className="rounded-full border border-white/60 bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-blue-600 shadow-sm backdrop-blur">
              No Brokerage
            </span>
          )}

          {showVerifiedBadge && (
            <span className="flex items-center gap-1 rounded-full border border-white/60 bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-green-600 shadow-sm backdrop-blur">
              <BadgeCheck size={14} />
              Verified Owner
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          aria-label={
            isSaved ? "Remove saved property" : "Save property"
          }
          title={isSaved ? "Remove from saved" : "Save property"}
          className={`absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-md backdrop-blur transition sm:right-4 sm:top-4 ${
            isSaved
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-white/60 bg-white/95 text-slate-700 hover:text-red-500"
          }`}
        >
          <Heart
            size={21}
            className={isSaved ? "fill-current" : ""}
          />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link href={`/property/${property.id}`}>
              <h3 className="line-clamp-2 text-xl font-black leading-7 text-[#0f172a] transition group-hover:text-blue-600">
                {property.title || "Untitled Property"}
              </h3>
            </Link>

            <p className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-slate-500">
              <MapPin
                size={16}
                className="mt-0.5 shrink-0 text-blue-500"
              />

              <span className="line-clamp-2">
                {property.location || "Location not provided"}
              </span>
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xl font-black text-blue-600">
              {formatRent(property.rent) === "Price on request"
                ? "Price on request"
                : `₹${formatRent(property.rent)}`}
            </p>

            {formatRent(property.rent) !== "Price on request" && (
              <span className="text-xs font-semibold text-slate-400">
                per month
              </span>
            )}
          </div>
        </div>

        <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
          {property.description ||
            "No property description provided."}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
            {property.type || "Property"}
          </span>

          <Link
            href={`/property/${property.id}`}
            className="rounded-xl px-3 py-2 text-sm font-extrabold text-blue-600 transition hover:bg-blue-50"
          >
            View Details
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <a
            href={phoneNumber ? `tel:${phoneNumber}` : undefined}
            aria-disabled={!phoneNumber}
            onClick={(event) => {
              if (!phoneNumber) {
                event.preventDefault();
              }
            }}
            className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold transition ${
              phoneNumber
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                : "pointer-events-none bg-slate-200 text-slate-400"
            }`}
          >
            <Phone size={18} />
            <span>Call</span>
          </a>

          <a
            href={
              phoneNumber
                ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
                    whatsappMessage
                  )}`
                : undefined
            }
            target={phoneNumber ? "_blank" : undefined}
            rel={phoneNumber ? "noopener noreferrer" : undefined}
            aria-disabled={!phoneNumber}
            onClick={(event) => {
              if (!phoneNumber) {
                event.preventDefault();
              }
            }}
            className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold transition ${
              phoneNumber
                ? "bg-green-600 text-white shadow-sm hover:bg-green-700"
                : "pointer-events-none bg-slate-200 text-slate-400"
            }`}
          >
            <MessageCircle size={18} />
            <span className="truncate">WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            {isShared ? (
              <>
                <Check size={18} className="text-green-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 size={18} />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}