"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

type ModeratorAssignButtonProps = {
  disabled?: boolean;
  userId: string;
};

export function ModeratorAssignButton({
  disabled = false,
  userId,
}: ModeratorAssignButtonProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assignModerator() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: "mod" }),
      });

      const payload = (await response.json()) as {
        message?: string;
        success?: boolean;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Could not assign moderator role");
      }

      router.refresh();
    } catch (assignError) {
      setError(
        assignError instanceof Error
          ? assignError.message
          : "Could not assign moderator role"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={disabled || isSaving}
        onClick={assignModerator}
        type="button"
      >
        <UserPlus className="h-4 w-4" />
        {isSaving ? "Assigning..." : "Make Moderator"}
      </button>
      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
