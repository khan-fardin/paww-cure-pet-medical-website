"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Save, Stethoscope } from "lucide-react";

type MedicationDraft = {
  dosage: string;
  duration: string;
  frequency: string;
  instructions: string;
  name: string;
};

type ConsultationRecordFormProps = {
  canWrite: boolean;
  consultationId: string;
  consultationType: string;
  initialDiagnosis?: string;
  initialFollowUpDueDate?: string;
  initialNotes?: string;
  initialTreatmentPlan?: string;
  pet: {
    breed: string;
    name: string;
    species: string;
  };
  scheduledAt: string;
  user: {
    email: string;
    name: string;
  };
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function ConsultationRecordForm({
  canWrite,
  consultationId,
  consultationType,
  initialDiagnosis = "",
  initialFollowUpDueDate = "",
  initialNotes = "",
  initialTreatmentPlan = "",
  pet,
  scheduledAt,
  user,
}: ConsultationRecordFormProps) {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
  const [treatmentPlan, setTreatmentPlan] = useState(initialTreatmentPlan);
  const [notes, setNotes] = useState(initialNotes);
  const [medication, setMedication] = useState<MedicationDraft>({
    dosage: "",
    duration: "",
    frequency: "",
    instructions: "",
    name: "",
  });
  const [dietRecommendations, setDietRecommendations] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [followUpDueDate, setFollowUpDueDate] = useState(
    initialFollowUpDueDate
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canWrite) {
      setSaveState("error");
      setMessage("Payment must be completed before writing the record.");
      return;
    }

    setSaveState("saving");
    setMessage("");

    const response = await fetch(`/api/consultations/${consultationId}/record`, {
      body: JSON.stringify({
        diagnosis,
        dietRecommendations,
        followUpDueDate: followUpDueDate || undefined,
        medications: medication.name.trim()
          ? [
              {
                dosage: medication.dosage,
                duration: medication.duration,
                frequency: medication.frequency,
                instructions: medication.instructions || undefined,
                name: medication.name,
              },
            ]
          : [],
        notes,
        precautions: precautions
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        treatmentPlan,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      setSaveState("error");
      setMessage(payload?.message ?? "Could not save the record.");
      return;
    }

    setSaveState("saved");
    setMessage("Prescription saved and the user has been notified.");
    router.refresh();
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {!canWrite ? (
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">
            This consultation is not payment-cleared yet. The record form is
            locked until payment is completed.
          </div>
        ) : null}

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <label
            className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            htmlFor="diagnosis"
          >
            Diagnosis
          </label>
          <textarea
            className="mt-3 min-h-36 w-full rounded-2xl border border-slate-100 p-4 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            disabled={!canWrite || saveState === "saving"}
            id="diagnosis"
            onChange={(event) => setDiagnosis(event.target.value)}
            placeholder="Summarize the diagnosis clearly."
            required
            value={diagnosis}
          />
        </section>

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <label
            className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            htmlFor="treatmentPlan"
          >
            Treatment plan
          </label>
          <textarea
            className="mt-3 min-h-40 w-full rounded-2xl border border-slate-100 p-4 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            disabled={!canWrite || saveState === "saving"}
            id="treatmentPlan"
            onChange={(event) => setTreatmentPlan(event.target.value)}
            placeholder="Medication, care instructions, food, rest, and warning signs."
            required
            value={treatmentPlan}
          />
        </section>

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Prescription
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">
              Medication details
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Medication", "e.g. Amoxicillin"],
              ["dosage", "Dosage", "e.g. 250mg"],
              ["frequency", "Frequency", "e.g. Twice daily"],
              ["duration", "Duration", "e.g. 7 days"],
            ].map(([key, label, placeholder]) => (
              <div key={key}>
                <label
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  htmlFor={key}
                >
                  {label}
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  disabled={!canWrite || saveState === "saving"}
                  id={key}
                  onChange={(event) =>
                    setMedication((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  value={medication[key as keyof MedicationDraft]}
                />
              </div>
            ))}
          </div>
          <label
            className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
            htmlFor="instructions"
          >
            Medication instructions
          </label>
          <textarea
            className="mt-2 min-h-24 w-full rounded-2xl border border-slate-100 p-4 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            disabled={!canWrite || saveState === "saving"}
            id="instructions"
            onChange={(event) =>
              setMedication((current) => ({
                ...current,
                instructions: event.target.value,
              }))
            }
            placeholder="Give with food, avoid missed doses, watch for side effects..."
            value={medication.instructions}
          />
        </section>

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <label
            className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            htmlFor="dietRecommendations"
          >
            Diet recommendations
          </label>
          <textarea
            className="mt-3 min-h-24 w-full rounded-2xl border border-slate-100 p-4 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            disabled={!canWrite || saveState === "saving"}
            id="dietRecommendations"
            onChange={(event) => setDietRecommendations(event.target.value)}
            placeholder="Food, water, supplements, restrictions..."
            value={dietRecommendations}
          />
          <label
            className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
            htmlFor="precautions"
          >
            Precautions
          </label>
          <textarea
            className="mt-3 min-h-24 w-full rounded-2xl border border-slate-100 p-4 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            disabled={!canWrite || saveState === "saving"}
            id="precautions"
            onChange={(event) => setPrecautions(event.target.value)}
            placeholder="One precaution per line."
            value={precautions}
          />
        </section>

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <label
            className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            htmlFor="notes"
          >
            Vet notes
          </label>
          <textarea
            className="mt-3 min-h-28 w-full rounded-2xl border border-slate-100 p-4 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            disabled={!canWrite || saveState === "saving"}
            id="notes"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Internal notes, observations, or context for future follow-up."
            value={notes}
          />
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Stethoscope className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-950">
            {pet.name}
          </h2>
          <p className="mt-1 text-sm capitalize text-slate-500">
            {pet.species} · {pet.breed}
          </p>

          <div className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
            <div>
              <p className="font-bold text-slate-950">User</p>
              <p className="mt-1 text-slate-500">{user.name}</p>
              <p className="text-slate-400">{user.email}</p>
            </div>
            <div>
              <p className="font-bold text-slate-950">Consult type</p>
              <p className="mt-1 capitalize text-slate-500">
                {consultationType}
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-950">Scheduled</p>
              <p className="mt-1 text-slate-500">
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(scheduledAt))}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <label
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"
            htmlFor="followUpDueDate"
          >
            <CalendarDays className="h-4 w-4" />
            Follow-up date
          </label>
          <input
            className="mt-3 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            disabled={!canWrite || saveState === "saving"}
            id="followUpDueDate"
            onChange={(event) => setFollowUpDueDate(event.target.value)}
            type="date"
            value={followUpDueDate}
          />
        </section>

        {message ? (
          <p
            className={`rounded-2xl p-4 text-sm font-semibold ${
              saveState === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </p>
        ) : null}

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-xl shadow-emerald-600/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          disabled={!canWrite || saveState === "saving"}
          type="submit"
        >
          <Save className="h-4 w-4" />
          {saveState === "saving" ? "Saving..." : "Save Prescription"}
        </button>
      </aside>
    </form>
  );
}
