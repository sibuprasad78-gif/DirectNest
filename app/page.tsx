"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Home,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchSection from "@/components/SearchSection";
import FilterChips from "@/components/FilterChips";
import PropertyCard, { Property } from "@/components/PropertyCard";
import BottomNav from "@/components/BottomNav";

type PropertyTypeFilter =
  | "All"
  | "Room"
  | "1BHK"
  | "2BHK"
  | "3BHK"
  | "PG";

type SortOption = "latest" | "rent-low" | "rent-high";

const PROPERTY_FILTERS: PropertyTypeFilter[] = [
  "All",
  "Room",
  "1BHK",
  "2BHK",
  "3BHK",
  "PG",
];

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.replace(/[^\d.-]/g, ""));

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return 0;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
}

function normalizePropertyType(value: unknown): string {
  const propertyType = normalizeText(value);

  if (!propertyType) {
    return "Room";
  }

  const compactType = propertyType
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  const typeMap: Record<string, string> = {
    room: "Room",
    singleroom: "Room",
    "1room": "Room",
    "1bhk": "1BHK",
    onebhk: "1BHK",
    "2bhk": "2BHK",
    twobhk: "2BHK",
    "3bhk": "3BHK",
    threebhk: "3BHK",
    pg: "PG",
    hostel: "PG",
    payingguest: "PG",
  };

  return typeMap[compactType] ?? propertyType;
}

function getCreatedAtMilliseconds(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    try {
      return (value as { toMillis: () => number }).toMillis();
    } catch {
      return 0;
    }
  }

  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds?: unknown }).seconds === "number"
  ) {
    return (value as { seconds: number }).seconds * 1000;
  }

  if (typeof value === "string" || typeof value === "number") {
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  return 0;
}

