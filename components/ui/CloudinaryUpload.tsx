"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { CheckCircle2, ImagePlus, LoaderCircle, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type CloudinaryAsset = {
  bytes: number;
  format: string;
  originalFilename: string;
  publicId: string;
  resourceType: "image" | "raw" | "video";
  secureUrl: string;
};

type UploadKind = "avatar" | "pet" | "vet-document";

type CloudinaryUploadProps = {
  accept: string;
  asset?: CloudinaryAsset | null;
  kind: UploadKind;
  label: string;
  onUploaded: (asset: CloudinaryAsset) => void;
};

type SignaturePayload = {
  allowedFormats: string[];
  apiKey: string;
  cloudName: string;
  folder: string;
  maxBytes: number;
  public_id: string;
  resourceType: "auto" | "image";
  signature: string;
  timestamp: number;
  type: "authenticated" | "upload";
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Upload service returned an invalid response (${response.status}).`,
    );
  }
}

export function CloudinaryUpload({
  accept,
  asset,
  kind,
  label,
  onUploaded,
}: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setError(null);
    setUploading(true);

    try {
      const signResponse = await fetch("/api/media/sign", {
        body: JSON.stringify({ kind }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const signed = await readJsonResponse<{
        data?: SignaturePayload;
        message?: string;
      }>(signResponse);
      if (!signResponse.ok || !signed.data) {
        throw new Error(signed.message ?? "Could not prepare upload.");
      }
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !signed.data.allowedFormats.includes(extension)) {
        throw new Error(
          `Unsupported file type. Allowed: ${signed.data.allowedFormats.join(
            ", ",
          )}.`,
        );
      }
      if (file.size > signed.data.maxBytes) {
        throw new Error(
          `File is too large. Maximum size is ${signed.data.maxBytes / 1024 / 1024} MB.`,
        );
      }

      const formData = new FormData();
      formData.set("file", file);
      formData.set("api_key", signed.data.apiKey);
      formData.set("timestamp", String(signed.data.timestamp));
      formData.set("signature", signed.data.signature);
      formData.set("folder", signed.data.folder);
      formData.set("public_id", signed.data.public_id);
      formData.set("type", signed.data.type);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.data.cloudName}/${signed.data.resourceType}/upload`,
        { body: formData, method: "POST" },
      );
      const uploaded = await readJsonResponse<{
        bytes?: number;
        error?: { message?: string };
        format?: string;
        original_filename?: string;
        public_id?: string;
        resource_type?: "image" | "raw" | "video";
        secure_url?: string;
      }>(uploadResponse);
      if (
        !uploadResponse.ok ||
        !uploaded.public_id ||
        !uploaded.secure_url ||
        !uploaded.resource_type
      ) {
        throw new Error(uploaded.error?.message ?? "Cloudinary upload failed.");
      }

      onUploaded({
        bytes: uploaded.bytes ?? file.size,
        format: uploaded.format ?? file.type,
        originalFilename: uploaded.original_filename ?? file.name,
        publicId: uploaded.public_id,
        resourceType: uploaded.resource_type,
        secureUrl: uploaded.secure_url,
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isPublicImage = kind !== "vet-document" && asset?.resourceType === "image";

  return (
    <div className="space-y-2">
      <input
        accept={accept}
        className="sr-only"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
        ref={inputRef}
        type="file"
      />
      <button
        className={cn(
          "flex min-h-28 w-full items-center gap-4 rounded-2xl border border-dashed p-4 text-left transition",
          asset
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/40",
        )}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {isPublicImage ? (
          <Image
            alt=""
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            height={80}
            src={asset.secureUrl}
            width={80}
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
            {uploading ? (
              <LoaderCircle className="h-6 w-6 animate-spin" />
            ) : asset ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : kind === "vet-document" ? (
              <UploadCloud className="h-6 w-6" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm font-bold text-slate-800">
            {uploading ? "Uploading..." : asset ? "Upload complete" : label}
          </span>
          <span className="mt-1 block truncate text-xs text-slate-500">
            {asset?.originalFilename ?? "Tap to choose a file"}
          </span>
        </span>
      </button>
      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
