"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AmenitiesSelector from "@/components/AmenitiesSelector";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Car,
  FileText,
  Home,
  Image as ImageIcon,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Ruler,
  User,
} from "lucide-react";

export default function ListPropertyPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [rent, setRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [type, setType] = useState("1BHK");

  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [area, setArea] = useState("");
  const [furnished, setFurnished] = useState("Unfurnished");
  const [parking, setParking] = useState("No");
  const [availableFrom, setAvailableFrom] = useState("");
  const [preferredTenant, setPreferredTenant] = useState("Anyone");

  const [ownerName, setOwnerName] = useState("");
  const [contact, setContact] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const [description, setDescription] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const inputClass =
    "h-[58px] w-full rounded-2xl border-2 border-slate-300 bg-white pl-14 pr-5 text-[16px] font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const normalInputClass =
    "h-[58px] w-full rounded-2xl border-2 border-slate-300 bg-white px-5 text-[16px] font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const selectClass =
    "h-[58px] w-full rounded-2xl border-2 border-slate-300 bg-white px-5 text-[16px] font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const iconClass =
    "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-700";

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setRent("");
    setSecurityDeposit("");
    setType("1BHK");

    setBedrooms("1");
    setBathrooms("1");
    setArea("");
    setFurnished("Unfurnished");
    setParking("No");
    setAvailableFrom("");
    setPreferredTenant("Anyone");

    setOwnerName("");
    setContact("");
    setWhatsappNumber("");
    setOwnerEmail("");

    setDescription("");
    setImageUrlsText("");
    setSelectedAmenities([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const cleanContact = contact.replace(/\D/g, "");
    const cleanWhatsApp = whatsappNumber.replace(/\D/g, "");

    if (cleanContact.length !== 10) {
      setMessage("Please enter a valid 10-digit contact number.");
      setMessageType("error");
      return;
    }

    if (cleanWhatsApp && cleanWhatsApp.length !== 10) {
      setMessage("Please enter a valid 10-digit WhatsApp number.");
      setMessageType("error");
      return;
    }

    if (Number(rent) <= 0) {
      setMessage("Monthly rent must be greater than zero.");
      setMessageType("error");
      return;
    }

    if (area && Number(area) <= 0) {
      setMessage("Property area must be greater than zero.");
      setMessageType("error");
      return;
    }

    const imageUrls = imageUrlsText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const hasInvalidImageUrl = imageUrls.some((url) => {
      try {
        const parsedUrl = new URL(url);
        return !["http:", "https:"].includes(parsedUrl.protocol);
      } catch {
        return true;
      }
    });

    if (hasInvalidImageUrl) {
      setMessage("Please enter valid property image URLs.");
      setMessageType("error");
      return;
    }

    if (imageUrls.length > 5) {
      setMessage("You can add a maximum of 5 property images.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "properties"), {
        title: title.trim(),
        location: location.trim(),
        rent: Number(rent),
        securityDeposit: securityDeposit
          ? Number(securityDeposit)
          : 0,
        type,

        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: area ? Number(area) : 0,
        furnished,
        parking: parking === "Yes",
        availableFrom: availableFrom || "",
        preferredTenant,

        ownerName: ownerName.trim(),
        contact: cleanContact,
        whatsappNumber: cleanWhatsApp || cleanContact,
        ownerEmail: ownerEmail.trim(),

        description: description.trim(),
        amenities: selectedAmenities,
        imageUrls,

        status: "Available",
        verified: false,
        noBrokerage: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMessage("Property listed successfully!");
      setMessageType("success");

      resetForm();

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Property listing error:", error);
      setMessage("Unable to list property. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-bold text-blue-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 md:p-9">
          <header className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50">
              <Building2 size={32} className="text-blue-600" />
            </div>

            <h1 className="mt-4 text-[32px] font-black text-[#0f172a] md:text-[38px]">
              List Your Property
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-[16px] font-medium leading-7 text-slate-600">
              Add complete property details and connect directly with genuine
              renters without brokerage.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="mt-10 space-y-9">
            {/* Basic information */}
            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-black text-slate-950">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Add the main information renters will see first.
                </p>
              </div>

              <div className="grid gap-5">
                <div className="relative">
                  <Home className={iconClass} size={22} />

                  <input
                    type="text"
                    placeholder="Property Title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    minLength={5}
                    maxLength={100}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <MapPin className={iconClass} size={22} />

                  <input
                    type="text"
                    placeholder="Location / Area / City"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    required
                    minLength={3}
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="relative">
                    <IndianRupee className={iconClass} size={22} />

                    <input
                      type="number"
                      min="1"
                      placeholder="Monthly Rent"
                      value={rent}
                      onChange={(event) => setRent(event.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="relative">
                    <IndianRupee className={iconClass} size={22} />

                    <input
                      type="number"
                      min="0"
                      placeholder="Security Deposit"
                      value={securityDeposit}
                      onChange={(event) =>
                        setSecurityDeposit(event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className={selectClass}
                  >
                    <option value="Room">Room</option>
                    <option value="1BHK">1 BHK</option>
                    <option value="2BHK">2 BHK</option>
                    <option value="3BHK">3 BHK</option>
                    <option value="Flat">Flat</option>
                    <option value="PG">PG</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">Independent House</option>
                  </select>

                  <select
                    value={preferredTenant}
                    onChange={(event) =>
                      setPreferredTenant(event.target.value)
                    }
                    className={selectClass}
                  >
                    <option value="Anyone">Preferred Tenant: Anyone</option>
                    <option value="Family">Family</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Working Professional">
                      Working Professional
                    </option>
                  </select>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-200" />

            {/* Property details */}
            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-black text-slate-950">
                  Property Details
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Provide accurate specifications of the property.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <select
                  value={bedrooms}
                  onChange={(event) => setBedrooms(event.target.value)}
                  className={selectClass}
                >
                  <option value="0">No Separate Bedroom</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>

                <select
                  value={bathrooms}
                  onChange={(event) => setBathrooms(event.target.value)}
                  className={selectClass}
                >
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>

                <div className="relative">
                  <Ruler className={iconClass} size={22} />

                  <input
                    type="number"
                    min="1"
                    placeholder="Area in sq ft"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <select
                  value={furnished}
                  onChange={(event) => setFurnished(event.target.value)}
                  className={selectClass}
                >
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi Furnished">Semi Furnished</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                </select>

                <div className="relative">
                  <Car className={iconClass} size={22} />

                  <select
                    value={parking}
                    onChange={(event) => setParking(event.target.value)}
                    className={`${selectClass} pl-14`}
                  >
                    <option value="No">No Parking</option>
                    <option value="Yes">Parking Available</option>
                  </select>
                </div>

                <div className="relative">
                  <CalendarDays className={iconClass} size={22} />

                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(event) => setAvailableFrom(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-200" />

            {/* Owner information */}
            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-black text-slate-950">
                  Owner Information
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  These details will help renters contact you directly.
                </p>
              </div>

              <div className="grid gap-5">
                <div className="relative">
                  <User className={iconClass} size={22} />

                  <input
                    type="text"
                    placeholder="Owner Full Name"
                    value={ownerName}
                    onChange={(event) => setOwnerName(event.target.value)}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="relative">
                    <Phone className={iconClass} size={22} />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Contact Number"
                      value={contact}
                      onChange={(event) =>
                        setContact(
                          event.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="relative">
                    <Phone className={iconClass} size={22} />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="WhatsApp Number"
                      value={whatsappNumber}
                      onChange={(event) =>
                        setWhatsappNumber(
                          event.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className={iconClass} size={22} />

                  <input
                    type="email"
                    placeholder="Owner Email Address"
                    value={ownerEmail}
                    onChange={(event) => setOwnerEmail(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-200" />

            {/* Amenities selector */}
            <AmenitiesSelector
              selectedAmenities={selectedAmenities}
              setSelectedAmenities={setSelectedAmenities}
            />

            {/* Description */}
            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-black text-slate-950">
                  Property Description
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Explain important information about the property.
                </p>
              </div>

              <div className="relative">
                <FileText
                  className="pointer-events-none absolute left-5 top-5 text-slate-700"
                  size={22}
                />

                <textarea
                  placeholder="Describe the property, nearby facilities, rules and other useful information..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  minLength={20}
                  rows={6}
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white py-4 pl-14 pr-5 text-[16px] font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </section>

            {/* Images */}
            <section>
              <div className="mb-4">
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
                  <ImageIcon size={24} className="text-blue-600" />
                  Property Images
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Add up to 5 Cloudinary or Unsplash image URLs.
                </p>
              </div>

              <textarea
                placeholder={`Paste one image URL per line\nhttps://res.cloudinary.com/...\nhttps://images.unsplash.com/...`}
                value={imageUrlsText}
                onChange={(event) => setImageUrlsText(event.target.value)}
                rows={5}
                className="w-full rounded-2xl border-2 border-slate-300 bg-white p-5 text-[16px] font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-3 flex flex-col gap-1 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>Each image URL should be placed on a separate line.</p>

                <p>
                  {
                    imageUrlsText
                      .split("\n")
                      .map((url) => url.trim())
                      .filter(Boolean).length
                  }
                  /5 images
                </p>
              </div>
            </section>

            {message && (
              <div
                className={`rounded-2xl p-4 text-center text-sm font-bold ${
                  messageType === "success"
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-[62px] w-full rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Listing Property..." : "Post Property"}
            </button>

            <p className="text-center text-sm font-medium text-slate-500">
              Your property will be reviewed before receiving the verified
              badge.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}