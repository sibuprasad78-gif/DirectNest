import Link from "next/link";
import { ArrowRight, BadgeCheck, Home, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-8 lg:pt-10">
      <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
            <ShieldCheck size={17} />
            No Brokerage Rental Platform
          </p>

          <h1 className="text-[34px] font-black leading-tight tracking-tight text-[#0f172a] md:text-[48px] lg:text-[58px]">
            Find your home
            <br />
            without brokerage
          </h1>

          <p className="mt-4 max-w-2xl text-[16px] leading-7 text-slate-500 md:text-lg">
            Search rooms, flats, PGs and apartments. Connect directly with
            verified property owners and save brokerage charges.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/list-property"
              className="inline-flex h-[56px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-base font-bold text-white shadow-lg hover:bg-blue-700"
            >
              List Property
              <ArrowRight size={20} />
            </Link>

            <Link
              href="#properties"
              className="inline-flex h-[56px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-bold text-slate-700 shadow-sm hover:text-blue-600"
            >
              Browse Homes
            </Link>
          </div>
        </div>

        <div className="rounded-[34px] bg-white p-4 shadow-xl">
          <div className="rounded-[28px] bg-blue-600 p-6 text-white md:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Home size={30} />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-100">
              DirectNest Promise
            </p>

            <h2 className="mt-3 text-2xl font-black leading-tight md:text-3xl">
              Direct owner contact. Zero broker headache.
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-100 md:text-base">
              Verified owners, transparent rent details, and fast contact
              options for renters.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/15 p-4">
                <BadgeCheck size={22} />
                <p className="mt-2 text-sm font-bold">Verified Owners</p>
              </div>

              <div className="rounded-2xl bg-white/15 p-4">
                <ShieldCheck size={22} />
                <p className="mt-2 text-sm font-bold">No Brokerage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}