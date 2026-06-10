"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export function SupportTicketForm() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function createTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: formData.get("category"),
          description: formData.get("description"),
          priority: formData.get("priority"),
          subject: formData.get("subject"),
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        success?: boolean;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Could not create support ticket");
      }

      setMessage("Support ticket opened. A moderator will respond here.");
      form.reset();
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create ticket"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={createTicket}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Subject
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
            name="subject"
            placeholder="Payment or call issue"
            required
            type="text"
          />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Category
          </span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
            name="category"
            required
          >
            <option value="consultation">Consultation</option>
            <option value="payment">Payment</option>
            <option value="account">Account</option>
            <option value="technical">Technical issue</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <label className="space-y-2 block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Priority
        </span>
        <select
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
          name="priority"
          required
        >
          <option value="medium">Normal</option>
          <option value="high">Urgent</option>
          <option value="critical">Consultation blocked</option>
          <option value="low">Low</option>
        </select>
      </label>

      <label className="space-y-2 block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          What happened?
        </span>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500"
          name="description"
          placeholder="Tell the moderator what you need help with..."
          required
        />
      </label>

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300 sm:w-auto"
        disabled={isSaving}
        type="submit"
      >
        <Send className="h-4 w-4" />
        {isSaving ? "Opening ticket..." : "Ask Moderator"}
      </button>

      {message ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
          {message}
        </p>
      ) : null}
    </form>
  );
}
