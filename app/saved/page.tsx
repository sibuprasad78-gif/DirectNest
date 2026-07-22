"use client";

import Link from "next/link";

export default function SavedPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-3xl font-black text-slate-900">
        Saved Properties
      </h1>

      <p className="mt-3 text-slate-600">
        Saved page is working.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
      >
        Back to Home
      </Link>
    </main>
  );
}