import Link from "next/link";
import { Heart, Home, Plus, User } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 rounded-[28px] bg-white px-5 py-3 shadow-2xl lg:hidden">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex flex-col items-center gap-1 text-blue-600">
          <Home size={23} />
          <span className="text-xs font-bold">Home</span>
        </Link>

        <Link
          href="/list-property"
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <Plus size={23} />
          <span className="text-xs font-bold">Post</span>
        </Link>

        <Link
          href="/favorites"
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <Heart size={23} />
          <span className="text-xs font-bold">Saved</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <User size={23} />
          <span className="text-xs font-bold">Profile</span>
        </Link>
      </div>
    </nav>
  );
}