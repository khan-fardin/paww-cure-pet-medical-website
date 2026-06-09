"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader } from "lucide-react";

import { Button } from "@/components/ui/Button";

type PetOption = {
  breed: string;
  id: string;
  name: string;
  species: string;
};

type AvailabilitySlot = {
  end: string;
  label: string;
  start: string;
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
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadSlots() {
      setSlotsLoading(true);
      const response = await fetch(`/api/vets/${vetId}/availability`);
      const payload = (await response.json().catch(() => null)) as
        | { data?: { slots?: AvailabilitySlot[] }; message?: string }
        | null;

      if (ignore) return;

      if (!response.ok) {
        setError(payload?.message ?? "Could not load available slots.");
        setSlots([]);
      } else {
        const nextSlots = payload?.data?.slots ?? [];
        setSlots(nextSlots);
        setSelectedSlot(nextSlots[0]?.start ?? "");
      }

      setSlotsLoading(false);
    }

    void loadSlots();

    return () => {
      ignore = true;
    };
  }, [vetId]);

  async function startPayment() {
    setError(null);

    if (!selectedSlot) {
      setError("Please select an available slot.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/bookings", {
      body: JSON.stringify({
        petId: selectedPetId,
        scheduledAt: selectedSlot,
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
          Choose a real {duration} minute slot from the vet&apos;s saved
          availability.
        </p>
        <div className="mt-4 grid gap-3">
          {slotsLoading ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
              Loading available slots...
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
              No available slots right now. Please check back later.
            </div>
          ) : (
            slots.slice(0, 12).map((slot) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
                key={slot.start}
              >
                <input
                  checked={selectedSlot === slot.start}
                  className="mt-1 h-4 w-4 accent-emerald-600"
                  name="slot"
                  onChange={() => setSelectedSlot(slot.start)}
                  type="radio"
                  value={slot.start}
                />
                <span className="text-sm font-bold text-slate-700">
                  {slot.label}
                </span>
              </label>
            ))
          )}
        </div>
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
        disabled={disabled || slotsLoading || loading || !selectedPetId || !selectedSlot}
        onClick={startPayment}
        type="button"
      >
        {loading ? <Loader className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Opening SSLCommerz..." : "Pay and Confirm Booking"}
      </Button>
    </div>
  );
}
