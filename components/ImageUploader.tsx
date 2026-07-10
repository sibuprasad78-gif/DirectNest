"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";

type ImageUploaderProps = {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function ImageUploader({
  images,
  setImages,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    const urls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );

    setImages((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-[30px] bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">
            Property Images
          </h2>

          <p className="mt-1 text-slate-500">
            Upload clear images of your property.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
        >
          <ImagePlus size={20} />
          Add Images
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={handleSelect}
      />

      {images.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-slate-300 py-16 text-center">
          <ImagePlus
            size={60}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-4 text-xl font-bold">
            No Images Selected
          </h3>

          <p className="mt-2 text-slate-500">
            Click <b>Add Images</b> to upload photos.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl"
            >
              <div className="relative h-56">
                <Image
                  src={image}
                  alt={`Property ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-3 top-3 rounded-full bg-red-600 p-2 text-white opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}