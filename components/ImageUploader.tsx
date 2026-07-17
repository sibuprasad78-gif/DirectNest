"use client";

import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  DragEvent,
  SetStateAction,
  useRef,
  useState,
} from "react";

type ImageUploaderProps = {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  maxImages?: number;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

const CLOUD_NAME = "r4pgehpv";
const UPLOAD_PRESET = "directnest";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ImageUploader({
  images,
  setImages,
  maxImages = 5,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const uploadSingleImage = async (file: File): Promise<string> => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok || !data.secure_url) {
      throw new Error(
        data.error?.message || "Cloudinary image upload failed."
      );
    }

    return data.secure_url;
  };

  const validateFiles = (selectedFiles: File[]) => {
    const remainingSlots = maxImages - images.length;

    if (remainingSlots <= 0) {
      setMessage(`Maximum ${maxImages} images are allowed.`);
      setMessageType("error");
      return [];
    }

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length !== selectedFiles.length) {
      setMessage("Only image files are allowed.");
      setMessageType("error");
    }

    const validSizeFiles = imageFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE
    );

    if (validSizeFiles.length !== imageFiles.length) {
      setMessage("Each image must be smaller than 5 MB.");
      setMessageType("error");
    }

    return validSizeFiles.slice(0, remainingSlots);
  };

  const uploadFiles = async (selectedFiles: File[]) => {
    setMessage("");
    setMessageType("");

    const filesToUpload = validateFiles(selectedFiles);

    if (filesToUpload.length === 0) {
      return;
    }

    setUploading(true);
    setProgress(0);

    const uploadedUrls: string[] = [];

    try {
      for (let index = 0; index < filesToUpload.length; index += 1) {
        const uploadedUrl = await uploadSingleImage(filesToUpload[index]);

        uploadedUrls.push(uploadedUrl);

        setProgress(
          Math.round(((index + 1) / filesToUpload.length) * 100)
        );
      }

      setImages((previousImages) => [
        ...previousImages,
        ...uploadedUrls,
      ]);

      setMessage(
        `${uploadedUrls.length} ${
          uploadedUrls.length === 1 ? "image" : "images"
        } uploaded successfully.`
      );
      setMessageType("success");
    } catch (error) {
      console.error("Cloudinary upload error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload images. Please try again."
      );
      setMessageType("error");
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleSelect = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    await uploadFiles(selectedFiles);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const selectedFiles = Array.from(event.dataTransfer.files || []);

    await uploadFiles(selectedFiles);
  };

  const removeImage = (indexToRemove: number) => {
    setImages((previousImages) =>
      previousImages.filter(
        (_, imageIndex) => imageIndex !== indexToRemove
      )
    );

    setMessage("Image removed from this property.");
    setMessageType("success");
  };

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Property Images
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Upload up to {maxImages} clear images. Maximum 5 MB each.
          </p>
        </div>

        <button
          type="button"
          disabled={uploading || images.length >= maxImages}
          onClick={() => inputRef.current?.click()}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {uploading ? (
            <>
              <LoaderCircle size={20} className="animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <ImagePlus size={20} />
              Add Images
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        hidden
        disabled={uploading}
        onChange={handleSelect}
      />

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploading && images.length < maxImages) {
            inputRef.current?.click();
          }
        }}
        className={`mt-7 cursor-pointer rounded-[26px] border-2 border-dashed px-5 py-12 text-center transition ${
          isDragging
            ? "border-blue-600 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/40"
        } ${
          uploading || images.length >= maxImages
            ? "pointer-events-none opacity-70"
            : ""
        }`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
          {uploading ? (
            <LoaderCircle
              size={32}
              className="animate-spin text-blue-600"
            />
          ) : (
            <UploadCloud size={34} className="text-blue-600" />
          )}
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          {uploading
            ? "Uploading property images"
            : "Choose images or drag them here"}
        </h3>

        <p className="mt-2 text-sm font-medium text-slate-500">
          JPG, PNG and WEBP files are supported.
        </p>

        <p className="mt-3 text-sm font-bold text-blue-600">
          {images.length}/{maxImages} images uploaded
        </p>
      </div>

      {uploading && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm font-bold text-slate-700">
            <span>Uploading to Cloudinary</span>
            <span>{progress}%</span>
          </div>

          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-sm font-bold ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle2 size={20} className="shrink-0" />
          ) : (
            <AlertCircle size={20} className="shrink-0" />
          )}

          <span>{message}</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <article
              key={`${image}-${index}`}
              className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 shadow-sm"
            >
              <div className="relative h-56">
                <Image
                  src={image}
                  alt={`Property image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              {index === 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">
                  Cover Photo
                </span>
              )}

              <button
                type="button"
                aria-label={`Remove property image ${index + 1}`}
                onClick={() => removeImage(index)}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex items-center justify-between bg-white px-4 py-3">
                <p className="text-sm font-bold text-slate-700">
                  Image {index + 1}
                </p>

                <CheckCircle2 size={18} className="text-green-600" />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}