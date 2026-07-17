"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";

type VisitBookingProps = {
  propertyId: string;
  propertyTitle: string;
  ownerContact: string;
};

export default function VisitBooking({
  propertyId,
  propertyTitle,
  ownerContact,
}: VisitBookingProps) {
  const [name, setName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const phoneNumber = ownerContact.replace(/\D/g, "");

  const normalizedPhoneNumber =
    phoneNumber.startsWith("91") && phoneNumber.length === 12
      ? phoneNumber
      : `91${phoneNumber}`;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !visitDate || !visitTime) {
      return;
    }

    const message = `Hi, my name is ${name}. I want to schedule a visit for "${propertyTitle}".

Property ID: ${propertyId}
Preferred date: ${visitDate}
Preferred time: ${visitTime}

I found this property on DirectNest.`;

    const whatsappUrl = `https://wa.me/${normalizedPhoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    setSubmitted(true);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-7 text-white md:px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <CalendarDays size={24} />
        </div>

        <h2 className="mt-4 text-2xl font-black md:text-3xl">
          Schedule a Property Visit
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
          Choose your preferred date and time. Your visit request will be sent
          directly to the property owner through WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6 md:p-8">
        <div>
          <label
            htmlFor="visitor-name"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Your name
          </label>

          <div className="relative">
            <User
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="visitor-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              required
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="visit-date"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Preferred date
            </label>

            <div className="relative">
              <CalendarDays
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(event) => setVisitDate(event.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="visit-time"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Preferred time
            </label>

            <div className="relative">
              <Clock3
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="visit-time"
                type="time"
                value={visitTime}
                onChange={(event) => setVisitTime(event.target.value)}
                required
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {submitted && (
          <div className="flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

            <p>
              WhatsApp opened successfully. Send the message to confirm your
              visit request with the owner.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!phoneNumber}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 font-bold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <MessageCircle size={20} />
          Request Visit on WhatsApp
        </button>

        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            <Phone size={20} />
            Call Property Owner
          </a>
        )}
      </form>
    </section>
  );
}