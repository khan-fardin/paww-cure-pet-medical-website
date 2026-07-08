"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

type RoomData = {
  appId: string;
  channelName: string;
  displayName: string;
  role: "mod" | "user";
  token: string;
  uid: string;
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

export function AgoraSupportRoom({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const tracksRef = useRef<LocalTracks>({ audio: null, video: null });
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [notes, setNotes] = useState("");
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadRoom() {
      const response = await fetch(`/api/tickets/${ticketId}/room`, {
        credentials: "include",
      });
      const payload = (await response.json().catch(() => null)) as
        | { data?: RoomData; message?: string }
        | null;

      if (ignore) return;
      if (!response.ok || !payload?.data) {
        setError(payload?.message ?? "Could not prepare support call");
        return;
      }
      setRoom(payload.data);
    }

    void loadRoom();
    return () => {
      ignore = true;
    };
  }, [ticketId]);

  const leaveAgora = useCallback(async () => {
    stopTracks(tracksRef);
    await clientRef.current?.leave();
    clientRef.current = null;
    setIsJoined(false);
  }, []);

  useEffect(() => {
    if (!room || clientRef.current) return;
    const activeRoom = room;
    let cancelled = false;

    async function join() {
      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        const client = AgoraRTC.createClient({ codec: "vp8", mode: "rtc" });
        clientRef.current = client;

        client.on(
          "user-published",
          async (user: IAgoraRTCRemoteUser, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === "video" && remoteVideoRef.current) {
              user.videoTrack?.play(remoteVideoRef.current);
            }
            if (mediaType === "audio") user.audioTrack?.play();
          }
        );

        client.on("user-unpublished", (_user, mediaType) => {
          if (mediaType === "video" && remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = "";
          }
        });

        await client.join(
          activeRoom.appId,
          activeRoom.channelName,
          activeRoom.token,
          activeRoom.uid
        );
        const [audio, video] =
          await AgoraRTC.createMicrophoneAndCameraTracks();

        if (cancelled) {
          audio.close();
          video.close();
          return;
        }

        tracksRef.current = { audio, video };
        if (localVideoRef.current) video.play(localVideoRef.current);
        await client.publish([audio, video]);
        setIsJoined(true);
      } catch (joinError) {
        setError(
          joinError instanceof Error
            ? joinError.message
            : "Could not join support call"
        );
      }
    }

    void join();
    return () => {
      cancelled = true;
      void leaveAgora();
    };
  }, [leaveAgora, room]);

  async function endCall() {
    if (!room) return;
    setIsEnding(true);
    await leaveAgora();

    if (room.role === "mod") {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "end-call",
          moderatorNotes: notes,
        }),
      });
      router.push("/mod/tickets");
    } else {
      router.push("/support");
    }
    router.refresh();
  }

  async function toggleMic() {
    const next = !isMicOn;
    await tracksRef.current.audio?.setEnabled(next);
    setIsMicOn(next);
  }

  async function toggleCamera() {
    const next = !isCameraOn;
    await tracksRef.current.video?.setEnabled(next);
    setIsCameraOn(next);
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Live support call
          </p>
          <h1 className="text-sm font-bold sm:text-base">
            {room?.displayName ?? "Preparing secure room"}
          </h1>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold disabled:bg-slate-600"
          disabled={!room || isEnding}
          onClick={() => void endCall()}
          type="button"
        >
          <PhoneOff className="h-4 w-4" />
          {isEnding ? "Ending..." : "Leave Call"}
        </button>
      </header>

      <div className="grid flex-1 lg:grid-cols-[1fr_340px]">
        <section className="min-h-[560px] p-3 sm:p-6">
          {error ? (
            <div className="flex min-h-[520px] items-center justify-center">
              <div className="max-w-lg rounded-[2rem] border border-red-400/20 bg-red-500/10 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-300" />
                <h2 className="mt-3 text-xl font-bold">Call unavailable</h2>
                <p className="mt-2 text-sm text-red-100">{error}</p>
              </div>
            </div>
          ) : (
            <div className="grid h-full min-h-[520px] gap-3 rounded-[2rem] bg-black p-3 md:grid-cols-[1fr_260px]">
              <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-slate-900">
                <div ref={remoteVideoRef} className="h-full min-h-[360px]" />
                {!isJoined ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Loader className="mr-3 h-5 w-5 animate-spin" />
                    Joining support call...
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
                <div
                  ref={localVideoRef}
                  className="min-h-[220px] overflow-hidden rounded-[1.5rem] bg-slate-900"
                />
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className="flex items-center justify-center rounded-2xl bg-white/10 p-3"
                    onClick={() => void toggleMic()}
                    type="button"
                  >
                    {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </button>
                  <button
                    className="flex items-center justify-center rounded-2xl bg-white/10 p-3"
                    onClick={() => void toggleCamera()}
                    type="button"
                  >
                    {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </button>
                  <button
                    className="flex items-center justify-center rounded-2xl bg-red-500 p-3"
                    onClick={() => void endCall()}
                    type="button"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="border-l border-white/10 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Support session
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {room?.role === "mod" ? "Moderator notes" : "Help is connected"}
          </h2>
          {room?.role === "mod" ? (
            <>
              <textarea
                className="mt-5 min-h-52 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white outline-none placeholder:text-slate-500"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Record the issue, troubleshooting steps, and result..."
                value={notes}
              />
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Notes are saved internally when you leave the call and remain
                attached to the ticket history.
              </p>
            </>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-slate-300">
              Your moderator can see and hear you after both sides join. Leaving
              the room does not close your support ticket.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
