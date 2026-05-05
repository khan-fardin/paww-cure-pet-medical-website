import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Save } from "lucide-react";

export const metadata: Metadata = {
  title: "Write Consultation Record | pawwcure",
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

export default function WriteRecordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Write Consultation Record</h1>
          <p className="mt-2 text-slate-500">
            Consultation ID: {params.id}
          </p>
        </div>
        <Link
          className="rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700 flex items-center gap-2"
          href="/vet/consultations"
        >
          <Save className="h-4 w-4" />
          Save & Close
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Diagnosis
              </label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-100 p-4 font-sans text-sm placeholder-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                placeholder="Enter diagnosis and treatment plan..."
                rows={6}
              />
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Symptoms Observed
              </label>
              <div className="mt-3 space-y-2 flex flex-wrap gap-2">
                {[
                  "Vomiting",
                  "Diarrhea",
                  "Loss of appetite",
                  "Lethargy",
                  "Itching",
                ].map((symptom) => (
                  <label key={symptom} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-sm">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vet Notes (Private)
              </label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-100 p-4 font-sans text-sm placeholder-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                placeholder="Personal notes not visible to patient..."
                rows={4}
              />
            </div>
          </Card>

          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">Add Prescription</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Medication
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                    placeholder="e.g., Amoxicillin"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dosage
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                    placeholder="e.g., 250mg"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Frequency
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                    placeholder="e.g., Twice daily"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Duration
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                    placeholder="e.g., 7 days"
                    type="text"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Follow-up Date
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                type="date"
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-blue-50 p-4">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">Pro tip</p>
                <p className="mt-1 text-xs text-blue-800">
                  Be detailed in diagnosis and follow-up instructions so the
                  owner knows what to do next.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold text-slate-900">Pet</p>
                <p className="mt-1 text-slate-600">Luna (Cat)</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Owner</p>
                <p className="mt-1 text-slate-600">Nadia Chowdhury</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Consult Type</p>
                <p className="mt-1 text-slate-600">Video</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
