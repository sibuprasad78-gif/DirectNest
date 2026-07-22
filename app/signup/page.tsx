"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { auth } from "@/lib/firebase";

type MessageType = "success" | "error";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
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

  const getFirebaseErrorMessage = (error: unknown) => {
    if (!(error instanceof FirebaseError)) {
      return "Something went wrong. Please try again.";
    }

    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please login instead.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/weak-password":
        return "Password must contain at least 6 characters.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait and try again.";

      case "auth/popup-closed-by-user":
        return "Google signup was cancelled.";

      case "auth/popup-blocked":
        return "Google popup was blocked. Please allow popups and try again.";

      case "auth/cancelled-popup-request":
        return "Another Google signup request is already open.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using another login method.";

      case "auth/unauthorized-domain":
        return "This website domain is not authorized in Firebase.";

      case "auth/operation-not-allowed":
        return "This signup method is not enabled in Firebase.";

      default:
        return error.message || "Unable to create account.";
    }
  };

  const validateForm = () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      showError("Please enter your full name.");
      return false;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      showError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      showError("Password must contain at least 6 characters.");
      return false;
    }

    return true;
  };

  const handleSignup = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setSignupLoading(true);

    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      await updateProfile(userCredential.user, {
        displayName: cleanName,
      });

      await sendEmailVerification(userCredential.user);

      showSuccess(
        "Account created successfully. Please check your email and verify your account."
      );

      await signOut(auth);

      window.setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (error) {
      showError(getFirebaseErrorMessage(error));
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      showError(getFirebaseErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading = signupLoading || googleLoading;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-6">
      <div className="w-full max-w-[470px] rounded-[34px] bg-white px-6 py-8 shadow-2xl sm:px-8">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="DirectNest Logo"
            width={330}
            height={230}
            priority
            className="h-auto w-[330px] object-contain"
          />
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-[28px] font-extrabold leading-tight text-slate-900">
            Create your DirectNest Account
          </h1>

          <p className="mt-3 text-[16px] text-slate-500">
            Sign up to list and find properties
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="mt-7 space-y-4"
        >
          <div className="relative">
            <User
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setMessage("");
              }}
              autoComplete="name"
              disabled={isLoading}
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-5 text-[16px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              required
            />
          </div>

          <div className="relative">
            <Mail
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
              }}
              autoComplete="email"
              disabled={isLoading}
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-5 text-[16px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              required
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
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage("");
              }}
              autoComplete="new-password"
              minLength={6}
              disabled={isLoading}
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-14 text-[16px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              disabled={isLoading}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed"
            >
              {showPassword ? (
                <EyeOff size={23} />
              ) : (
                <Eye size={23} />
              )}
            </button>
          </div>

          <p className="px-1 text-xs leading-5 text-slate-500">
            Password must contain at least 6 characters.
          </p>

          {message && (
            <p
              role="alert"
              className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="relative mt-2 flex h-[60px] w-full items-center justify-center rounded-2xl bg-blue-600 text-[18px] font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signupLoading ? (
              <>
                <LoaderCircle
                  size={23}
                  className="mr-2 animate-spin"
                />
                Creating Account...
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight
                  size={24}
                  className="absolute right-8"
                />
              </>
            )}
          </button>
        </form>

        <div className="my-7 flex items-center gap-5">
          <div className="h-px flex-1 bg-slate-200" />

          <p className="text-sm font-bold text-slate-500">
            OR
          </p>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="flex h-[58px] w-full items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white text-[16px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <LoaderCircle
              size={22}
              className="animate-spin"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-2xl font-black text-blue-600 shadow-sm">
              G
            </span>
          )}

          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        <p className="mt-7 text-center text-[16px] text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}