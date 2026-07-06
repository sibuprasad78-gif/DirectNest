"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type NotificationItem = {
  id: string;
  propertyId: string;
  visitDate: string;
  visitTime: string;
  status: string;
  message?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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
        })) as NotificationItem[];

        setNotifications(data);
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
        <p className="text-xl text-gray-700">Loading notifications...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-4xl font-bold text-center mb-8">
        🔔 Notifications
      </h1>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-600">
          No notifications yet.
        </p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-5">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md p-6 border"
            >
              <h2 className="text-xl font-bold">
                Visit Request Update
              </h2>

              <p className="mt-2 text-gray-700">
                📅 Date: {item.visitDate}
              </p>

              <p className="mt-2 text-gray-700">
                ⏰ Time: {item.visitTime}
              </p>

              <p className="mt-3 font-bold">
                Status:{" "}
                <span
                  className={
                    item.status === "Accepted"
                      ? "text-green-600"
                      : item.status === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                >
                  {item.status}
                </span>
              </p>

              <Link
                href={`/property/${item.propertyId}`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
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