"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

type AvailabilityItem = {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  endTime: string;
  startTime: string;
};

const days: AvailabilityItem["day"][] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function blankSlot(): AvailabilityItem {
  return { day: "monday", endTime: "17:00", startTime: "09:00" };
}

export function AvailabilityManager({
  initialAvailability,
  vetProfileId,
}: {
  initialAvailability: AvailabilityItem[];
  vetProfileId: string;
}) {
  const [availability, setAvailability] = useState<AvailabilityItem[]>(
    initialAvailability.length > 0 ? initialAvailability : [blankSlot()]
  );
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  function updateSlot(
    index: number,
    key: keyof AvailabilityItem,
    value: string
  ) {
    setAvailability((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [key]: value } : slot
      )
    );
    setState("idle");
    setMessage("");
  }

  function addSlot() {
    setAvailability((current) => [...current, blankSlot()]);
  }

  function removeSlot(index: number) {
    setAvailability((current) =>
      current.length === 1
        ? [blankSlot()]
        : current.filter((_, slotIndex) => slotIndex !== index)
    );
  }

  async function saveAvailability() {
    setState("saving");
    setMessage("");

    const invalid = availability.some(
      (slot) => slot.startTime >= slot.endTime
    );

    if (invalid) {
      setState("error");
      setMessage("Each slot needs an end time after the start time.");
      return;
    }

    const response = await fetch(`/api/vets/${vetProfileId}/availability`, {
      body: JSON.stringify({ availability }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      setState("error");
      setMessage(payload?.message ?? "Could not save availability.");
      return;
    }

    setState("saved");
    setMessage("Availability saved.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Weekly Availability</h2>
            <p className="mt-1 text-sm text-slate-500">
              These windows generate bookable slots based on your consultation
              duration.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
            onClick={addSlot}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Slot
          </button>
        </div>

        <div className="space-y-3">
          {availability.map((slot, index) => (
            <div
              className="grid gap-3 rounded-[2rem] bg-slate-50 p-4 sm:grid-cols-[1fr_140px_140px_auto]"
              key={`${slot.day}-${index}`}
            >
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Day
                </span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold capitalize outline-none"
                  onChange={(event) =>
                    updateSlot(index, "day", event.target.value)
                  }
                  value={slot.day}
                >
                  {days.map((day) => (
                    <option className="capitalize" key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Start
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none"
                  onChange={(event) =>
                    updateSlot(index, "startTime", event.target.value)
                  }
                  type="time"
                  value={slot.startTime}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  End
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none"
                  onChange={(event) =>
                    updateSlot(index, "endTime", event.target.value)
                  }
                  type="time"
                  value={slot.endTime}
                />
              </label>

              <button
                className="inline-flex h-12 items-center justify-center self-end rounded-2xl bg-red-50 px-4 text-red-600"
                onClick={() => removeSlot(index)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${
            state === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-4 font-bold text-white disabled:bg-slate-300 sm:w-auto"
        disabled={state === "saving"}
        onClick={saveAvailability}
        type="button"
      >
        <Save className="h-4 w-4" />
        {state === "saving" ? "Saving..." : "Save Availability"}
      </button>
    </div>
  );
}
