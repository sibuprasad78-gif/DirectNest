"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

type PropertyGalleryProps = {
  images: string[];
};

export default function PropertyGallery({
  images,
}: PropertyGalleryProps) {
  const gallery =
    images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
        ];

  const [current, setCurrent] = useState(0);

  const nextImage = () => {
    setCurrent((prev) =>
      prev === gallery.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrent((prev) =>
      prev === 0 ? gallery.length - 1 : prev - 1
    );
  };

  return (
    <section className="mx-auto mt-6 max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-[34px] bg-slate-200 shadow-2xl">

        <div className="relative h-[260px] md:h-[500px]">

          <Image
            src={gallery[current]}
            alt="Property"
            fill
            priority
            className="object-cover"
          />

          {/* Previous */}

          {gallery.length > 1 && (
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Next */}

          {gallery.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg"
            >
              <ChevronRight size={26} />
            </button>
          )}

          {/* Counter */}

          <div className="absolute bottom-5 right-5 rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white">
            {current + 1} / {gallery.length}
          </div>

          {/* Fullscreen */}

          <button
            className="absolute left-5 top-5 rounded-full bg-white/90 p-3 shadow-lg"
          >
            <Maximize2 size={20} />
          </button>
        </div>

        {/* Thumbnails */}

        {gallery.length > 1 && (
          <div className="flex gap-3 overflow-x-auto bg-white p-4">
            {gallery.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`relative h-20 w-28 overflow-hidden rounded-2xl border-2 transition ${
                  current === index
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}