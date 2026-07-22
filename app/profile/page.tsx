"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Home,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const handlePasswordChange = async () => {
    if (isSendingReset) {
      return;
    }

    setMessage("");
    setMessageType("");

    if (!user?.email) {
      setMessage("Email not found. Please login again.");
      setMessageType("error");
      return;
    }

    setIsSendingReset(true);

    try {
      await sendPasswordResetEmail(auth, user.email);

      setMessage("Password reset link has been sent to your email.");
      setMessageType("success");
    } catch (error) {
      console.error("Password reset error:", error);

      setMessage("Unable to send the password reset email.");
      setMessageType("error");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setMessage("");
    setMessageType("");
    setIsLoggingOut(true);

    try {
      await signOut(auth);

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      setMessage("Logout failed. Please try again.");
      setMessageType("error");
      setIsLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 font-bold text-slate-600">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6 pb-28 lg:pb-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl px-2 font-bold text-blue-600 active:bg-blue-50"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 md:p-8">
          <section className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 shadow-xl shadow-blue-200">
              <User size={46} className="text-white" />
            </div>

            <h1 className="mt-5 break-words text-[30px] font-black text-slate-950 md:text-[34px]">
              {user?.displayName || "DirectNest User"}
            </h1>

            <p className="mt-2 flex flex-wrap items-center justify-center gap-2 break-all text-sm font-medium text-slate-500 sm:text-base">
              <Mail size={18} className="shrink-0" />
              {user?.email || "Not logged in"}
            </p>
          </section>

          <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="touch-manipulation rounded-[26px] bg-blue-50 p-5 text-center transition active:scale-[0.98] sm:p-6"
            >
              <p className="text-3xl font-black text-blue-600 sm:text-4xl">
                My
              </p>

              <p className="mt-2 text-sm font-bold text-slate-700 sm:text-base">
                Properties
              </p>
            </Link>

            <Link
              href="/favorites"
              className="touch-manipulation rounded-[26px] bg-red-50 p-5 text-center transition active:scale-[0.98] sm:p-6"
            >
              <Heart
                size={34}
                className="mx-auto text-red-500"
                fill="currentColor"
              />

              <p className="mt-2 text-sm font-bold text-slate-700 sm:text-base">
                Favorites
              </p>
            </Link>
          </section>

          <section className="mt-6 rounded-[28px] bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={28}
                className="shrink-0 text-green-600"
              />

              <div>
                <h2 className="text-xl font-black text-green-700">
                  Account Status
                </h2>

                <p className="mt-1 text-sm font-medium text-green-700">
                  {user
                    ? "Logged in successfully"
                    : "You are currently logged out"}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-slate-950">
              <Settings size={24} />
              Settings
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={isSendingReset || !user}
                className="flex min-h-[106px] w-full touch-manipulation items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] active:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-50 p-3">
                  {isSendingReset ? (
                    <Loader2
                      size={24}
                      className="animate-spin text-blue-600"
                    />
                  ) : (
                    <KeyRound size={24} className="text-blue-600" />
                  )}
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    {isSendingReset
                      ? "Sending Email..."
                      : "Change Password"}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Send a password reset link to your email
                  </p>
                </div>
              </button>

              <Link
                href="/dashboard"
                className="flex min-h-[106px] touch-manipulation items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] active:bg-slate-50"
              >
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-purple-50 p-3">
                  <LayoutDashboard
                    size={24}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Dashboard
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Manage your properties
                  </p>
                </div>
              </Link>

              <Link
                href="/favorites"
                className="flex min-h-[106px] touch-manipulation items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] active:bg-slate-50"
              >
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-red-50 p-3">
                  <Heart size={24} className="text-red-500" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Saved Properties
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    View your favorite homes
                  </p>
                </div>
              </Link>

              <Link
                href="/list-property"
                className="flex min-h-[106px] touch-manipulation items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] active:bg-slate-50"
              >
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-green-50 p-3">
                  <Home size={24} className="text-green-600" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    List Property
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Post a new rental property
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {message && (
            <p
              role="status"
              className={`mt-5 rounded-2xl p-4 text-center text-sm font-bold ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex min-h-[52px] flex-1 touch-manipulation items-center justify-center rounded-2xl bg-slate-900 px-4 font-bold text-white transition active:scale-[0.98]"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex min-h-[52px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 font-bold text-white shadow-lg transition active:scale-[0.98] active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut size={20} />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}