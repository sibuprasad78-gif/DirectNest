"use client";

import { BadgeCheck, Mail, MessageCircle, Phone, User } from "lucide-react";

type OwnerCardProps = {
  ownerName: string;
  ownerEmail: string;
  contact: string;
  verified: boolean;
};

export default function OwnerCard({
  ownerName,
  ownerEmail,
  contact,
  verified,
}: OwnerCardProps) {
  const phoneNumber = String(contact || "").replace(/\D/g, "");
  const whatsappMessage = `Hi ${ownerName}, I am interested in your property listed on DirectNest.`;

  return (
    <aside className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg">
          <User size={30} className="text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-black text-slate-950">
              {ownerName}
            </h2>

            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                <BadgeCheck size={14} />
                Verified
              </span>
            )}
          </div>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Property Owner
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {ownerEmail && (
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <Mail size={20} className="text-blue-600" />

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="truncate text-sm font-semibold text-slate-800">
                {ownerEmail}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <Phone size={20} className="text-blue-600" />

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Contact
            </p>

            <p className="text-sm font-semibold text-slate-800">
              {contact || "Not available"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <a
          href={phoneNumber ? `tel:${phoneNumber}` : undefined}
          className={`flex h-12 items-center justify-center gap-2 rounded-2xl font-bold text-white ${
            phoneNumber
              ? "bg-blue-600 hover:bg-blue-700"
              : "pointer-events-none bg-slate-300"
          }`}
        >
          <Phone size={18} />
          Call
        </a>

        <a
          href={
            phoneNumber
              ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
                  whatsappMessage
                )}`
              : undefined
          }
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-12 items-center justify-center gap-2 rounded-2xl font-bold text-white ${
            phoneNumber
              ? "bg-green-600 hover:bg-green-700"
              : "pointer-events-none bg-slate-300"
          }`}
        >
          <MessageCircle size={18} />
          WhatsApp
        </a>
      </div>

      <div className="mt-6 rounded-2xl bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-700">
          Direct owner contact
        </p>

        <p className="mt-1 text-sm leading-6 text-blue-700/80">
          Contact the owner directly without any brokerage charges.
        </p>
      </div>
    </aside>
  );
}