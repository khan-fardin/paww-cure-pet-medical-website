import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Consultation Details | pawwcure",
};

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function ConsultationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Consultation Details</h1>
          <p className="mt-2 text-slate-500">ID: {params.id}</p>
        </div>
        <Link
          className="rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700"
          href="/vet/consultations"
        >
          Back to Consultations
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-2xl font-bold mb-4">Consultation Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Date & Time
                </p>
                <p className="mt-2 text-lg font-bold">Today, 7:30 PM</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Type
                </p>
                <p className="mt-2 text-lg font-bold">Video Consultation</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <span className="mt-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                  Completed
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-4">Patient Record</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Diagnosis
                </p>
                <p className="mt-2 text-slate-700">
                  Mild digestive upset due to dietary sensitivity. Recommend
                  switching to sensitive stomach formula and probiotic supplement.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Symptoms
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Vomiting", "Loss of appetite"].map((symptom) => (
                    <span
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700"
                      key={symptom}
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Follow-up Date
                </p>
                <p className="mt-2 font-bold">May 10, 2026</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-4">Prescriptions</h2>
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="font-bold">Probiotics Sachet</p>
                <p className="mt-1 text-sm text-slate-600">1 sachet daily • 7 days</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <h2 className="text-lg font-bold mb-4">Pet Info</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold text-slate-900">Pet Name</p>
                <p className="mt-1 text-slate-600">Luna</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Species</p>
                <p className="mt-1 text-slate-600">Cat</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Breed</p>
                <p className="mt-1 text-slate-600">Persian</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Age</p>
                <p className="mt-1 text-slate-600">3 years</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">User</p>
                <p className="mt-1 text-slate-600">Nadia Chowdhury</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
