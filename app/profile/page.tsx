"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";

export default function ProfilePage() {
  const [userName, setUserName] = useState("DirectNest User");
  const [email, setEmail] = useState("");
  const [propertyCount, setPropertyCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setUserName(user.displayName || "DirectNest User");
      setEmail(user.email || "");

      try {
        const ownerIdQuery = query(
          collection(db, "properties"),
          where("ownerId", "==", user.uid)
        );

        const ownerEmailQuery = query(
          collection(db, "properties"),
          where("ownerEmail", "==", user.email)
        );

        const favoritesQuery = query(
          collection(db, "favorites"),
          where("userId", "==", user.uid)
        );

        const ownerIdSnapshot = await getDocs(ownerIdQuery);
        const ownerEmailSnapshot = await getDocs(ownerEmailQuery);
        const favoritesSnapshot = await getDocs(favoritesQuery);

        const propertyIds = new Set<string>();

        ownerIdSnapshot.docs.forEach((doc) => propertyIds.add(doc.id));
        ownerEmailSnapshot.docs.forEach((doc) => propertyIds.add(doc.id));

        setPropertyCount(propertyIds.size);
        setFavoriteCount(favoritesSnapshot.size);
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
        <p className="text-xl text-gray-600">Loading profile...</p>
      </main>
    );
  }

  if (!auth.currentUser) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center gap-4">
        <h1 className="text-3xl font-bold">Please login first</h1>

        <Link href="/login">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Go to Login
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-blue-600 text-white text-5xl flex items-center justify-center">
            👤
          </div>

          <h1 className="text-3xl font-bold mt-5">{userName}</h1>

          <p className="text-gray-500 mt-2">{email}</p>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-10">
          <Link href="/dashboard">
            <div className="bg-blue-50 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-100">
              <h2 className="text-4xl font-bold text-blue-600">
                {propertyCount}
              </h2>

              <p className="mt-2 text-gray-600">My Properties</p>
            </div>
          </Link>

          <Link href="/favorites">
            <div className="bg-red-50 rounded-xl p-6 text-center cursor-pointer hover:bg-red-100">
              <h2 className="text-4xl font-bold text-red-600">
                {favoriteCount}
              </h2>

              <p className="mt-2 text-gray-600">Favorites</p>
            </div>
          </Link>
        </div>

        <div className="mt-10 bg-green-50 rounded-xl p-5 text-center">
          <h2 className="text-2xl font-bold text-green-700">
            Account Status
          </h2>

          <p className="mt-2 text-gray-700">
            ✅ Logged in successfully
          </p>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/">
            <button className="bg-gray-800 text-white px-5 py-3 rounded-lg">
              Home
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="bg-blue-600 text-white px-5 py-3 rounded-lg">
              Dashboard
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}