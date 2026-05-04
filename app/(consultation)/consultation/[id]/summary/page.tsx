import type { Metadata } from "next";
import Link from "next/link";

type ConsultationSummaryPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Consultation Summary | pawwcure",
};

export default async function ConsultationSummaryPage({
  params,
}: ConsultationSummaryPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-16">
      <section className="mx-auto max-w-4xl rounded-[3rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 md:p-12">
        <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Consultation summary
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Session {id} summary
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-slate-500">
          Diagnosis, treatment, prescriptions, follow-up date, and downloadable
          PDF records will be rendered here after the record API is connected.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {["Diagnosis", "Treatment", "Prescription"].map((item) => (
            <div className="rounded-[2rem] bg-slate-50 p-6" key={item}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item}
              </p>
              <div className="mt-6 space-y-3">
                <div className="h-3 rounded-full bg-slate-200" />
                <div className="h-3 w-4/5 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="rounded-2xl bg-emerald-600 px-6 py-4 text-center text-sm font-bold text-white"
            href="/dashboard"
          >
            Back to Dashboard
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 px-6 py-4 text-center text-sm font-bold text-slate-600"
            href="/pets/luna/records"
          >
            View Pet Records
          </Link>
        </div>
      </section>
    </main>
  );
}
