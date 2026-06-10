"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Headphones, MessageSquareReply } from "lucide-react";

type TicketActionsProps = {
  phone?: string;
  status: string;
  ticketId: string;
};

async function updateTicket(ticketId: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/tickets/${ticketId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as {
    message?: string;
    success?: boolean;
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? "Could not update ticket");
  }
}

export function TicketActions({ phone, status, ticketId }: TicketActionsProps) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [resolveNote, setResolveNote] = useState("");
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isClosed = status === "closed";

  async function run(actionName: string, body: Record<string, unknown>) {
    setIsSaving(actionName);
    setError(null);

    try {
      await updateTicket(ticketId, body);
      if (actionName === "reply") setReply("");
      if (actionName === "resolve") setResolveNote("");
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Could not update ticket"
      );
    } finally {
      setIsSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          disabled={isClosed || isSaving !== null}
          onClick={() => run("assign", { action: "assign" })}
          type="button"
        >
          <Headphones className="h-4 w-4" />
          Take Ticket
        </button>
        <a
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
            phone && !isClosed
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "pointer-events-none bg-slate-200 text-slate-400"
          }`}
          href={phone && !isClosed ? `tel:${phone}` : undefined}
          onClick={() => {
            if (phone && !isClosed) {
              void run("start-call", {
                action: "start-call",
                message:
                  "I am calling the user directly now. Please keep this ticket open until we solve it.",
              });
            }
          }}
        >
          Call User
        </a>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
          disabled={isClosed || isSaving !== null}
          onClick={() =>
            run("resolve", {
              action: "resolve",
              message: resolveNote || "Problem solved. Closing ticket.",
            })
          }
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" />
          Resolve
        </button>
      </div>
      {!isClosed ? (
        <p className="text-xs font-semibold text-slate-500">
          Take Ticket assigns this request to you and moves it into active support.
        </p>
      ) : null}

      {!isClosed ? (
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <textarea
            className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-amber-500"
            onChange={(event) => setReply(event.target.value)}
            placeholder="Reply to the user..."
            value={reply}
          />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:bg-slate-300"
            disabled={!reply.trim() || isSaving !== null}
            onClick={() => run("reply", { action: "reply", message: reply })}
            type="button"
          >
            <MessageSquareReply className="h-4 w-4" />
            Reply
          </button>
        </div>
      ) : null}

      {!isClosed ? (
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500"
          onChange={(event) => setResolveNote(event.target.value)}
          placeholder="Optional resolve note..."
          type="text"
          value={resolveNote}
        />
      ) : null}

      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
