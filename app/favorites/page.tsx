"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Phone,
  MessageCircle,
  Trash2,
  Home,
} from "lucide-react";

const savedProperties = [
  {
    id: "1",
    title: "1 BHK Room Near KIIT",
    location: "Patia, Bhubaneswar",
    rent: "9000",
    type: "1 BHK",
    contact: "9876543210",
    image:
      "https://res.cloudinary.com/r4pgehpv/image/upload/v1783362126/xeoadk0lymuqy4nmtais.jpg",
  },
];

export default function FavoritesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-bold text-blue-600"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 shadow-sm">
            <Heart size={34} className="fill-red-500 text-red-500" />
          </div>

          <h1 className="mt-4 text-[34px] font-black text-[#0f172a]">
            Saved Properties
          </h1>

          <p className="mt-2 text-slate-500">
            Your favorite homes in one place.
          </p>
        </div>

        {savedProperties.length === 0 ? (
          <div className="rounded-[32px] bg-white p-8 text-center shadow-xl">
            <Home size={52} className="mx-auto text-slate-400" />

            <h2 className="mt-4 text-2xl font-black text-slate-900">
              No saved properties yet
            </h2>

            <p className="mt-2 text-slate-500">
              Tap heart on any property to save it here.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {savedProperties.map((property) => {
              const phoneNumber = property.contact.replace(/\D/g, "");
              const whatsappText = `Hi, I am interested in your property: ${property.title}`;

              return (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-[30px] bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-56 bg-slate-100">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />

                    <button className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">
                      <Heart size={22} className="fill-red-500 text-red-500" />
                    </button>

                    <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-black text-blue-600 shadow">
                      No Brokerage
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-[#0f172a]">
                          {property.title}
                        </h2>

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

                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                        {property.type}
                      </span>

                      <button className="flex items-center gap-1 text-sm font-bold text-red-500">
                        <Trash2 size={17} />
                        Remove
                      </button>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <Link
                        href={`/property/${property.id}`}
                        className="flex h-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white"
                      >
                        Details
                      </Link>

                      <a
                        href={`tel:${phoneNumber}`}
                        className="flex h-12 items-center justify-center gap-1 rounded-2xl bg-slate-900 text-sm font-bold text-white"
                      >
                        <Phone size={17} />
                        Call
                      </a>

                      <a
                        href={`https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
                          whatsappText
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-12 items-center justify-center gap-1 rounded-2xl bg-green-600 text-sm font-bold text-white"
                      >
                        <MessageCircle size={17} />
                        WA
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}