"use client";

import Link from "next/link";
import {
  BadgeCheck,
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
  rent: string;
  type: string;
  description: string;
  contact: string;
  imageUrls?: string[];
};

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const phoneNumber = property.contact?.replace(/\D/g, "");
  const whatsappMessage = `Hi, I am interested in your property: ${property.title} at ${property.location}.`;

  return (
    <div className="overflow-hidden rounded-[30px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <ImageSlider images={property.imageUrls || []} title={property.title} />

        <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-600 shadow-sm">
            No Brokerage
          </span>

          <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-green-600 shadow-sm">
            <BadgeCheck size={14} />
            Verified Owner
          </span>
        </div>

        <button
          type="button"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart size={20} className="text-slate-700" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-[#0f172a]">
              {property.title}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={16} />
              {property.location}
            </p>
          </div>

          <p className="text-right text-xl font-black text-blue-600">
            ₹{property.rent}
            <span className="block text-xs font-semibold text-slate-400">
              /month
            </span>
          </p>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {property.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
            {property.type}
          </span>

          <Link
            href={`/property/${property.id}`}
            className="text-sm font-bold text-blue-600"
          >
            View Details
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <a
            href={`tel:${phoneNumber}`}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white"
          >
            <Phone size={18} />
            Call
          </a>

          <a
            href={`https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
              whatsappMessage
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-600 text-sm font-bold text-white"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>

          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-sm font-bold text-slate-700"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}