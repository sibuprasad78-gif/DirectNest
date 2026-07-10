"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Home,
  Heart,
  Settings,
  ShieldCheck,
  KeyRound,
  LogOut,
  Mail,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handlePasswordChange = async () => {
    setMessage("");

    if (!user?.email) {
      setMessage("Email not found. Please login again.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage("Password reset link sent to your email.");
    } catch {
      setMessage("Unable to send password reset email.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-bold text-blue-600"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-2xl md:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 shadow-xl">
              <User size={46} className="text-white" />
            </div>

            <h1 className="mt-5 text-[32px] font-black text-[#0f172a]">
              {user?.displayName || "DirectNest User"}
            </h1>

            <p className="mt-2 flex items-center justify-center gap-2 text-slate-500">
              <Mail size={18} />
              {user?.email || "Not logged in"}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-blue-50 p-6 text-center">
              <p className="text-4xl font-black text-blue-600">3</p>
              <p className="mt-2 font-bold text-slate-700">My Properties</p>
            </div>

            <div className="rounded-[28px] bg-red-50 p-6 text-center">
              <p className="text-4xl font-black text-red-500">1</p>
              <p className="mt-2 font-bold text-slate-700">Favorites</p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} className="text-green-600" />
              <div>
                <h2 className="text-xl font-black text-green-700">
                  Account Status
                </h2>
                <p className="text-sm font-medium text-green-700">
                  Logged in successfully
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-[#0f172a]">
              <Settings size={24} />
              Settings
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={handlePasswordChange}
                className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-600 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <KeyRound size={24} className="text-blue-600" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Change Password
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Send password reset link to your email
                  </p>
                </div>
              </button>

              <Link
                href="/dashboard"
                className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-600 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50">
                  <LayoutDashboard size={24} className="text-purple-600" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">Dashboard</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage your properties
                  </p>
                </div>
              </Link>

              <Link
                href="/favorites"
                className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-600 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                  <Heart size={24} className="text-red-500" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Saved Properties
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    View your favorite homes
                  </p>
                </div>
              </Link>

              <Link
                href="/list-property"
                className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-600 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                  <Home size={24} className="text-green-600" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">List Property</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Post a new rental property
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {message && (
            <p
              className={`mt-5 rounded-2xl p-4 text-center text-sm font-bold ${
                message.includes("sent")
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white"
            >
              Home
            </Link>

            <button
              onClick={handleLogout}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 font-bold text-white shadow-lg hover:bg-red-700"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}