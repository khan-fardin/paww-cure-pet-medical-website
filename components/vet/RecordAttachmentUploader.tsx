"use client";

import { useRef, useState } from "react";
import { FileUp, Loader, Paperclip } from "lucide-react";

export function RecordAttachmentUploader({
  consultationId,
  petId,
}: {
  consultationId: string;
  petId: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<"idle" | "uploading" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function upload(file: File) {
    setState("uploading");
    setMessage("");

    try {
      const presignResponse = await fetch("/api/documents/presign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId,
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

      const documentResponse = await fetch("/api/documents", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Attached by vet to consultation record",
          fileSize: file.size,
          mimeType: file.type,
          petId,
          relatedConsultationId: consultationId,
          s3Key: presign.data.key,
          tags: ["consultation", "vet-attachment"],
          title: file.name,
          type: file.type === "application/pdf" ? "lab-report" : "medical-record",
        }),
      });
      const documentPayload = (await documentResponse.json()) as {
        message?: string;
      };
      if (!documentResponse.ok) {
        throw new Error(documentPayload.message ?? "Could not save attachment");
      }

      setState("saved");
      setMessage(`${file.name} attached successfully.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  }

  return (
    <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <Paperclip className="mt-1 h-5 w-5 text-emerald-600" />
        <div>
          <h2 className="font-bold text-slate-950">Record attachments</h2>
          <p className="mt-1 text-sm text-slate-500">
            Attach a lab report, scan, or supporting image. PDF, JPG, PNG, and
            WebP up to 15 MB.
          </p>
        </div>
      </div>

      <input
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="mt-5 block w-full rounded-2xl border border-dashed border-slate-300 p-4 text-sm"
        disabled={state === "uploading"}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
        ref={inputRef}
        type="file"
      />

      <div className="mt-4 flex items-center gap-2 text-sm font-bold">
        {state === "uploading" ? (
          <>
            <Loader className="h-4 w-4 animate-spin text-emerald-600" />
            Uploading securely...
          </>
        ) : (
          <FileUp className="h-4 w-4 text-slate-400" />
        )}
        {message ? (
          <span className={state === "error" ? "text-red-600" : "text-emerald-700"}>
            {message}
          </span>
        ) : null}
      </div>
    </section>
  );
}
