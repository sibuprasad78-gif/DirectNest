"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = () => {
    setMessage("");

    if (!emailOrPhone) {
      setMessage("Please enter your email first.");
      return;
    }

    if (!emailOrPhone.includes("@")) {
      setMessage("Phone OTP will be connected next. For now, use email.");
      return;
    }

    setMessage("Email verification link will be sent after account creation.");
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!emailOrPhone.includes("@")) {
        setMessage("Phone signup will be connected next. For now, use email.");
        setLoading(false);
        return;
      }

      if (!otp) {
        setMessage("Please enter any OTP for now.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailOrPhone,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      await sendEmailVerification(userCredential.user);

      setMessage("Account created. Verification link sent to your email.");

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      setMessage("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setMessage("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch {
      setMessage("Google signup failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-[470px] rounded-[34px] bg-white px-6 py-8 shadow-2xl">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="DirectNest Logo"
            width={330}
            height={230}
            priority
            className="h-auto w-[370px] object-contain"
          />
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-[28px] font-extrabold leading-tight text-[#0f172a]">
            Create your DirectNest Account
          </h1>

          <p className="mt-3 text-[17px] text-slate-500">
            Signup to list and find properties
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-7 space-y-4">
          <div className="relative">
            <User
              size={23}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-5 text-[16px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-600"
              required
            />
          </div>

          <div className="relative">
            <Mail
              size={23}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Email / Phone Number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-5 text-[16px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-600"
              required
            />
          </div>

          <div className="relative">
            <Lock
              size={23}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-14 text-[16px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-600"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          <div className="relative">
            <ShieldCheck
              size={23}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-32 text-[16px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-600"
              required
            />

            <button
              type="button"
              onClick={handleSendOtp}
              className="absolute right-4 top-1/2 -translate-y-1/2 border-l border-slate-200 pl-4 text-[15px] font-bold text-blue-600"
            >
              Send OTP
            </button>
          </div>

          {message && (
            <p
              className={`text-center text-sm font-medium ${
                message.includes("created") ||
                message.includes("sent")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative mt-2 flex h-[60px] w-full items-center justify-center rounded-2xl bg-blue-600 text-[18px] font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            {!loading && <ArrowRight size={24} className="absolute right-8" />}
          </button>
        </form>

        <div className="my-7 flex items-center gap-5">
          <div className="h-px flex-1 bg-slate-200" />
          <p className="text-sm font-bold text-slate-500">OR</p>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="flex h-[58px] w-full items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white text-[16px] font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <span className="text-2xl font-black text-blue-600">G</span>
          Continue with Google
        </button>

        <p className="mt-7 text-center text-[16px] text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}