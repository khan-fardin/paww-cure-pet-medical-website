"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  CloudinaryUpload,
  type CloudinaryAsset,
} from "@/components/ui/CloudinaryUpload";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

type SaveState = "idle" | "saving" | "saved" | "submitted";
type SubmitState = "idle" | "submitting" | "success" | "error";

type VetApplicationDraft = {
  bio: string;
  clinicAddress: string;
  clinicCity: string;
  clinicName: string;
  clinicPostalCode: string;
  clinicProvince: string;
  consultFee: string;
  degreeFileName: string;
  degreePublicId: string;
  degreeResourceType: CloudinaryAsset["resourceType"] | "";
  email: string;
  experience: string;
  expiryDate: string;
  issuingAuthority: string;
  languages: string;
  licenseFileName: string;
  licensePublicId: string;
  licenseResourceType: CloudinaryAsset["resourceType"] | "";
  licenseNumber: string;
  name: string;
  password: string;
  phone: string;
  profilePhotoName: string;
  profilePhotoPublicId: string;
  profilePhotoUrl: string;
  specialties: string[];
};

const draftKey = "pawwcure-vet-application-draft";

const initialDraft: VetApplicationDraft = {
  bio: "",
  clinicAddress: "",
  clinicCity: "",
  clinicName: "",
  clinicPostalCode: "",
  clinicProvince: "",
  consultFee: "",
  degreeFileName: "",
  degreePublicId: "",
  degreeResourceType: "",
  email: "",
  experience: "",
  expiryDate: "",
  issuingAuthority: "",
  languages: "",
  licenseFileName: "",
  licensePublicId: "",
  licenseResourceType: "",
  licenseNumber: "",
  name: "",
  password: "",
  phone: "",
  profilePhotoName: "",
  profilePhotoPublicId: "",
  profilePhotoUrl: "",
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
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [identityLocked, setIdentityLocked] = useState(false);

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

  useEffect(() => {
    let ignore = false;

    async function loadCurrentUser() {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      const payload = (await response.json().catch(() => null)) as
        | {
          user?: {
            email?: string;
            name?: string;
            phone?: string;
          };
        }
        | null;
        
      if (ignore || !response.ok || !payload?.user) return;
      
      const nextName = payload.user?.name ?? "";
      const nextEmail = payload.user?.email ?? "";
      const nextPhone = payload.user?.phone ?? "";

      setDraft((current) => ({
        ...current,
        email: nextEmail || current.email,
        name: nextName || current.name,
        password: "********",
        phone: nextPhone || current.phone,
      }));
      setIdentityLocked(Boolean(nextName && nextEmail && nextPhone));
    }

    void loadCurrentUser();

    return () => {
      ignore = true;
    };
  }, []);

  function updateDraft<K extends keyof VetApplicationDraft>(
    key: K,
    value: VetApplicationDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaveState("idle");
    setSubmitState("idle");
    setSubmitMessage("");
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
    setSubmitState("submitting");

    try {
      const response = await fetch("/api/vets", {
        body: JSON.stringify(draft),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as {
        message?: string;
        success?: boolean;
      };

      if (!response.ok) {
        setSubmitState("error");
        setSubmitMessage(data.message ?? "Application could not be submitted.");
        return;
      }

      window.localStorage.removeItem(draftKey);
      setSaveState("submitted");
      setSubmitState("success");
      setSubmitMessage(
        "Application submitted successfully! A moderator will review your profile within 24 hours.",
      );
    } catch {
      setSubmitState("error");
      setSubmitMessage("Network error. Please check your connection and try again.");
    }
  }

  // Show success state
  if (submitState === "success") {
    return (
      <section className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 inline-flex items-center justify-center">
            <CheckCircle2 className="h-24 w-24 text-emerald-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Application Submitted!</h1>
          <p className="mb-8 text-lg text-slate-600">{submitMessage}</p>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              We will notify you via email when your profile is reviewed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Return Home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-3 pb-20 pt-20 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <div className="mb-3 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:mb-5">
            Vet application
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
            Apply to care through pawwcure
          </h1>
          <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
            Complete the five-step application. Your profile is submitted to the
            moderator queue for review.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 sm:rounded-4xl">
          <div className="grid gap-0 md:grid-cols-[0.78fr_1.22fr]">
            <aside className="bg-emerald-950 p-5 text-white sm:p-8 md:p-10">
              <div className="mb-6 sm:mb-10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                  Application progress
                </p>
                <h2 className="mt-2 text-xl font-bold sm:mt-3 sm:text-3xl">
                  {stepTitle}
                </h2>
              </div>

              <div className="hidden space-y-4 sm:space-y-5 md:block">
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

              <div className="mb-6 grid grid-cols-5 gap-2 md:mt-10">
                {steps.map((step, index) => (
                  <span
                    className={cn(
                      "h-1 rounded-full sm:h-2",
                      index <= currentStep ? "bg-emerald-400" : "bg-white/10",
                    )}
                    key={`${step}-progress`}
                  />
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs leading-relaxed text-emerald-50 sm:rounded-4xl sm:p-5 sm:text-sm">
                {saveState === "saving" && "Saving draft..."}
                {saveState === "saved" && "✓ Draft saved"}
                {saveState === "submitted" && "✓ Application submitted"}
                {submitState === "submitting" && "Submitting..."}
                {submitState === "error" && (
                  <span className="text-red-200">{submitMessage}</span>
                )}
                {saveState === "idle" &&
                  submitState === "idle" &&
                  "Draft saves when you continue to the next step."}
              </div>
            </aside>

            <div className="p-5 sm:p-8 md:p-10 lg:p-12">
              {currentStep === 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Full name *">
                      <Input
                        autoComplete="name"
                        disabled={identityLocked}
                        onChange={(event) =>
                          updateDraft("name", event.target.value)
                        }
                        placeholder="Dr. Amina Rahman"
                        required
                        value={draft.name}
                      />
                    </FieldLabel>
                    <FieldLabel label="Phone *">
                      <Input
                        autoComplete="tel"
                        disabled={identityLocked}
                        onChange={(event) =>
                          updateDraft("phone", event.target.value)
                        }
                        placeholder="+880 1XXXXXXXXX"
                        required
                        type="tel"
                        value={draft.phone}
                      />
                    </FieldLabel>
                  </div>
                  <FieldLabel label="Email address *">
                    <Input
                      autoComplete="email"
                      disabled={identityLocked}
                      onChange={(event) =>
                        updateDraft("email", event.target.value)
                      }
                      placeholder="doctor@example.com"
                      required
                      type="email"
                      value={draft.email}
                    />
                  </FieldLabel>
                  <FieldLabel label="Password (min. 8 chars) *">
                    <Input
                      autoComplete="new-password"
                      disabled={identityLocked}
                      onChange={(event) =>
                        updateDraft("password", event.target.value)
                      }
                      placeholder="Create a secure password"
                      required
                      type="password"
                      value={draft.password}
                    />
                  </FieldLabel>
                </div>
              ) : null}

              {currentStep === 1 ? (
                <div className="space-y-4">
                  <FieldLabel label="License number *">
                    <Input
                      onChange={(event) =>
                        updateDraft("licenseNumber", event.target.value)
                      }
                      placeholder="VET-2026-001"
                      required
                      value={draft.licenseNumber}
                    />
                  </FieldLabel>
                  <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <span className="mb-3 block text-sm font-bold text-slate-700">
                      Specialties *
                    </span>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {specialtyOptions.map((specialty) => (
                        <button
                          className={cn(
                            "rounded-full border px-3 py-2 text-xs font-bold transition sm:px-4 sm:py-2 sm:text-sm",
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Languages">
                      <Input
                        onChange={(event) =>
                          updateDraft("languages", event.target.value)
                        }
                        placeholder="English, Bangla"
                        value={draft.languages}
                      />
                    </FieldLabel>
                    <FieldLabel label="Years of experience *">
                      <Input
                        min="0"
                        onChange={(event) =>
                          updateDraft("experience", event.target.value)
                        }
                        placeholder="5"
                        required
                        type="number"
                        value={draft.experience}
                      />
                    </FieldLabel>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Consult fee *">
                      <Input
                        min="0"
                        onChange={(event) =>
                          updateDraft("consultFee", event.target.value)
                        }
                        placeholder="1200"
                        required
                        type="number"
                        value={draft.consultFee}
                      />
                    </FieldLabel>
                    <FieldLabel label="Clinic name *">
                      <Input
                        onChange={(event) =>
                          updateDraft("clinicName", event.target.value)
                        }
                        placeholder="PawCare Veterinary Clinic"
                        required
                        value={draft.clinicName}
                      />
                    </FieldLabel>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="Clinic city *">
                      <Input
                        onChange={(event) =>
                          updateDraft("clinicCity", event.target.value)
                        }
                        placeholder="Dhaka"
                        required
                        value={draft.clinicCity}
                      />
                    </FieldLabel>
                    <FieldLabel label="Clinic province/division *">
                      <Input
                        onChange={(event) =>
                          updateDraft("clinicProvince", event.target.value)
                        }
                        placeholder="Dhaka"
                        required
                        value={draft.clinicProvince}
                      />
                    </FieldLabel>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                    <FieldLabel label="Clinic address *">
                      <Input
                        onChange={(event) =>
                          updateDraft("clinicAddress", event.target.value)
                        }
                        placeholder="House, road, area"
                        required
                        value={draft.clinicAddress}
                      />
                    </FieldLabel>
                    <FieldLabel label="Postal code *">
                      <Input
                        onChange={(event) =>
                          updateDraft("clinicPostalCode", event.target.value)
                        }
                        placeholder="1207"
                        required
                        value={draft.clinicPostalCode}
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
                <div className="space-y-4 sm:space-y-5">
                  <p className="text-sm text-slate-600">
                    Upload clear scans of your credentials. Accepted formats: JPG, PNG, PDF
                  </p>
                  <FieldLabel label="Profile photo *">
                    <CloudinaryUpload
                      accept="image/jpeg,image/png,image/webp"
                      asset={
                        draft.profilePhotoPublicId
                          ? {
                              bytes: 0,
                              format: "image",
                              originalFilename: draft.profilePhotoName,
                              publicId: draft.profilePhotoPublicId,
                              resourceType: "image",
                              secureUrl: draft.profilePhotoUrl,
                            }
                          : null
                      }
                      kind="avatar"
                      label="Upload a clear profile photo"
                      onUploaded={(asset) =>
                        setDraft((current) => ({
                          ...current,
                          profilePhotoName: asset.originalFilename,
                          profilePhotoPublicId: asset.publicId,
                          profilePhotoUrl: asset.secureUrl,
                        }))
                      }
                    />
                  </FieldLabel>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldLabel label="License scan *">
                      <CloudinaryUpload
                        accept="image/jpeg,image/png,application/pdf"
                        asset={
                          draft.licensePublicId && draft.licenseResourceType
                            ? {
                                bytes: 0,
                                format: "document",
                                originalFilename: draft.licenseFileName,
                                publicId: draft.licensePublicId,
                                resourceType: draft.licenseResourceType,
                                secureUrl: "",
                              }
                            : null
                        }
                        kind="vet-document"
                        label="Upload license document"
                        onUploaded={(asset) =>
                          setDraft((current) => ({
                            ...current,
                            licenseFileName: asset.originalFilename,
                            licensePublicId: asset.publicId,
                            licenseResourceType: asset.resourceType,
                          }))
                        }
                      />
                    </FieldLabel>

                    <FieldLabel label="Degree certificate *">
                      <CloudinaryUpload
                        accept="image/jpeg,image/png,application/pdf"
                        asset={
                          draft.degreePublicId && draft.degreeResourceType
                            ? {
                                bytes: 0,
                                format: "document",
                                originalFilename: draft.degreeFileName,
                                publicId: draft.degreePublicId,
                                resourceType: draft.degreeResourceType,
                                secureUrl: "",
                              }
                            : null
                        }
                        kind="vet-document"
                        label="Upload degree certificate"
                        onUploaded={(asset) =>
                          setDraft((current) => ({
                            ...current,
                            degreeFileName: asset.originalFilename,
                            degreePublicId: asset.publicId,
                            degreeResourceType: asset.resourceType,
                          }))
                        }
                      />
                    </FieldLabel>
                  </div>
                </div>
              ) : null}

              {currentStep === 4 ? (
                <div className="space-y-3 sm:space-y-4">
                  <p className="mb-4 text-sm text-slate-600">
                    Please review your information before submitting. Once submitted, a moderator will review within 24 hours.
                  </p>
                  {[
                    ["Name", draft.name],
                    ["Email", draft.email],
                    ["Phone", draft.phone],
                    ["License", draft.licenseNumber],
                    ["Authority", draft.issuingAuthority],
                    ["Experience", draft.experience + " years"],
                    ["Clinic", draft.clinicName],
                    ["City", draft.clinicCity],
                    ["Specialties", draft.specialties.join(", ") || "Not selected"],
                    ["Languages", draft.languages || "Not specified"],
                    ["Consult fee", "BDT " + draft.consultFee],
                    ["Profile photo", draft.profilePhotoName],
                    ["License scan", draft.licenseFileName],
                    ["Degree certificate", draft.degreeFileName],
                  ].map(([label, value]) => (
                    <div
                      className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:p-4"
                      key={label}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {label}
                      </span>
                      <span className="text-sm font-bold text-slate-700 wrap-break-word">
                        {value || "Not provided"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-2 sm:mt-10 sm:flex-row-reverse sm:justify-between sm:gap-3">
                <Button
                  className="w-full sm:min-w-40"
                  disabled={currentStep === 0 || saveState === "saving"}
                  onClick={goBack}
                  variant="secondary"
                >
                  Back
                </Button>

                {isFinalStep ? (
                  <Button
                    className="w-full sm:min-w-52"
                    disabled={
                      saveState === "saving" ||
                      saveState === "submitted" ||
                      submitState === "submitting" ||
                      !draft.name ||
                      !draft.email ||
                      !draft.password ||
                      !draft.profilePhotoName ||
                      !draft.profilePhotoPublicId ||
                      !draft.licenseNumber ||
                      !draft.clinicName ||
                      !draft.clinicCity ||
                      !draft.clinicProvince ||
                      !draft.clinicAddress ||
                      !draft.clinicPostalCode ||
                      !draft.licenseFileName ||
                      !draft.licensePublicId ||
                      !draft.degreeFileName
                      || !draft.degreePublicId
                    }
                    onClick={submitApplication}
                  >
                    {submitState === "submitting"
                      ? "Submitting..."
                      : "Submit Application"}
                  </Button>
                ) : (
                  <Button
                    className="w-full sm:min-w-40"
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
