"use client";

import {
  Wifi,
  Car,
  ShieldCheck,
  Dumbbell,
  Tv,
  Wind,
  Droplets,
  Zap,
  Trees,
  Building2,
  Check,
} from "lucide-react";

type AmenitiesProps = {
  amenities: string[];
};

const icons: Record<string, any> = {
  WiFi: Wifi,
  Parking: Car,
  CCTV: ShieldCheck,
  Gym: Dumbbell,
  TV: Tv,
  AC: Wind,
  Water: Droplets,
  "24x7 Water": Droplets,
  "Power Backup": Zap,
  Garden: Trees,
  Lift: Building2,
};

export default function Amenities({
  amenities,
}: AmenitiesProps) {
  return (
    <div className="rounded-[32px] bg-white p-8 shadow-xl">
      <h2 className="mb-6 text-3xl font-black">
        Amenities
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((item, index) => {
          const Icon = icons[item] || Check;

          return (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-500 hover:shadow-lg"
            >
              <div className="rounded-xl bg-blue-100 p-3">
                <Icon
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <span className="font-semibold text-slate-700">
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}