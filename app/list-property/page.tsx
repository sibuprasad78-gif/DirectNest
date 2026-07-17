"use client";

import {
  ChangeEvent,
  ComponentType,
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Save,
} from "lucide-react";

import { db } from "@/lib/firebase";
import AmenitiesSelector from "@/components/AmenitiesSelector";
import ImageUploader from "@/components/ImageUploader";
import LocationPicker from "@/components/LocationPicker";

type PropertyFormData = {
  title: string;
  propertyType: string;
  bhk: string;
  rent: string;
  securityDeposit: string;
  description: string;
  contact: string;
};

type CompatibleAmenitiesSelectorProps = {
  amenities?: string[];
  setAmenities?: Dispatch<SetStateAction<string[]>>;
  selectedAmenities?: string[];
  setSelectedAmenities?: Dispatch<SetStateAction<string[]>>;
};

const CompatibleAmenitiesSelector =
  AmenitiesSelector as ComponentType<CompatibleAmenitiesSelectorProps>;

const initialFormData: PropertyFormData = {
  title: "",
  propertyType: "",
  bhk: "",
  rent: "",
  securityDeposit: "",
  description: "",
  contact: "",
};

export default function ListPropertyPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState<PropertyFormData>(initialFormData);

  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);

  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setSubmitError("");
    setSuccessMessage("");
  };

  const handleLocationChange = useCallback(
    (
      selectedLocation: string,
      selectedLatitude: number,
      selectedLongitude: number
    ) => {
      setLocation(selectedLocation);
      setLatitude(selectedLatitude);
      setLongitude(selectedLongitude);

      setSubmitError("");
      setSuccessMessage("");
    },
    []
  );

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const validateForm = (): string => {
    if (!formData.title.trim()) {
      return "Please enter a property title.";
    }

    if (!formData.propertyType) {
      return "Please select a property type.";
    }

    if (!formData.bhk) {
      return "Please select the property configuration.";
    }

    const rentAmount = Number(formData.rent);

    if (
      !formData.rent.trim() ||
      Number.isNaN(rentAmount) ||
      rentAmount <= 0
    ) {
      return "Please enter a valid monthly rent.";
    }

    if (formData.securityDeposit.trim()) {
      const depositAmount = Number(formData.securityDeposit);

      if (
        Number.isNaN(depositAmount) ||
        depositAmount < 0
      ) {
        return "Please enter a valid security deposit.";
      }
    }

    if (!location.trim()) {
      return "Please select the property location.";
    }

    if (
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude)
    ) {
      return "Please select the exact property position on the map.";
    }

    if (!formData.contact.trim()) {
      return "Please enter the owner's contact number.";
    }

    const cleanedContact = formData.contact.replace(/\D/g, "");

    if (
      cleanedContact.length < 10 ||
      cleanedContact.length > 12
    ) {
      return "Please enter a valid contact number.";
    }

    if (images.length === 0) {
      return "Please upload at least one property image.";
    }

    return "";
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setImages([]);
    setAmenities([]);

    setLocation("");
    setLatitude(null);
    setLongitude(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setSubmitError(validationError);
      scrollToTop();
      return;
    }

    if (
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude)
    ) {
      setSubmitError(
        "Please select the exact property position on the map."
      );
      scrollToTop();
      return;
    }

    setIsSubmitting(true);

    try {
      const rentAmount = Number(formData.rent);

      const securityDepositAmount =
        formData.securityDeposit.trim() !== ""
          ? Number(formData.securityDeposit)
          : 0;

      await addDoc(collection(db, "properties"), {
        title: formData.title.trim(),

        propertyType: formData.propertyType,
        type: formData.propertyType,

        bhk: formData.bhk,

        rent: rentAmount,
        monthlyRent: rentAmount,

        securityDeposit: securityDepositAmount,

        description: formData.description.trim(),

        contact: formData.contact.trim(),
        ownerContact: formData.contact.trim(),

        images,
        image: images[0] ?? "",

        amenities,

        location: location.trim(),
        latitude,
        longitude,

        coordinates: {
          latitude,
          longitude,
        },

        mapProvider: "OpenStreetMap",

        noBrokerage: true,
        isVerified: false,
        verifiedOwner: false,
        status: "active",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      resetForm();

      setSuccessMessage(
        "Property listed successfully. Location, latitude and longitude were saved in Firestore."
      );

      scrollToTop();

      window.setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Property submission error:", error);

      setSubmitError(
        "Property could not be submitted. Please check your Firestore rules and try again."
      );

      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Building2 className="h-4 w-4" />
            Direct owner listing
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            List your property
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Add complete property details and select the exact map
            location so renters can find the property easily.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {submitError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {submitError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-950">
                Basic property details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the main information renters should see.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Property title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Example: Spacious 2 BHK near Patia"
                  maxLength={100}
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="propertyType"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Property type
                  </label>

                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">
                      Select property type
                    </option>
                    <option value="Apartment">
                      Apartment
                    </option>
                    <option value="Independent House">
                      Independent House
                    </option>
                    <option value="Villa">
                      Villa
                    </option>
                    <option value="Room">
                      Single Room
                    </option>
                    <option value="PG">
                      PG
                    </option>
                    <option value="Hostel">
                      Hostel
                    </option>
                    <option value="Office">
                      Office
                    </option>
                    <option value="Shop">
                      Shop
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bhk"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Configuration
                  </label>

                  <select
                    id="bhk"
                    name="bhk"
                    value={formData.bhk}
                    onChange={handleInputChange}
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">
                      Select configuration
                    </option>
                    <option value="1 RK">
                      1 RK
                    </option>
                    <option value="1 BHK">
                      1 BHK
                    </option>
                    <option value="2 BHK">
                      2 BHK
                    </option>
                    <option value="3 BHK">
                      3 BHK
                    </option>
                    <option value="4 BHK">
                      4 BHK
                    </option>
                    <option value="4+ BHK">
                      4+ BHK
                    </option>
                    <option value="Single Room">
                      Single Room
                    </option>
                    <option value="Shared Room">
                      Shared Room
                    </option>
                    <option value="Not Applicable">
                      Not Applicable
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="rent"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Monthly rent
                  </label>

                  <div className="relative">
                    <IndianRupee className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="rent"
                      name="rent"
                      type="number"
                      value={formData.rent}
                      onChange={handleInputChange}
                      placeholder="10000"
                      min="1"
                      inputMode="numeric"
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="securityDeposit"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Security deposit
                  </label>

                  <div className="relative">
                    <IndianRupee className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="securityDeposit"
                      name="securityDeposit"
                      type="number"
                      value={formData.securityDeposit}
                      onChange={handleInputChange}
                      placeholder="Optional"
                      min="0"
                      inputMode="numeric"
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Property description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property, nearby places, floor, furnishing and availability..."
                  rows={5}
                  maxLength={1500}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {formData.description.length}/1500
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <MapPin className="h-5 w-5 text-blue-700" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Exact property location
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Location, latitude and longitude will be saved in
                  Firestore.
                </p>
              </div>
            </div>

            <LocationPicker
              location={location}
              latitude={latitude}
              longitude={longitude}
              onLocationChange={handleLocationChange}
            />
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-950">
                Property images
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Upload clear images of the room, building and
                surrounding area.
              </p>
            </div>

            <ImageUploader
              images={images}
              setImages={setImages}
            />
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-950">
                Available amenities
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select all facilities available with this property.
              </p>
            </div>

            <CompatibleAmenitiesSelector
              amenities={amenities}
              setAmenities={setAmenities}
              selectedAmenities={amenities}
              setSelectedAmenities={setAmenities}
            />
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl bg-green-50 p-2.5">
                <Phone className="h-5 w-5 text-green-700" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Owner contact
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Renters will use this number to contact the owner
                  directly.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="contact"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Contact number
              </label>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  inputMode="tel"
                  maxLength={15}
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 z-20 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving property...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Post property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}