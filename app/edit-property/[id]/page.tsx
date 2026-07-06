"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

type Property = {
  title: string;
  location: string;
  rent: string;
  type: string;
  description: string;
  contact: string;
  imageUrl?: string;
  ownerId?: string;
};

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [rent, setRent] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const cloudName = "r4pgehpv";
  const uploadPreset = "directnest_upload";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const docRef = doc(db, "properties", propertyId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Property not found.");
          router.replace("/dashboard");
          return;
        }

        const property = docSnap.data() as Property;

        if (property.ownerId && property.ownerId !== user.uid) {
          alert("You can edit only your own property.");
          router.replace("/dashboard");
          return;
        }

        setTitle(property.title || "");
        setLocation(property.location || "");
        setRent(property.rent || "");
        setType(property.type || "");
        setDescription(property.description || "");
        setContact(property.contact || "");
        setCurrentImageUrl(property.imageUrl || "");
      } catch (error: any) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [propertyId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return currentImageUrl;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Image upload failed");
    }

    return data.secure_url;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const finalImageUrl = await uploadImageToCloudinary();

      const docRef = doc(db, "properties", propertyId);

      await updateDoc(docRef, {
        title,
        location,
        rent,
        type,
        description,
        contact,
        imageUrl: finalImageUrl,
        updatedAt: new Date(),
      });

      alert("Property Updated Successfully!");
      router.replace("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading property...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Edit Property
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Update your property details below.
        </p>

        <form onSubmit={handleUpdate} className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Property Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="number"
            placeholder="Monthly Rent"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          >
            <option value="">Select Property Type</option>
            <option>Single Room</option>
            <option>1 BHK</option>
            <option>2 BHK</option>
            <option>3 BHK</option>
            <option>PG</option>
          </select>

          <textarea
            placeholder="Property Description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="tel"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <div>
            <p className="font-semibold mb-2">Current / New Image</p>

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="New Property Preview"
                className="w-full h-64 object-cover rounded-xl mb-3"
              />
            ) : currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Current Property"
                className="w-full h-64 object-cover rounded-xl mb-3"
              />
            ) : (
              <div className="w-full h-64 bg-gray-300 rounded-xl mb-3 flex items-center justify-center text-gray-600">
                No Image Added
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {updating ? "Updating Property..." : "Update Property"}
          </button>
        </form>
      </div>
    </main>
  );
}