"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useState } from "react";

type ImageSliderProps = {
  images?: string[];
  title: string;
};

export default function ImageSlider({ images = [], title }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasImages = images.length > 0;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="relative h-52 overflow-hidden bg-slate-100">
      {hasImages ? (
        <Image
          src={images[currentIndex]}
          alt={title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Home size={64} className="text-slate-400" />
        </div>
      )}

      {hasImages && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}