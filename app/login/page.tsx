"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!emailOrPhone.includes("@")) {
        setMessage("For now, please login using email. Phone login will add next.");
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, emailOrPhone, password);
      router.push("/");
    } catch {
      setMessage("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage("");

    if (!emailOrPhone) {
      setMessage("Please enter your email first.");
      return;
    }

    if (!emailOrPhone.includes("@")) {
      setMessage("Password reset works with email only.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailOrPhone);
      setMessage("Password reset email sent. Check your Gmail.");
    } catch {
      setMessage("Unable to send reset email.");
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch {
      setMessage("Google login failed.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-[470px] rounded-[34px] bg-white px-6 py-8 shadow-2xl">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="DirectNest"
            width={330}
            height={220}
            priority
            className="w-[370px] h-auto object-contain"
          />
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-[30px] font-extrabold text-[#0f172a]">
            Welcome Back
          </h1>

          <p className="mt-2 text-[17px] font-medium text-slate-600">
            Login to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div className="relative">
            <Mail
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="text"
              placeholder="Email / Phone Number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
              className="h-[58px] w-full rounded-2xl border border-slate-300 bg-white pl-14 pr-5 text-[16px] font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Lock
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-[58px] w-full rounded-2xl border border-slate-300 bg-white pl-14 pr-14 text-[16px] font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700"
            >
              {showPassword ? <EyeOff size={23} /> : <Eye size={23} />}
            </button>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[15px] font-bold text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {message && (
            <p className="text-center text-sm font-semibold text-red-500">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-[60px] w-full rounded-2xl bg-blue-600 text-[18px] font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-300" />
          <span className="text-sm font-bold text-slate-600">OR</span>
          <div className="h-px flex-1 bg-slate-300" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white text-[16px] font-bold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <span className="text-2xl font-black text-blue-600">G</span>
          Continue with Google
        </button>

        <p className="mt-7 text-center text-[16px] font-medium text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-blue-600">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}