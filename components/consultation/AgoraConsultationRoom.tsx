"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  Loader,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Video,
  VideoOff,
} from "lucide-react";
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

type RoomState =
  | { status: "loading" }
  | { message: string; status: "error" }
  | {
      appId: string;
      channelName: string;
      displayName: string;
      role: "user" | "vet";
      status: "ready";
      token: string;
      uid: string;
    };

type Message = {
  author: "Me" | "System";
  body: string;
  id: string;
};

type LocalTracks = {
  audio: IMicrophoneAudioTrack | null;
  video: ICameraVideoTrack | null;
};

function stopTracks(tracks: MutableRefObject<LocalTracks>) {
  tracks.current.audio?.stop();
  tracks.current.audio?.close();
  tracks.current.video?.stop();
  tracks.current.video?.close();
  tracks.current = { audio: null, video: null };
}

export function AgoraConsultationRoom({
  consultationId,
}: {
  consultationId: string;
}) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<LocalTracks>({ audio: null, video: null });
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const [roomState, setRoomState] = useState<RoomState>({ status: "loading" });
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
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
      const payload = (await response.json().catch(() => null)) as
        | {
            data?: {
              appId: string;
              channelName: string;
              displayName: string;
              role: "user" | "vet";
              token: string;
              uid: string;
            };
            message?: string;
          }
        | null;

      if (ignore) return;

      if (!response.ok || !payload?.data) {
        setRoomState({
          message: payload?.message ?? "Could not prepare the consultation room.",
          status: "error",
        });
        return;
      }

      setRoomState({
        ...payload.data,
        status: "ready",
      });
    }

    void loadRoom();

    return () => {
      ignore = true;
    };
  }, [consultationId]);

  const joinRoom = useCallback(async () => {
    if (roomState.status !== "ready" || clientRef.current) return;

    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
    const client = AgoraRTC.createClient({ codec: "vp8", mode: "rtc" });
    clientRef.current = client;

    client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "video" && remoteVideoRef.current) {
        user.videoTrack?.play(remoteVideoRef.current);
      }

      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    client.on("user-unpublished", (_user, mediaType) => {
      if (mediaType === "video" && remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = "";
      }
    });

    await client.join(
      roomState.appId,
      roomState.channelName,
      roomState.token,
      roomState.uid
    );

    const [audioTrack, videoTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks();
    localTracksRef.current = { audio: audioTrack, video: videoTrack };

    if (localVideoRef.current) {
      videoTrack.play(localVideoRef.current);
    }

    await client.publish([audioTrack, videoTrack]);
    setIsJoined(true);
  }, [roomState]);

  useEffect(() => {
    if (roomState.status !== "ready") return;
    void joinRoom();
  }, [joinRoom, roomState.status]);

  const leaveRoom = useCallback(async () => {
    stopTracks(localTracksRef);
    await clientRef.current?.leave();
    clientRef.current = null;
    setIsJoined(false);
  }, []);

  useEffect(() => {
    return () => {
      void leaveRoom();
    };
  }, [leaveRoom]);

  const roomLabel = useMemo(() => {
    if (roomState.status !== "ready") return "Preparing Agora room";
    return `${roomState.channelName} · ${roomState.displayName}`;
  }, [roomState]);

  async function toggleMic() {
    const next = !isMicOn;
    await localTracksRef.current.audio?.setEnabled(next);
    setIsMicOn(next);
  }

  async function toggleCamera() {
    const next = !isCameraOn;
    await localTracksRef.current.video?.setEnabled(next);
    setIsCameraOn(next);
  }

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
          <h1 className="text-sm font-bold sm:text-base">{roomLabel}</h1>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-emerald-950 sm:px-5 sm:py-3"
          href={`/consultation/${consultationId}/summary`}
          onClick={() => void leaveRoom()}
        >
          <PhoneOff className="h-4 w-4" />
          End Call
        </Link>
      </header>

      <div className="grid flex-1 lg:grid-cols-[1fr_360px]">
        <section className="min-h-[560px] bg-slate-900 p-3 sm:p-6">
          <div className="grid h-full min-h-[540px] gap-3 overflow-hidden rounded-[2rem] border border-white/10 bg-black p-3 md:grid-cols-[1fr_260px]">
            {roomState.status === "loading" ? (
              <div className="flex h-full min-h-[500px] items-center justify-center text-slate-300 md:col-span-2">
                <Loader className="mr-3 h-5 w-5 animate-spin" />
                Preparing secure Agora room...
              </div>
            ) : null}

            {roomState.status === "error" ? (
              <div className="flex h-full min-h-[500px] items-center justify-center p-6 md:col-span-2">
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
              <>
                <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-slate-950">
                  <div ref={remoteVideoRef} className="h-full min-h-[360px] w-full" />
                  {!isJoined ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <Loader className="mr-3 h-5 w-5 animate-spin" />
                      Joining call...
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="min-h-[220px] overflow-hidden rounded-[1.5rem] bg-slate-900">
                    <div ref={localVideoRef} className="h-full min-h-[220px] w-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-3 py-3 text-sm font-bold"
                      onClick={() => void toggleMic()}
                      type="button"
                    >
                      {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-3 py-3 text-sm font-bold"
                      onClick={() => void toggleCamera()}
                      type="button"
                    >
                      {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </button>
                    <Link
                      className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-3 py-3 text-sm font-bold"
                      href={`/consultation/${consultationId}/summary`}
                      onClick={() => void leaveRoom()}
                    >
                      <PhoneOff className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </>
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
