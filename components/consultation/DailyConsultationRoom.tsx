"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader, Send } from "lucide-react";

type RoomState =
  | { status: "loading" }
  | { message: string; status: "error" }
  | {
      role: "user" | "vet";
      roomUrl: string;
      status: "ready";
      token: string;
    };

type Message = {
  author: "Me" | "System";
  body: string;
  id: string;
};

export function DailyConsultationRoom({
  consultationId,
}: {
  consultationId: string;
}) {
  const [roomState, setRoomState] = useState<RoomState>({ status: "loading" });
  const [messages, setMessages] = useState<Message[]>([
    {
      author: "System",
      body: "Chat messages are local for now. Persisted chat can be added after the room flow is stable.",
      id: "welcome",
    },
  ]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadRoom() {
      const response = await fetch(`/api/consultations/${consultationId}/room`, {
        credentials: "include",
      });
      const payload = (await response.json()) as {
        data?: { role: "user" | "vet"; roomUrl: string; token: string };
        message?: string;
      };

      if (ignore) return;

      if (!response.ok || !payload.data) {
        setRoomState({
          message: payload.message ?? "Could not prepare the consultation room.",
          status: "error",
        });
        return;
      }

      setRoomState({
        role: payload.data.role,
        roomUrl: payload.data.roomUrl,
        status: "ready",
        token: payload.data.token,
      });
    }

    void loadRoom();

    return () => {
      ignore = true;
    };
  }, [consultationId]);

  const dailyUrl = useMemo(() => {
    if (roomState.status !== "ready") return "";
    const url = new URL(roomState.roomUrl);
    url.searchParams.set("t", roomState.token);
    return url.toString();
  }, [roomState]);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      {
        author: "Me",
        body: text,
        id: crypto.randomUUID(),
      },
    ]);
    setDraft("");
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Active consultation
          </p>
          <h1 className="text-sm font-bold sm:text-base">
            Session {consultationId}
          </h1>
        </div>
        <Link
          className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-emerald-950 sm:px-5 sm:py-3"
          href={`/consultation/${consultationId}/summary`}
        >
          End Call
        </Link>
      </header>

      <div className="grid flex-1 lg:grid-cols-[1fr_360px]">
        <section className="min-h-[560px] bg-slate-900 p-3 sm:p-6">
          <div className="h-full min-h-[540px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">
            {roomState.status === "loading" ? (
              <div className="flex h-full min-h-[540px] items-center justify-center text-slate-300">
                <Loader className="mr-3 h-5 w-5 animate-spin" />
                Preparing secure Daily room...
              </div>
            ) : null}

            {roomState.status === "error" ? (
              <div className="flex h-full min-h-[540px] items-center justify-center p-6">
                <div className="max-w-lg rounded-[2rem] border border-red-400/20 bg-red-500/10 p-6 text-center">
                  <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-300" />
                  <h2 className="text-xl font-bold">Room unavailable</h2>
                  <p className="mt-2 text-sm leading-relaxed text-red-100">
                    {roomState.message}
                  </p>
                </div>
              </div>
            ) : null}

            {roomState.status === "ready" ? (
              <iframe
                allow="camera; microphone; fullscreen; speaker; display-capture"
                className="h-full min-h-[540px] w-full border-0"
                src={dailyUrl}
                title="pawwcure Daily consultation room"
              />
            ) : null}
          </div>
        </section>

        <aside className="flex min-h-[420px] flex-col border-l border-white/10 bg-slate-950 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Chat
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {roomState.status === "ready" && roomState.role === "vet"
              ? "Clinical notes"
              : "Care chat"}
          </h2>

          <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
            {messages.map((message) => (
              <div
                className="rounded-2xl bg-white/10 p-4 text-sm text-slate-200"
                key={message.id}
              >
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {message.author}
                </p>
                {message.body}
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Type a message..."
              value={draft}
            />
            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white"
              onClick={sendMessage}
              type="button"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
