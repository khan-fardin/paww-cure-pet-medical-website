"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";

type TicketHistoryModalProps = {
  category: string;
  callEndedAt?: string;
  callStartedAt?: string;
  createdAt: string;
  description: string;
  messages: {
    message: string;
    senderType: string;
    timestamp: string;
  }[];
  priority: string;
  moderatorNotes?: string;
  resolvedAt?: string;
  subject: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
};

export function TicketHistoryModal({
  category,
  callEndedAt,
  callStartedAt,
  createdAt,
  description,
  messages,
  moderatorNotes,
  priority,
  resolvedAt,
  subject,
  userEmail,
  userName,
  userPhone,
}: TicketHistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Eye className="h-4 w-4" />
        View
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[200] flex items-end bg-slate-950/40 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Resolved ticket
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {subject}
                </h2>
              </div>
              <button
                aria-label="Close ticket details"
                className="rounded-full bg-slate-100 p-2 text-slate-500"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="User" value={userName ?? "Unknown user"} />
              <Info label="Email" value={userEmail ?? "No email"} />
              <Info label="Phone" value={userPhone ?? "No phone"} />
              <Info label="Category" value={`${category} / ${priority}`} />
              <Info label="Created" value={new Date(createdAt).toLocaleString()} />
              <Info
                label="Resolved"
                value={resolvedAt ? new Date(resolvedAt).toLocaleString() : "N/A"}
              />
              <Info
                label="Call started"
                value={callStartedAt ? new Date(callStartedAt).toLocaleString() : "No call"}
              />
              <Info
                label="Call ended"
                value={callEndedAt ? new Date(callEndedAt).toLocaleString() : "No call"}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                User request
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {description}
              </p>
            </div>

            {moderatorNotes ? (
              <div className="mt-5 rounded-2xl bg-amber-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Internal moderator notes
                </p>
                <p className="mt-2 text-sm leading-relaxed text-amber-950">
                  {moderatorNotes}
                </p>
              </div>
            ) : null}

            <div className="mt-5 space-y-2">
              {messages.map((message, index) => (
                <div
                  className="rounded-2xl border border-slate-100 p-4 text-sm"
                  key={`${message.timestamp}-${index}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {message.senderType} /{" "}
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                  <p className="mt-1 text-slate-700">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}
