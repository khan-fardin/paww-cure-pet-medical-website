"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export function DocumentUploader({
  pets,
}: {
  pets: { id: string; name: string }[];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [type, setType] = useState("lab-report");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file: File) {
    setIsUploading(true);
    setMessage("");
    try {
      const presignResponse = await fetch("/api/documents/presign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          petId,
        }),
      });
      const presign = (await presignResponse.json()) as {
        data?: { key: string; uploadUrl: string };
        message?: string;
      };
      if (!presignResponse.ok || !presign.data) {
        throw new Error(presign.message ?? "Could not prepare upload");
      }

      const uploadResponse = await fetch(presign.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("S3 upload failed");

      const saveResponse = await fetch("/api/documents", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileSize: file.size,
          mimeType: file.type,
          petId,
          s3Key: presign.data.key,
          tags: ["user-upload"],
          title: file.name,
          type,
        }),
      });
      const savePayload = (await saveResponse.json()) as { message?: string };
      if (!saveResponse.ok) {
        throw new Error(savePayload.message ?? "Could not save document");
      }

      setMessage("Document uploaded securely.");
      if (inputRef.current) inputRef.current.value = "";
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  if (pets.length === 0) {
    return (
      <div className="rounded-[2rem] bg-amber-50 p-5 text-sm font-bold text-amber-900">
        Add a pet before uploading health documents.
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <UploadCloud className="h-5 w-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Upload health document</h2>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold"
          onChange={(event) => setPetId(event.target.value)}
          value={petId}
        >
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold"
          onChange={(event) => setType(event.target.value)}
          value={type}
        >
          <option value="lab-report">Lab report</option>
          <option value="vaccination">Vaccination</option>
          <option value="x-ray">X-ray or imaging</option>
          <option value="medical-record">Medical record</option>
          <option value="other">Other</option>
        </select>
      </div>
      <input
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="mt-4 block w-full rounded-2xl border border-dashed border-slate-300 p-4 text-sm"
        disabled={isUploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
        ref={inputRef}
        type="file"
      />
      {message ? (
        <p className="mt-3 text-sm font-bold text-slate-600">{message}</p>
      ) : null}
    </div>
  );
}
