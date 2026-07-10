"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Home,
  ShieldCheck,
  Users,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchSection from "@/components/SearchSection";
import FilterChips from "@/components/FilterChips";
import PropertyCard, { Property } from "@/components/PropertyCard";
import BottomNav from "@/components/BottomNav";

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      setError("");

      try {
        const querySnapshot = await getDocs(collection(db, "properties"));

        const propertyList = querySnapshot.docs.map((document) => {
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
                  (image): image is string => typeof image === "string"
                )
              : [],
          };
        });

        setProperties(propertyList);
      } catch (fetchError) {
        console.error("Error fetching properties:", fetchError);
        setError("Properties could not be loaded. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const normalizeText = (value: string) =>
    value.toLowerCase().replace(/\s+/g, "").trim();

  const filteredProperties = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return properties.filter((property) => {
      const searchableText = [
        property.title,
        property.location,
        property.type,
        property.description,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchValue.length === 0 || searchableText.includes(searchValue);

      const matchesDropdown =
        propertyType === "All" ||
        normalizeText(property.type || "") === normalizeText(propertyType);

      const matchesChip =
        selectedFilter === "All" ||
        normalizeText(property.type || "") === normalizeText(selectedFilter);

      return matchesSearch && matchesDropdown && matchesChip;
    });
  }, [properties, search, propertyType, selectedFilter]);

  const handlePropertyTypeChange = (value: string) => {
    setPropertyType(value);

    if (value !== "All") {
      setSelectedFilter("All");
    }
  };

  const handleChipChange = (value: string) => {
    setSelectedFilter(value);

    if (value !== "All") {
      setPropertyType("All");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24 lg:pb-12">
      <Navbar />

      <Hero />

      <SearchSection
        search={search}
        setSearch={setSearch}
        propertyType={propertyType}
        setPropertyType={handlePropertyTypeChange}
      />

      <section className="mx-auto mt-8 w-full max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
              <Home size={22} className="text-blue-600" />
            </div>

            <p className="mt-4 text-2xl font-black text-slate-950">
              {properties.length}+
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Properties
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50">
              <BadgeCheck size={22} className="text-green-600" />
            </div>

            <p className="mt-4 text-2xl font-black text-slate-950">Verified</p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Property Owners
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50">
              <Users size={22} className="text-purple-600" />
            </div>

            <p className="mt-4 text-2xl font-black text-slate-950">Direct</p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Owner Contact
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50">
              <ShieldCheck size={22} className="text-orange-600" />
            </div>

            <p className="mt-4 text-2xl font-black text-slate-950">₹0</p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Brokerage Fee
            </p>
          </div>
        </div>
      </section>

      <FilterChips
        selectedFilter={selectedFilter}
        setSelectedFilter={handleChipChange}
      />

      <section
        id="properties"
        className="mx-auto mt-8 w-full max-w-7xl px-4 md:px-8"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">
              Explore Homes
            </p>

            <h2 className="mt-1 text-[26px] font-black text-[#0f172a] md:text-[32px]">
              Available Properties
            </h2>

            {!loading && !error && (
              <p className="mt-1 text-sm font-medium text-slate-500">
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1
                  ? "property found"
                  : "properties found"}
              </p>
            )}
          </div>

          {(search || propertyType !== "All" || selectedFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPropertyType("All");
                setSelectedFilter("All");
              }}
              className="w-fit rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-300"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[30px] bg-white shadow-sm"
                >
                  <div className="h-52 animate-pulse bg-slate-200" />

                  <div className="space-y-4 p-5">
                    <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-sm">
              <Building2 size={50} className="mx-auto text-red-400" />

              <h3 className="mt-4 text-2xl font-black text-slate-900">
                Unable to load properties
              </h3>

              <p className="mx-auto mt-2 max-w-md text-slate-500">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-blue-50">
                <Building2 size={42} className="text-blue-600" />
              </div>

              <h3 className="mt-5 text-2xl font-black text-slate-900">
                No matching properties found
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-slate-500">
                Try changing the location, property type, or filter to see more
                homes.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPropertyType("All");
                    setSelectedFilter("All");
                  }}
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                  Clear Search
                </button>

                <Link
                  href="/list-property"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 transition hover:border-blue-600 hover:text-blue-600"
                >
                  Post a Property
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 md:px-8">
        <div className="overflow-hidden rounded-[34px] bg-[#0f172a] px-6 py-10 text-center text-white shadow-2xl md:px-12 md:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            Have a property?
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight md:text-4xl">
            List your property and connect directly with genuine renters.
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Post your room, flat, PG, or apartment and manage renter enquiries
            without brokerage.
          </p>

          <Link
            href="/list-property"
            className="mt-7 inline-flex rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            Post Your Property
          </Link>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}