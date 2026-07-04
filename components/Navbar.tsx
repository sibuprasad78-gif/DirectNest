import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-5">

        <Link href="/">
          <h1 className="text-3xl font-bold text-blue-600 cursor-pointer">
            🏠 DirectNest
          </h1>
        </Link>

        <div className="flex gap-4">

          <Link href="/login">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Login
            </button>
          </Link>

          <Link href="/list-property">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              List Property
            </button>
          </Link>

        </div>

      </div>
    </nav>
  );
}