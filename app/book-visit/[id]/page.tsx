"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function BookVisitPage() {
  const params = useParams();
  const router = useRouter();

  const propertyId = params.id as string;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please login first.");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "visitRequests"), {
        propertyId,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        name,
        phone,
        visitDate,
        visitTime,
        message,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      alert("Visit Request Sent Successfully!");

      router.push("/");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          📅 Book Property Visit
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Fill the form below to request a property visit.
        </p>

        <form onSubmit={handleBooking} className="mt-8 space-y-5">

          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border-2 border-gray-300 bg-white text-black placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-blue-600"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border-2 border-gray-300 bg-white text-black placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-blue-600"
          />

          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            required
            className="w-full border-2 border-gray-300 bg-white text-black rounded-lg px-4 py-3 outline-none focus:border-blue-600"
          />

          <input
            type="time"
            value={visitTime}
            onChange={(e) => setVisitTime(e.target.value)}
            required
            className="w-full border-2 border-gray-300 bg-white text-black rounded-lg px-4 py-3 outline-none focus:border-blue-600"
          />

          <textarea
            placeholder="Additional Message (Optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full border-2 border-gray-300 bg-white text-black placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-blue-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
          >
            {loading ? "Sending Request..." : "📅 Book Visit"}
          </button>

        </form>

        <Link href="/">
          <button className="w-full mt-4 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg">
            ⬅ Back to Home
          </button>
        </Link>

      </div>
    </main>
  );
}