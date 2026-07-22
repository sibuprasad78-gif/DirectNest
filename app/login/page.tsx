"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { auth } from "@/lib/firebase";

type MessageType = "success" | "error";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<MessageType>("error");

  const showError = (text: string) => {
    setMessageType("error");
    setMessage(text);
  };

  const showSuccess = (text: string) => {
    setMessageType("success");
    setMessage(text);
  };

  const getFirebaseError = (error: unknown) => {
    if (!(error instanceof FirebaseError)) {
      return "Something went wrong.";
    }

    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";

      case "auth/user-disabled":
        return "This account has been disabled.";

      case "auth/network-request-failed":
        return "Please check your internet connection.";

      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";

      case "auth/popup-closed-by-user":
        return "Google login cancelled.";

      case "auth/popup-blocked":
        return "Popup blocked by browser.";

      case "auth/cancelled-popup-request":
        return "Google login already in progress.";

      default:
        return error.message || "Login failed.";
    }
  };

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setLoginLoading(true);

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

     

      showSuccess("Login successful.");

      router.push("/");
      router.refresh();
    } catch (error) {
      showError(getFirebaseError(error));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage("");

    if (!email) {
      showError("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim().toLowerCase()
      );

      showSuccess(
        "Password reset email sent successfully."
      );
    } catch (error) {
      showError(getFirebaseError(error));
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(auth, provider);

      router.push("/");
      router.refresh();
    } catch (error) {
      showError(getFirebaseError(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading =
    loginLoading || googleLoading;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-6">
      <div className="w-full max-w-[470px] rounded-[34px] bg-white px-6 py-8 shadow-2xl">

        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="DirectNest"
            width={330}
            height={220}
            priority
            className="h-auto w-[330px] object-contain"
          />
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-[30px] font-extrabold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-[16px] text-slate-500">
            Login to your DirectNest account
          </p>
        </div>
        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4"
        >
          <div className="relative">
            <Mail
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
              }}
              disabled={isLoading}
              required
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-5 text-[16px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Lock
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMessage("");
              }}
              disabled={isLoading}
              required
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-14 text-[16px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? (
                <EyeOff size={22} />
              ) : (
                <Eye size={22} />
              )}
            </button>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="relative flex h-[60px] w-full items-center justify-center rounded-2xl bg-blue-600 text-[18px] font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginLoading ? (
              <>
                <LoaderCircle
                  size={22}
                  className="mr-2 animate-spin"
                />
                Logging in...
              </>
            ) : (
              <>
                Login
                <ArrowRight
                  size={22}
                  className="absolute right-7"
                />
              </>
            )}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-sm font-bold text-slate-500">
            OR
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-[16px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          {googleLoading ? (
            <LoaderCircle
              size={22}
              className="animate-spin"
            />
          ) : (
            <span className="text-2xl font-bold text-blue-600">
              G
            </span>
          )}

          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        <p className="mt-7 text-center text-[16px] text-slate-500">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}