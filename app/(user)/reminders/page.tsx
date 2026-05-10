"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { useReminders } from "@/lib/hooks/useReminders";

export default function RemindersPage() {
  const { reminders, loading, error, refetch } = useReminders();

  const groupedReminders = useMemo(() => {
    return {
      pending: reminders.filter(r => !r.isCompleted),
      completed: reminders.filter(r => r.isCompleted),
    };
  }, [reminders]);

  const priorityColors: Record<string, string> = {
    high: "bg-red-50 text-red-700 border-red-200",
    normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
    low: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <UserPageScaffold
      actionHref="/reminders"
      actionLabel="New Reminder"
      description="Track and manage medication schedules, follow-up care, vaccinations, and checkups."
      eyebrow="Care reminders"
      title="Reminders"
    >
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-900">Failed to load reminders</p>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={refetch}
              className="mt-2 text-sm font-bold text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm animate-pulse"
            >
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
              <div className="h-8 bg-slate-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-300 p-12 text-center">
          <Clock className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No reminders yet</h3>
          <p className="mt-2 text-slate-500">
            Create reminders for medications, vaccinations, and checkups
          </p>
          <button className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition">
            Create First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Reminders */}
          {groupedReminders.pending.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Pending</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {groupedReminders.pending.map((reminder) => (
                  <div
                    key={reminder._id}
                    className={`rounded-[2.5rem] border p-7 shadow-sm ${
                      priorityColors[reminder.priority] || priorityColors.normal
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="rounded-full bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        {reminder.type}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        reminder.priority === 'high' ? 'text-red-700' : 
                        reminder.priority === 'low' ? 'text-slate-600' :
                        'text-emerald-700'
                      }`}>
                        {reminder.priority}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold">{reminder.title}</h2>
                    {reminder.description && (
                      <p className="mt-2 text-sm opacity-75">
                        {reminder.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-sm font-semibold">
                      <span>
                        {reminder.petId ? `${reminder.petId.name}` : "General"}
                      </span>
                      <span>
                        {new Date(reminder.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Reminders */}
          {groupedReminders.completed.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Completed</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {groupedReminders.completed.map((reminder) => (
                  <div
                    key={reminder._id}
                    className="rounded-[2.5rem] border border-slate-200 bg-white/50 p-7 shadow-sm opacity-75"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        ✓ Done
                      </span>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold line-through text-slate-500">
                      {reminder.title}
                    </h2>
                    {reminder.description && (
                      <p className="mt-2 text-sm text-slate-400">
                        {reminder.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-500">
                      <span>
                        {reminder.petId ? `${reminder.petId.name}` : "General"}
                      </span>
                      <span>
                        {reminder.completedAt && new Date(reminder.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </UserPageScaffold>
  );
}
