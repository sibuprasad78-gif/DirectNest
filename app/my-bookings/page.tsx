"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Booking = {
  id: string;
  propertyId: string;
  name: string;
  phone: string;
  visitDate: string;
  visitTime: string;
  message?: string;
  status: string;
  userEmail?: string;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "visitRequests"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })) as Booking[];

        setBookings(data);
      } catch (error: any) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-xl text-gray-700">Loading bookings...</p>
      </main>
    );
  }

  if (!auth.currentUser) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center gap-4">
        <h1 className="text-3xl font-bold text-black">Please login first</h1>

        <Link href="/login">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Go to Login
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-4xl font-bold text-center mb-3 text-black">
        📅 My Bookings
      </h1>

      <p className="text-center text-gray-600 mb-8">
        Track your property visit requests here.
      </p>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-600">
          You have not booked any visits yet.
        </p>
      ) : (
        <div className="max-w-5xl mx-auto space-y-5">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-md p-6 text-black border border-gray-200"
            >
              <p className="font-bold text-lg text-black">
                Property ID: {booking.propertyId}
              </p>

              <p className="mt-2 text-gray-700">👤 Name: {booking.name}</p>
              <p className="mt-2 text-gray-700">📞 Phone: {booking.phone}</p>
              <p className="mt-2 text-gray-700">
                📅 Date: {booking.visitDate}
              </p>
              <p className="mt-2 text-gray-700">
                ⏰ Time: {booking.visitTime}
              </p>

              {booking.message && (
                <p className="mt-2 text-gray-700">
                  📝 Message: {booking.message}
                </p>
              )}

              <p className="mt-3 font-bold text-black">
                Status:{" "}
                <span
                  className={
                    booking.status === "Accepted"
                      ? "text-green-600"
                      : booking.status === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                >
                  {booking.status}
                </span>
              </p>

              <Link
                href={`/property/${booking.propertyId}`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View Property
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}