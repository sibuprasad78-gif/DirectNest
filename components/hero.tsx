export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 px-6 py-24 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-yellow-300 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        <p className="inline-block rounded-full bg-white/20 px-5 py-2 text-sm font-semibold mb-6">
          🏠 India&apos;s No Brokerage Rental Platform
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          Find Your Perfect Room <br />
          Without Brokerage
        </h1>

        <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
          DirectNest connects tenants directly with property owners. Search,
          save, book visits, and contact owners instantly.
        </p>
      </div>
    </section>
  );
}