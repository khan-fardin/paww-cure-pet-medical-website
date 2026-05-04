import type { Metadata } from "next";
import Link from "next/link";

type WaitingRoomPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Waiting Room | pawwcure",
};

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 py-16">
      <section className="w-full max-w-3xl rounded-[3rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 md:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-50 text-3xl font-bold text-emerald-600">
          Dr
        </div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Waiting room
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Waiting for your vet to join.
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-slate-500">
          Consultation {id} will later poll status and subscribe to the
          vet:joined event before moving into the room.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white"
            href={`/consultation/${id}`}
          >
            Enter Demo Room
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold text-slate-600"
            href="/dashboard"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
