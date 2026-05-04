import type { Metadata } from "next";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { demoReminders } from "@/lib/demo/userContent";

export const metadata: Metadata = {
  title: "Reminders | pawwcure",
};

export default function RemindersPage() {
  return (
    <UserPageScaffold
      actionHref="/reminders"
      actionLabel="New Reminder"
      description="Reminder workspace skeleton for medicine schedules, follow-up care, and notification delivery channels."
      eyebrow="Care reminders"
      title="Reminders"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {demoReminders.map((reminder) => (
          <div
            className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm"
            key={reminder.id}
          >
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {reminder.type}
            </span>
            <h2 className="mt-5 text-2xl font-bold">{reminder.title}</h2>
            <p className="mt-2 text-slate-500">
              {reminder.petName} / {reminder.dueAt}
            </p>
          </div>
        ))}
      </div>
    </UserPageScaffold>
  );
}
