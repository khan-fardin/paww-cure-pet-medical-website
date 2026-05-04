import type { Metadata } from "next";
import Link from "next/link";

type ConsultationRoomPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Consultation Room | pawwcure",
};

export default async function ConsultationRoomPage({
  params,
}: ConsultationRoomPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Active consultation
          </p>
          <h1 className="font-bold">Session {id}</h1>
        </div>
        <Link
          className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-950"
          href={`/consultation/${id}/summary`}
        >
          End Call
        </Link>
      </header>

      <div className="grid flex-1 lg:grid-cols-[1fr_360px]">
        <section className="flex min-h-[560px] items-center justify-center bg-slate-900 p-6">
          <div className="flex aspect-video w-full max-w-5xl items-center justify-center rounded-[2.5rem] border border-white/10 bg-black/40">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Video room placeholder
              </p>
              <h2 className="mt-2 text-3xl font-bold">Twilio room surface</h2>
            </div>
          </div>
        </section>

        <aside className="border-l border-white/10 bg-slate-950 p-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            User side panel
          </p>
          <h2 className="mt-2 text-2xl font-bold">Chat and care notes</h2>
          <div className="mt-8 space-y-3">
            <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-300">
              Pusher-backed chat will stream here.
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Session instructions and file sharing controls will live here.
            </div>
          </div>
        </aside>
      </div>

      <footer className="flex h-20 items-center justify-center gap-3 border-t border-white/10 px-6">
        {["Mute", "Camera", "Chat", "Share"].map((control) => (
          <button
            className="rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white"
            key={control}
            type="button"
          >
            {control}
          </button>
        ))}
      </footer>
    </main>
  );
}
