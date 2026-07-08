"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CloudinaryUpload,
  type CloudinaryAsset,
} from "@/components/ui/CloudinaryUpload";

export function ProfilePhotoForm({
  currentAvatar,
}: {
  currentAvatar?: string;
}) {
  const router = useRouter();
  const [asset, setAsset] = useState<CloudinaryAsset | null>(
    currentAvatar
      ? {
          bytes: 0,
          format: "image",
          originalFilename: "Current profile photo",
          publicId: "",
          resourceType: "image",
          secureUrl: currentAvatar,
        }
      : null,
  );
  const [message, setMessage] = useState<string | null>(null);

  async function save(uploaded: CloudinaryAsset) {
    setAsset(uploaded);
    setMessage("Saving profile photo...");

    const response = await fetch("/api/users/me", {
      body: JSON.stringify({
        avatarPublicId: uploaded.publicId,
        avatarUrl: uploaded.secureUrl,
      }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? (response.ok ? "Photo updated." : "Update failed."));

    if (response.ok) router.refresh();
  }

  return (
    <div className="max-w-xl space-y-3">
      <CloudinaryUpload
        accept="image/jpeg,image/png,image/webp"
        asset={asset}
        kind="avatar"
        label="Upload profile photo"
        onUploaded={(uploaded) => void save(uploaded)}
      />
      {message ? (
        <p className="text-sm font-bold text-slate-600">{message}</p>
      ) : null}
    </div>
  );
}
