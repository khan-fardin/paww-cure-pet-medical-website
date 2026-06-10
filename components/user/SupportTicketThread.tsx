"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareReply, PhoneCall } from "lucide-react";

type SupportTicketThreadProps = {
  callStartedAt?: string;
  messages: {
    message: string;
    senderType: string;
    timestamp: string;
  }[];
  status: string;
  ticketId: string;
};

export function SupportTicketThread({
  callStartedAt,
  messages,
  status,
  ticketId,
}: SupportTicketThreadProps) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isClosed = status === "closed";

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reply.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reply", message: reply }),
      });

      const payload = (await response.json()) as {
        message?: string;
        success?: boolean;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Could not send reply");
      }

      setReply("");
      router.refresh();
    } catch (replyError) {
      setError(
        replyError instanceof Error ? replyError.message : "Could not send reply"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-5 space-y-4">
      {status === "in-call" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-900">
          <PhoneCall className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-bold">Moderator support call active</p>
            <p className="mt-1 text-xs font-semibold text-blue-700">
              Started{" "}
              {callStartedAt
                ? new Date(callStartedAt).toLocaleString()
                : "recently"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {messages.map((message, index) => {
          const isSupport = message.senderType === "support";

          return (
            <div
              className={`rounded-2xl p-4 text-sm ${
                isSupport
                  ? "bg-emerald-50 text-emerald-950"
                  : message.senderType === "system"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-white text-slate-700"
              }`}
              key={`${ticketId}-${index}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                {isSupport ? "Moderator" : message.senderType} /{" "}
                {new Date(message.timestamp).toLocaleString()}
              </p>
              <p className="mt-1 leading-relaxed">{message.message}</p>
            </div>
          );
        })}
      </div>

      {isClosed ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          This ticket is resolved and closed.
        </p>
      ) : (
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={sendReply}>
          <input
            className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500"
            onChange={(event) => setReply(event.target.value)}
            placeholder="Reply to moderator..."
            value={reply}
          />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
            disabled={isSaving || !reply.trim()}
            type="submit"
          >
            <MessageSquareReply className="h-4 w-4" />
            Reply
          </button>
        </form>
      )}

      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
