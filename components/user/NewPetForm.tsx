"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  CloudinaryUpload,
  type CloudinaryAsset,
} from "@/components/ui/CloudinaryUpload";
import { Input, Textarea } from "@/components/ui/Input";

type PetSpecies = "bird" | "cat" | "dog" | "other" | "rabbit";

type PetFormState = {
  allergies: string;
  breed: string;
  dateOfBirth: string;
  medicalConditions: string;
  medications: string;
  microchipId: string;
  name: string;
  species: PetSpecies;
  weight: string;
};

const initialState: PetFormState = {
  allergies: "",
  breed: "",
  dateOfBirth: "",
  medicalConditions: "",
  medications: "",
  microchipId: "",
  name: "",
  species: "dog",
  weight: "",
};

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function NewPetForm() {
  const router = useRouter();
  const [form, setForm] = useState<PetFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<CloudinaryAsset | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PetFormState>(
    key: K,
    value: PetFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/pets", {
      body: JSON.stringify({
        allergies: splitList(form.allergies),
        avatar: avatar?.secureUrl,
        breed: form.breed,
        dateOfBirth: form.dateOfBirth,
        medicalConditions: splitList(form.medicalConditions),
        medications: splitList(form.medications),
        microchipId: form.microchipId || undefined,
        name: form.name,
        species: form.species,
        weight: Number(form.weight),
      }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const payload = (await response.json()) as {
      message?: string;
      errors?: { fieldErrors?: Record<string, string[]> };
    };

    if (!response.ok) {
      const fieldMessage = payload.errors?.fieldErrors
        ? Object.values(payload.errors.fieldErrors).flat()[0]
        : null;

      setError(fieldMessage ?? payload.message ?? "Could not save pet.");
      setSaving(false);
      return;
    }

    router.push("/pets");
    router.refresh();
  }

  return (
    <form
      className="grid gap-6 rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm md:grid-cols-2"
      onSubmit={handleSubmit}
    >
      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 md:col-span-2">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      ) : null}

      <div className="md:col-span-2">
        <CloudinaryUpload
          accept="image/jpeg,image/png,image/webp"
          asset={avatar}
          kind="pet"
          label="Add a pet photo"
          onUploaded={setAvatar}
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Pet name
        </span>
        <Input
          disabled={saving}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Luna"
          required
          value={form.name}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Species
        </span>
        <select
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#1A1A1A] outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
          disabled={saving}
          onChange={(event) => update("species", event.target.value as PetSpecies)}
          value={form.species}
        >
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="rabbit">Rabbit</option>
          <option value="bird">Bird</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Breed
        </span>
        <Input
          disabled={saving}
          onChange={(event) => update("breed", event.target.value)}
          placeholder="Persian"
          required
          value={form.breed}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Weight in kg
        </span>
        <Input
          disabled={saving}
          min="0.1"
          onChange={(event) => update("weight", event.target.value)}
          placeholder="4.8"
          required
          step="0.1"
          type="number"
          value={form.weight}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Date of birth
        </span>
        <Input
          disabled={saving}
          onChange={(event) => update("dateOfBirth", event.target.value)}
          required
          type="date"
          value={form.dateOfBirth}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Microchip ID
        </span>
        <Input
          disabled={saving}
          onChange={(event) => update("microchipId", event.target.value)}
          placeholder="Optional"
          value={form.microchipId}
        />
      </label>

      <label className="block md:col-span-2">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Medical conditions
        </span>
        <Textarea
          disabled={saving}
          onChange={(event) => update("medicalConditions", event.target.value)}
          placeholder="Separate multiple conditions with commas."
          value={form.medicalConditions}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Allergies
        </span>
        <Textarea
          disabled={saving}
          onChange={(event) => update("allergies", event.target.value)}
          placeholder="Chicken, pollen"
          value={form.allergies}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Current medications
        </span>
        <Textarea
          disabled={saving}
          onChange={(event) => update("medications", event.target.value)}
          placeholder="Separate multiple medicines with commas."
          value={form.medications}
        />
      </label>

      <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
        <Button className="gap-2" disabled={saving} type="submit">
          {saving ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Pet"}
        </Button>
        <Button
          disabled={saving}
          onClick={() => router.push("/pets")}
          type="button"
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
