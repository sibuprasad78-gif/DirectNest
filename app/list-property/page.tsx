"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ListPropertyPage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [rent, setRent] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please login first.");
      return;
    }

    try {
      await addDoc(collection(db, "properties"), {
        title,
        location,
        rent,
        type,
        description,
        contact,
        ownerId: auth.currentUser.uid,
        ownerEmail: auth.currentUser.email,
        createdAt: new Date(),
      });

      alert("Property Posted Successfully!");

      setTitle("");
      setLocation("");
      setRent("");
      setType("");
      setDescription("");
      setContact("");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-green-600">
          List Your Property
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Fill in the details below to post your property.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input type="text" placeholder="Property Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />

          <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />

          <input type="number" placeholder="Monthly Rent" value={rent} onChange={(e) => setRent(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />

          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-lg px-4 py-3" required>
            <option value="">Select Property Type</option>
            <option>Single Room</option>
            <option>1 BHK</option>
            <option>2 BHK</option>
            <option>3 BHK</option>
            <option>PG</option>
          </select>

          <textarea placeholder="Property Description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />

          <input type="tel" placeholder="Contact Number" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
            Post Property
          </button>
        </form>
      </div>
    </main>
  );
}