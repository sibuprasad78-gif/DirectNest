"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Plus, User } from "lucide-react";

type BottomNavItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

const navItems: BottomNavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Post",
    href: "/list-property",
    icon: Plus,
  },
  {
    label: "Saved",
    href: "/favorites",
    icon: Heart,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-4 left-1/2 z-[55] w-[92%] max-w-md -translate-x-1/2 rounded-[28px] border border-slate-200 bg-white/95 px-3 py-2.5 shadow-2xl backdrop-blur-xl lg:hidden"
    >
      <div className="grid grid-cols-4 items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[58px] touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl px-2 transition active:scale-95 ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 active:bg-slate-100"
              }`}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.6 : 2}
                aria-hidden="true"
              />

              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}