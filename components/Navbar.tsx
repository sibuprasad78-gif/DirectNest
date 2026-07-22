"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  Bell,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  UserCircle2,
  X,
  type LucideIcon,
} from "lucide-react";

import { auth } from "@/lib/firebase";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/list-property",
    label: "List Property",
    icon: Plus,
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: Heart,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserCircle2,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(href + "/");
}

type NavLinkItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  pathname: string;
  onNavigate: () => void;
};

function NavLinkItem({
  href,
  label,
  icon: Icon,
  pathname,
  onNavigate,
}: NavLinkItemProps) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-[52px] touch-manipulation items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
          : "text-slate-700 active:bg-slate-100"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const drawerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setLogoutError("");
    setIsSigningOut(true);

    try {
      await signOut(auth);

      closeMenu();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Logout failed. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8fafc]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link
            href="/"
            onClick={closeMenu}
            aria-label="Go to DirectNest home"
            className="touch-manipulation rounded-xl"
          >
            <Image
              src="/logo.png"
              alt="DirectNest"
              width={220}
              height={120}
              priority
              className="h-auto w-[135px] object-contain md:w-[165px]"
            />
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              aria-label="Open notifications"
              className={`flex h-12 w-12 touch-manipulation items-center justify-center rounded-2xl border shadow-sm transition active:scale-95 ${
                isActivePath(pathname, "/notifications")
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <Bell size={21} />
            </Link>

            <Link
              href="/profile"
              aria-label="Open profile"
              className={`hidden h-12 w-12 touch-manipulation items-center justify-center rounded-2xl border shadow-sm transition active:scale-95 sm:flex ${
                isActivePath(pathname, "/profile")
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <UserCircle2 size={22} />
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-95 active:bg-slate-100 xl:hidden"
            >
              <Menu size={22} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="hidden h-12 touch-manipulation items-center gap-2 rounded-2xl bg-red-50 px-4 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 xl:flex"
            >
              {isSigningOut ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              ) : (
                <LogOut size={18} />
              )}

              <span>{isSigningOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!isOpen}
        onClick={closeMenu}
        className={`fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed right-0 top-0 z-[70] flex h-[100dvh] w-[86%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out xl:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <Image
            src="/logo.png"
            alt="DirectNest"
            width={180}
            height={100}
            className="h-auto w-[135px] object-contain"
          />

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition active:scale-95 active:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Navigation
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            DirectNest Menu
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage properties and explore homes.
          </p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {navItems.map((item) => (
            <NavLinkItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              pathname={pathname}
              onNavigate={closeMenu}
            />
          ))}
        </nav>

        <div className="border-t border-slate-200 bg-white p-4">
          {logoutError && (
            <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-600">
              {logoutError}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="flex min-h-[52px] w-full touch-manipulation items-center justify-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition active:scale-[0.98] active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <LogOut size={20} />
            )}

            <span>{isSigningOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}