import type { Metadata } from "next";
import { Clock, Plus, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Availability | pawwcure",
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

export default function AvailabilityPage() {
  const availableSlots = [
    { day: "Monday", times: ["9:00 AM - 12:00 PM", "2:00 PM - 6:00 PM"] },
    { day: "Tuesday", times: ["9:00 AM - 12:00 PM", "2:00 PM - 6:00 PM"] },
    { day: "Wednesday", times: ["9:00 AM - 12:00 PM"] },
    { day: "Thursday", times: ["9:00 AM - 12:00 PM", "2:00 PM - 6:00 PM"] },
    { day: "Friday", times: ["9:00 AM - 12:00 PM", "2:00 PM - 6:00 PM"] },
  ];

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Availability</h1>
          <p className="mt-2 text-slate-500">
            Set your available slots for consultations
          </p>
        </div>
        <button className="rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Slot
        </button>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Consult Type Preferences</h2>
          <div className="space-y-3 flex flex-wrap gap-4">
            {["Video", "Audio", "Chat"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm font-bold">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {availableSlots.map((slot) => (
          <Card key={slot.day}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{slot.day}</h3>
                <div className="mt-3 space-y-2">
                  {slot.times.map((time) => (
                    <div
                      className="flex items-center gap-2 text-slate-600"
                      key={time}
                    >
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-red-600 hover:text-red-700 transition">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Buffer time between sessions (minutes)
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
            defaultValue="15"
            min="0"
            type="number"
          />
        </div>
      </Card>
    </section>
  );
}