function mapPropertyDocument(
  documentSnapshot: QueryDocumentSnapshot<DocumentData>
): Property {
  const data = documentSnapshot.data();

  const imageUrls = normalizeStringArray(
    data.imageUrls ?? data.images ?? data.photos
  );

  const primaryImage = normalizeText(
    data.imageUrl ?? data.image ?? data.thumbnail
  );

  const images =
    imageUrls.length > 0
      ? imageUrls
      : primaryImage
        ? [primaryImage]
        : [];

  const location =
    normalizeText(data.location) ||
    normalizeText(data.address) ||
    normalizeText(data.city) ||
    "Location not provided";

  const contact =
    normalizeText(data.contact) ||
    normalizeText(data.phone) ||
    normalizeText(data.phoneNumber) ||
    normalizeText(data.mobile) ||
    normalizeText(data.whatsapp);

  return {
    id: documentSnapshot.id,
    ...data,
    title:
      normalizeText(data.title) ||
      `${normalizePropertyType(data.type ?? data.propertyType)} for Rent`,
    location,
    address: normalizeText(data.address) || location,
    rent: normalizeNumber(
      data.rent ?? data.monthlyRent ?? data.price ?? data.amount
    ),
    type: normalizePropertyType(data.type ?? data.propertyType),
    description:
      normalizeText(data.description) ||
      normalizeText(data.details) ||
      "Contact the property owner directly for complete details.",
    contact,
    imageUrls: images,
    images,
    amenities: normalizeStringArray(data.amenities),
    latitude: normalizeNumber(data.latitude ?? data.lat),
    longitude: normalizeNumber(data.longitude ?? data.lng),
    verified:
      normalizeBoolean(data.verified) ||
      normalizeBoolean(data.isVerified) ||
      normalizeBoolean(data.verifiedOwner),
    isVerified:
      normalizeBoolean(data.isVerified) ||
      normalizeBoolean(data.verified) ||
      normalizeBoolean(data.verifiedOwner),
    noBrokerage:
      data.noBrokerage === undefined
        ? true
        : normalizeBoolean(data.noBrokerage),
    createdAt: data.createdAt ?? null,
  } as Property;
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<PropertyTypeFilter>("All");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const fetchProperties = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        let propertyDocuments: QueryDocumentSnapshot<DocumentData>[] = [];

        try {
          const propertiesQuery = query(
            collection(db, "properties"),
            orderBy("createdAt", "desc")
          );

          const orderedSnapshot = await getDocs(propertiesQuery);
          propertyDocuments = orderedSnapshot.docs;
        } catch (orderedQueryError) {
          console.warn(
            "Could not load properties using createdAt ordering. Falling back to an unordered query.",
            orderedQueryError
          );

          const fallbackSnapshot = await getDocs(
            collection(db, "properties")
          );

          propertyDocuments = fallbackSnapshot.docs;
        }

        const loadedProperties = propertyDocuments
          .map(mapPropertyDocument)
          .sort(
            (firstProperty, secondProperty) =>
              getCreatedAtMilliseconds(
                (secondProperty as Property & { createdAt?: unknown }).createdAt
              ) -
              getCreatedAtMilliseconds(
                (firstProperty as Property & { createdAt?: unknown }).createdAt
              )
          );

        setProperties(loadedProperties);
        setLastUpdatedAt(Date.now());
      } catch (fetchError) {
        console.error("Failed to load properties:", fetchError);

        setError(
          "We could not load properties right now. Please check your internet connection and try again."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void fetchProperties({ silent: true });
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        lastUpdatedAt &&
        Date.now() - lastUpdatedAt > 60_000
      ) {
        void fetchProperties({ silent: true });
      }
    };

    const handleOnline = () => {
      if (error) {
        void fetchProperties({ silent: true });
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [error, fetchProperties, lastUpdatedAt]);

  const filteredProperties = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const matchingProperties = properties.filter((property) => {
      const propertyType = normalizePropertyType(
        (property as Property & { type?: unknown }).type
      );

      const matchesSelectedFilter =
        selectedFilter === "All" ||
        propertyType.toLowerCase() === selectedFilter.toLowerCase();

      if (!matchesSelectedFilter) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      const searchableContent = [
        property.title,
        property.location,
        (property as Property & { address?: string }).address,
        property.description,
        propertyType,
        ...(Array.isArray(property.amenities)
          ? property.amenities
          : []),
      ]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedSearchQuery);
    });

    return [...matchingProperties].sort((firstProperty, secondProperty) => {
      const firstRent = normalizeNumber(firstProperty.rent);
      const secondRent = normalizeNumber(secondProperty.rent);

      if (sortOption === "rent-low") {
        return firstRent - secondRent;
      }

      if (sortOption === "rent-high") {
        return secondRent - firstRent;
      }

      return (
        getCreatedAtMilliseconds(
          (secondProperty as Property & { createdAt?: unknown }).createdAt
        ) -
        getCreatedAtMilliseconds(
          (firstProperty as Property & { createdAt?: unknown }).createdAt
        )
      );
    });
  }, [properties, searchQuery, selectedFilter, sortOption]);

  const verifiedPropertyCount = useMemo(() => {
    return properties.filter((property) => {
      const propertyData = property as Property & {
        verified?: boolean;
        isVerified?: boolean;
        verifiedOwner?: boolean;
      };

      return Boolean(
        propertyData.verified ||
          propertyData.isVerified ||
          propertyData.verifiedOwner
      );
    }).length;
  }, [properties]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFilter("All");
    setSortOption("latest");
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedFilter !== "All" ||
    sortOption !== "latest";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />

      <main className="pb-28 md:pb-12">
        <Hero />

        <section
          id="find-property"
          className="relative z-20 mx-auto -mt-5 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.10)] sm:p-6">
            <SearchSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <div className="mt-4">
              <FilterChips
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold text-slate-950 sm:text-2xl">
                    {isLoading ? "—" : `${properties.length}+`}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                    Properties
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BadgeCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold text-slate-950 sm:text-2xl">
                    {isLoading
                      ? "—"
                      : verifiedPropertyCount > 0
                        ? `${verifiedPropertyCount}+`
                        : "Verified"}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                    Property Owners
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Users className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold text-slate-950 sm:text-2xl">
                    Direct
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                    Owner Contact
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold text-slate-950 sm:text-2xl">
                    ₹0
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                    Brokerage Fee
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Find your next home
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Available Properties
                </h2>

                {!isLoading && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {filteredProperties.length}
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Explore brokerage-free properties and connect directly with
                property owners.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="property-sort" className="sr-only">
                Sort properties
              </label>

              <select
                id="property-sort"
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as SortOption)
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="latest">Latest first</option>
                <option value="rent-low">Rent: low to high</option>
                <option value="rent-high">Rent: high to low</option>
              </select>

              <button
                type="button"
                onClick={() => void fetchProperties({ silent: true })}
                disabled={isLoading || isRefreshing}
                aria-label="Refresh properties"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {isRefreshing && properties.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating available properties...
            </div>
          )}

          {isLoading ? (
            <div
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              aria-label="Loading properties"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-[16/10] animate-pulse bg-slate-200" />

                  <div className="space-y-4 p-5">
                    <div className="flex gap-2">
                      <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
                    </div>

                    <div className="h-6 w-4/5 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-4 w-3/5 animate-pulse rounded-lg bg-slate-200" />

                    <div className="flex items-center justify-between">
                      <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-200" />
                      <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle className="h-8 w-8" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                Properties could not be loaded
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void fetchProperties()}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Home className="h-8 w-8" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                {hasActiveFilters
                  ? "No matching properties found"
                  : "No properties available yet"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {hasActiveFilters
                  ? "Try another location, property type, or clear the active filters."
                  : "New brokerage-free properties will appear here after owners list them."}
              </p>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/list-property"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  List a Property
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                  <ShieldCheck className="h-4 w-4" />
                  Direct owner connection
                </div>

                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  Own a property? Find tenants without a broker.
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  Add property photos, rent, amenities and location. Interested
                  tenants can contact you directly through DirectNest.
                </p>
              </div>

              <Link
                href="/list-property"
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-slate-950 transition hover:bg-blue-50 active:scale-[0.98]"
              >
                List Property Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}