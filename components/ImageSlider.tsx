"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ImageSliderProps = {
  images?: string[];
  title: string;
};

export default function ImageSlider({
  images = [],
  title,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const validImages = useMemo(() => {
    return images.filter(
      (image): image is string =>
        typeof image === "string" &&
        image.trim().length > 0 &&
        !failedImages.includes(image)
    );
  }, [images, failedImages]);

  const hasImages = validImages.length > 0;
  const currentImage = validImages[currentIndex];

  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, validImages.length]);

  const nextImage = () => {
    if (validImages.length <= 1) {
      return;
    }

    setCurrentIndex((previousIndex) =>
      previousIndex === validImages.length - 1 ? 0 : previousIndex + 1
    );
  };

  const previousImage = () => {
    if (validImages.length <= 1) {
      return;
    }

    setCurrentIndex((previousIndex) =>
      previousIndex === 0 ? validImages.length - 1 : previousIndex - 1
    );
  };

  const handleImageError = () => {
    if (!currentImage) {
      return;
    }

    setFailedImages((previousImages) =>
      previousImages.includes(currentImage)
        ? previousImages
        : [...previousImages, currentImage]
    );
  };

  return (
    <div className="relative h-52 touch-pan-y overflow-hidden bg-slate-100 sm:h-56">
      {hasImages && currentImage ? (
        <Image
          key={currentImage}
          src={currentImage}
          alt={`${title || "Property"} - image ${currentIndex + 1}`}
          fill
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-opacity duration-300"
          onError={handleImageError}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100">
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
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/60 bg-white/95 text-slate-800 shadow-md backdrop-blur transition active:scale-95 active:bg-white"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextImage}
            aria-label="Next property image"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/60 bg-white/95 text-slate-800 shadow-md backdrop-blur transition active:scale-95 active:bg-white"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-3 left-1/2 z-20 flex max-w-[58%] -translate-x-1/2 items-center gap-1.5 overflow-hidden rounded-full bg-black/45 px-3 py-2 backdrop-blur">
            {validImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={currentIndex === index}
                className={`h-2 touch-manipulation rounded-full transition-all ${
                  currentIndex === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {currentIndex + 1}/{validImages.length}
          </div>
        </>
      )}
    </div>
  );
}