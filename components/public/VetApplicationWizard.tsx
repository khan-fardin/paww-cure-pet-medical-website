"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

type SaveState = "idle" | "saving" | "saved" | "submitted";

type VetApplicationDraft = {
  bio: string;
  consultFee: string;
  degreeFileName: string;
  email: string;
  expiryDate: string;
  issuingAuthority: string;
  languages: string;
  licenseFileName: string;
  licenseNumber: string;
  name: string;
  password: string;
  phone: string;
  specialties: string[];
};

const draftKey = "pawwcure-vet-application-draft";

const initialDraft: VetApplicationDraft = {
  bio: "",
  consultFee: "",
  degreeFileName: "",
  email: "",
  expiryDate: "",
  issuingAuthority: "",
  languages: "",
  licenseFileName: "",
  licenseNumber: "",
  name: "",
  password: "",
  phone: "",
  specialties: [],
};

const steps = [
  "Personal info",
  "Credentials",
  "Profile",
  "Documents",
  "Review",
] as const;

const specialtyOptions = [
  "General practice",
  "Emergency care",
  "Dermatology",
  "Nutrition",
  "Surgery",
  "Dental care",
] as const;

function FieldLabel({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function StepBadge({
  index,
  isActive,
  isComplete,
  label,
}: {
  index: number;
  isActive: boolean;
  isComplete: boolean;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
          isActive || isComplete
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 text-slate-400",
        )}
      >
        {index + 1}
      </span>
      <span
        className={cn(
          "hidden text-xs font-bold uppercase tracking-wider sm:block",
          isActive ? "text-emerald-700" : "text-slate-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function VetApplicationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<VetApplicationDraft>(initialDraft);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const stepTitle = steps[currentStep];
  const isFinalStep = currentStep === steps.length - 1;

  const selectedSpecialties = useMemo(
    () => new Set(draft.specialties),
    [draft.specialties],
  );

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      const saved = window.localStorage.getItem(draftKey);

      if (!saved) {
        return;
      }

      try {
        const parsed = JSON.parse(saved) as Partial<{
          draft: Partial<VetApplicationDraft>;
          step: number;
        }>;

        setDraft({ ...initialDraft, ...(parsed.draft ?? {}) });

        if (typeof parsed.step === "number") {
          setCurrentStep(Math.min(Math.max(parsed.step, 0), steps.length - 1));
        }
      } catch {
        window.localStorage.removeItem(draftKey);
      }
    }, 0);

    return () => window.clearTimeout(restoreDraft);
  }, []);

  function updateDraft<K extends keyof VetApplicationDraft>(
    key: K,
    value: VetApplicationDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaveState("idle");
  }

  function toggleSpecialty(specialty: string) {
    const next = selectedSpecialties.has(specialty)
      ? draft.specialties.filter((item) => item !== specialty)
      : [...draft.specialties, specialty];

    updateDraft("specialties", next);
  }

  async function saveDraft(nextStep = currentStep) {
    setSaveState("saving");
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    window.localStorage.setItem(
      draftKey,
      JSON.stringify({ draft, step: nextStep }),
    );
    setSaveState("saved");
  }

  async function goNext() {
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    await saveDraft(nextStep);
    setCurrentStep(nextStep);
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function submitApplication() {
    await saveDraft(currentStep);
    setSaveState("submitted");
  }

  return (
    <section className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Vet application
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Apply to care through pawwcure
          </h1>
          <p className="text-lg leading-relaxed text-slate-500">
            Complete the five-step application. Your progress is saved on each
            step while the backend workflow is being connected.
          </p>
        </div>

        <div className="overflow-hidden rounded-[3rem] bg-white shadow-sm ring-1 ring-slate-100">
          <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
            <aside className="bg-emerald-950 p-8 text-white sm:p-10">
              <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                  Application progress
                </p>
                <h2 className="mt-3 text-3xl font-bold">{stepTitle}</h2>
              </div>

              <div className="space-y-5">
                {steps.map((step, index) => (
                  <StepBadge
                    index={index}
                    isActive={index === currentStep}
                    isComplete={index < currentStep}
                    key={step}
                    label={step}
                  />
                ))}
              </div>

              <div className="mt-10 grid grid-cols-5 gap-2">
                {steps.map((step, index) => (
                  <span
                    className={cn(
                      "h-2 rounded-full",
                      index <= currentStep ? "bg-emerald-400" : "bg-white/10",
                    )}
                    key={`${step}-progress`}
                  />
                ))}
              </div>

              <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/10 p-5 text-sm leading-relaxed text-emerald-50">
                {saveState === "saving" && "Saving draft..."}
                {saveState === "saved" && "Draft saved"}
                {saveState === "submitted" &&
                  "Application submitted for moderator review"}
                {saveState === "idle" &&
                  "Draft saves when you continue to the next step."}
              </div>
            </aside>

            <div className="p-8 sm:p-10 lg:p-12">
              {currentStep === 0 ? (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldLabel label="Full name">
                      <Input
                        autoComplete="name"
                        onChange={(event) =>
                          updateDraft("name", event.target.value)
                        }
                        placeholder="Dr. Amina Rahman"
                        value={draft.name}
                      />
                    </FieldLabel>
                    <FieldLabel label="Phone">
                      <Input
                        autoComplete="tel"
                        onChange={(event) =>
                          updateDraft("phone", event.target.value)
                        }
                        placeholder="+880"
                        type="tel"
                        value={draft.phone}
                      />
                    </FieldLabel>
                  </div>
                  <FieldLabel label="Email address">
                    <Input
                      autoComplete="email"
                      onChange={(event) =>
                        updateDraft("email", event.target.value)
                      }
                      placeholder="doctor@example.com"
                      type="email"
                      value={draft.email}
                    />
                  </FieldLabel>
                  <FieldLabel label="Password">
                    <Input
                      autoComplete="new-password"
                      onChange={(event) =>
                        updateDraft("password", event.target.value)
                      }
                      placeholder="Create a secure password"
                      type="password"
                      value={draft.password}
                    />
                  </FieldLabel>
                </div>
              ) : null}

              {currentStep === 1 ? (
                <div className="space-y-5">
                  <FieldLabel label="License number">
                    <Input
                      onChange={(event) =>
                        updateDraft("licenseNumber", event.target.value)
                      }
                      placeholder="VET-2026-001"
                      value={draft.licenseNumber}
                    />
                  </FieldLabel>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldLabel label="Issuing authority">
                      <Input
                        onChange={(event) =>
                          updateDraft("issuingAuthority", event.target.value)
                        }
                        placeholder="Veterinary council"
                        value={draft.issuingAuthority}
                      />
                    </FieldLabel>
                    <FieldLabel label="Expiry date">
                      <Input
                        onChange={(event) =>
                          updateDraft("expiryDate", event.target.value)
                        }
                        type="date"
                        value={draft.expiryDate}
                      />
                    </FieldLabel>
                  </div>
                </div>
              ) : null}

              {currentStep === 2 ? (
                <div className="space-y-6">
                  <div>
                    <span className="mb-3 block text-sm font-bold text-slate-700">
                      Specialties
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {specialtyOptions.map((specialty) => (
                        <button
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-bold transition",
                            selectedSpecialties.has(specialty)
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50",
                          )}
                          key={specialty}
                          onClick={() => toggleSpecialty(specialty)}
                          type="button"
                        >
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldLabel label="Languages">
                      <Input
                        onChange={(event) =>
                          updateDraft("languages", event.target.value)
                        }
                        placeholder="English, Bangla"
                        value={draft.languages}
                      />
                    </FieldLabel>
                    <FieldLabel label="Consult fee">
                      <Input
                        min="0"
                        onChange={(event) =>
                          updateDraft("consultFee", event.target.value)
                        }
                        placeholder="1200"
                        type="number"
                        value={draft.consultFee}
                      />
                    </FieldLabel>
                  </div>
                  <FieldLabel label="Professional bio">
                    <Textarea
                      onChange={(event) =>
                        updateDraft("bio", event.target.value)
                      }
                      placeholder="Share your clinical background, preferred cases, and consultation style."
                      value={draft.bio}
                    />
                  </FieldLabel>
                </div>
              ) : null}

              {currentStep === 3 ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldLabel label="License scan">
                    <Input
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(event) =>
                        updateDraft(
                          "licenseFileName",
                          event.target.files?.[0]?.name ?? "",
                        )
                      }
                      type="file"
                    />
                    {draft.licenseFileName ? (
                      <p className="mt-2 text-xs font-bold text-emerald-600">
                        {draft.licenseFileName}
                      </p>
                    ) : null}
                  </FieldLabel>

                  <FieldLabel label="Degree certificate">
                    <Input
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(event) =>
                        updateDraft(
                          "degreeFileName",
                          event.target.files?.[0]?.name ?? "",
                        )
                      }
                      type="file"
                    />
                    {draft.degreeFileName ? (
                      <p className="mt-2 text-xs font-bold text-emerald-600">
                        {draft.degreeFileName}
                      </p>
                    ) : null}
                  </FieldLabel>
                </div>
              ) : null}

              {currentStep === 4 ? (
                <div className="space-y-4">
                  {[
                    ["Name", draft.name],
                    ["Email", draft.email],
                    ["Phone", draft.phone],
                    ["License", draft.licenseNumber],
                    ["Authority", draft.issuingAuthority],
                    ["Specialties", draft.specialties.join(", ")],
                    ["Languages", draft.languages],
                    ["Consult fee", draft.consultFee],
                    ["License scan", draft.licenseFileName],
                    ["Degree certificate", draft.degreeFileName],
                  ].map(([label, value]) => (
                    <div
                      className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      key={label}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {label}
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        {value || "Not provided"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  className="sm:min-w-32"
                  disabled={currentStep === 0 || saveState === "saving"}
                  onClick={goBack}
                  variant="secondary"
                >
                  Back
                </Button>

                {isFinalStep ? (
                  <Button
                    className="sm:min-w-48"
                    disabled={
                      saveState === "saving" || saveState === "submitted"
                    }
                    onClick={submitApplication}
                  >
                    Submit Application
                  </Button>
                ) : (
                  <Button
                    className="sm:min-w-32"
                    disabled={saveState === "saving"}
                    onClick={goNext}
                  >
                    Save and Continue
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
