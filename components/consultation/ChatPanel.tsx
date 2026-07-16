"use client";

import Image from "next/image";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  body: string;
  createdAt: string;
  id: string;
  isSystem: boolean;
  sender: {
    avatar: string | null;
    id: string | null;
    name: string;
    role: "user" | "vet" | "mod" | "admin";
  };
};

type MessagesResponse = {
  data?: ChatMessage[] | ChatMessage;
  message?: string;
  success?: boolean;
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ChatPanel({
  consultationId,
  currentUserId,
}: {
  consultationId: string;
  currentUserId?: string | null;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/consultations/${consultationId}/messages`,
        { credentials: "include" }
      );
      const payload = (await response.json().catch(() => null)) as
        | MessagesResponse
        | null;

      if (!response.ok || !payload?.data || !Array.isArray(payload.data)) {
        throw new Error(payload?.message ?? "Could not load chat.");
      }

      setMessages(payload.data);
      setError(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Could not load chat."
      );
    }
  }, [consultationId]);

  useEffect(() => {
    void fetchMessages();
    const interval = window.setInterval(() => void fetchMessages(), 2000);

    return () => window.clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function sendMessage() {
    const body = draft.trim();
    if (!body || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/consultations/${consultationId}/messages`,
        {
          body: JSON.stringify({ body }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }
      );
      const payload = (await response.json().catch(() => null)) as
        | MessagesResponse
        | null;

      if (!response.ok || !payload?.data || Array.isArray(payload.data)) {
        throw new Error(payload?.message ?? "Could not send message.");
      }

      const sentMessage = payload.data;
      setMessages((current) => {
        const exists = current.some((message) => message.id === sentMessage.id);
        return exists ? current : [...current, sentMessage];
      });
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "Could not send message."
      );
      return;
    } finally {
      setIsSending(false);
    }

    setDraft("");
    void fetchMessages();
  }

  return (
    <aside className="flex min-h-[420px] flex-col border-l border-white/10 bg-slate-950 p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
        Consultation chat
      </p>
      <h2 className="mt-2 text-xl font-bold sm:text-2xl">Care chat</h2>

      <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
            No messages yet. Use this space for quick questions, medicine
            instructions, or follow-up details during the consultation.
          </div>
        ) : null}

        {messages.map((message) => {
          const isMine = message.sender.id === currentUserId;

          return (
            <div
              className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}
              key={message.id}
            >
              {!isMine ? (
                <div className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                  {message.sender.avatar ? (
                    <Image
                      alt=""
                      className="h-full w-full object-cover"
                      height={32}
                      src={message.sender.avatar}
                      width={32}
                    />
                  ) : null}
                </div>
              ) : null}
              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                  isMine
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-slate-100"
                )}
              >
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-70">
                  <span>{isMine ? "You" : message.sender.name}</span>
                  <span>{formatTime(message.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.body}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <textarea
          className="max-h-28 min-h-12 min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
          disabled={isSending}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          placeholder="Type a message..."
          value={draft}
        />
        <button
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSending || !draft.trim()}
          onClick={() => void sendMessage()}
          type="button"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
