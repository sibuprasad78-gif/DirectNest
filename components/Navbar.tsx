"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Plus, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-[#f8fafc]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="DirectNest"
            width={220}
            height={120}
            priority
            className="h-auto w-[135px] object-contain md:w-[165px]"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/" className="font-bold text-blue-600">
            Home
          </Link>

          <Link
            href="/list-property"
            className="font-semibold text-slate-600 hover:text-blue-600"
          >
            List Property
          </Link>

          <Link
            href="/favorites"
            className="font-semibold text-slate-600 hover:text-blue-600"
          >
            Saved
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/list-property"
            className="hidden h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 font-bold text-white shadow-lg hover:bg-blue-700 md:flex"
          >
            <Plus size={19} />
            Post
          </Link>

          <Link
            href="/notifications"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm"
          >
            <Bell size={21} className="text-slate-700" />
          </Link>

          <Link
            href="/profile"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm sm:flex"
          >
            <User size={21} className="text-slate-700" />
          </Link>

          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm lg:hidden">
            <Menu size={21} className="text-slate-700" />
          </button>
        </div>
      </div>
    </header>
  );
}