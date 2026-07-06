"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 p-5">

        <Link href="/">
          <h1 className="text-3xl font-bold text-blue-600 cursor-pointer">
            🏠 DirectNest
          </h1>
        </Link>

        <div className="flex flex-wrap justify-center items-center gap-3">

          <Link href="/">
            <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
              🏠 Home
            </button>
          </Link>

          <Link href="/favorites">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              ❤️ Favorites
            </button>
          </Link>

          <Link href="/my-bookings">
            <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
              📅 My Bookings
            </button>
          </Link>

          <Link href="/notifications">
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
              🔔 Notifications
            </button>
          </Link>

          <Link href="/profile">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              👤 Profile
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
              📊 Dashboard
            </button>
          </Link>

          <Link href="/list-property">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              ➕ List Property
            </button>
          </Link>

          {!loggedIn ? (
            <>
              <Link href="/login">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Login
                </button>
              </Link>

              <Link href="/signup">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  Signup
                </button>
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              🚪 Logout
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}