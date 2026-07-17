"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useEffect, useState } from "react";

type ImageSliderProps = {
  images?: string[];
  title: string;
};

export default function ImageSlider({
  images = [],
  title,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images.filter(
    (image): image is string =>
      typeof image === "string" && image.trim().length > 0
  );

  const hasImages = validImages.length > 0;

  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, validImages.length]);

  const nextImage = () => {
    if (validImages.length <= 1) return;

    setCurrentIndex((previousIndex) =>
      previousIndex === validImages.length - 1 ? 0 : previousIndex + 1
    );
  };

  const previousImage = () => {
    if (validImages.length <= 1) return;

    setCurrentIndex((previousIndex) =>
      previousIndex === 0 ? validImages.length - 1 : previousIndex - 1
    );
  };

  return (
    <div className="relative h-52 overflow-hidden bg-slate-100 sm:h-56">
      {hasImages ? (
        <Image
          src={validImages[currentIndex]}
          alt={`${title} - image ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
            <Home size={34} className="text-slate-400" />
          </div>

          <p className="text-sm font-semibold text-slate-400">
            No property image
          </p>
        </div>
      )}

      {hasImages && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
      )}

      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={previousImage}
            aria-label="Previous property image"
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
          >
            <ChevronLeft size={21} />
          </button>

          <button
            type="button"
            onClick={nextImage}
            aria-label="Next property image"
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
          >
            <ChevronRight size={21} />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-3 py-2 backdrop-blur">
            {validImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`View image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === index
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {currentIndex + 1}/{validImages.length}
          </div>
        </>
      )}
    </div>
  );
}