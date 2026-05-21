"use client";

import { useState } from "react";
import { AlertCircle, Loader } from "lucide-react";

import { Button } from "@/components/ui/Button";

type PetOption = {
  breed: string;
  id: string;
  name: string;
  species: string;
};

export function BookingCheckout({
  disabled,
  duration,
  pets,
  total,
  vetId,
}: {
  disabled: boolean;
  duration: number;
  pets: PetOption[];
  total: number;
  vetId: string;
}) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startPayment() {
    setLoading(true);
    setError(null);

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 1);
    scheduledAt.setHours(19, 0, 0, 0);

    const response = await fetch("/api/bookings", {
      body: JSON.stringify({
        petId: selectedPetId,
        scheduledAt: scheduledAt.toISOString(),
        type: "video",
        vetId,
      }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const payload = (await response.json()) as {
      data?: { paymentUrl?: string };
      message?: string;
    };

    if (!response.ok || !payload.data?.paymentUrl) {
      setError(payload.message ?? "Could not start payment.");
      setLoading(false);
      return;
    }

    window.location.href = payload.data.paymentUrl;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Step 1
        </p>
        <h2 className="mt-2 text-2xl font-bold">Choose pet</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {pets.map((pet) => (
            <label
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              key={pet.id}
            >
              <input
                className="mt-1 h-4 w-4 accent-emerald-600"
                checked={selectedPetId === pet.id}
                name="petId"
                onChange={() => setSelectedPetId(pet.id)}
                type="radio"
                value={pet.id}
              />
              <span>
                <span className="block font-bold text-slate-900">
                  {pet.name}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {pet.species} / {pet.breed}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Step 2
        </p>
        <h2 className="mt-2 text-2xl font-bold">Select slot</h2>
        <p className="mt-2 text-slate-500">
          {duration} minute video session. The first version books tomorrow at
          7:00 PM while the full availability picker is being wired.
        </p>
      </div>

      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Step 3
        </p>
        <h2 className="mt-2 text-2xl font-bold">Pay with SSLCommerz</h2>
        <p className="mt-2 text-slate-500">
          You will be redirected to the SSLCommerz sandbox checkout.
        </p>
        <p className="mt-5 text-2xl font-bold text-emerald-700">
          BDT {total}
        </p>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      ) : null}

      <Button
        className="gap-2"
        disabled={disabled || loading || !selectedPetId}
        onClick={startPayment}
        type="button"
      >
        {loading ? <Loader className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Opening SSLCommerz..." : "Pay and Confirm Booking"}
      </Button>
    </div>
  );
}
