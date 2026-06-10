import type { Metadata } from "next";
import {
  Clock,
  MessageCircle,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { SupportTicketForm } from "@/components/user/SupportTicketForm";
import { SupportTicketThread } from "@/components/user/SupportTicketThread";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Ticket } from "@/lib/db/models/Ticket";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Support | pawwcure",
};

type UserTicket = {
  _id: { toString(): string };
  callStartedAt?: Date;
  category: string;
  createdAt: Date;
  messages: { message: string; senderType: string; timestamp: Date }[];
  priority: string;
  status: "open" | "in-progress" | "in-call" | "closed" | "on-hold";
  subject: string;
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

function statusClass(status: UserTicket["status"]) {
  if (status === "closed") return "bg-emerald-50 text-emerald-700";
  if (status === "in-call") return "bg-blue-50 text-blue-700";
  if (status === "in-progress") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

export default async function SupportPage() {
  const session = await getSession();
  await dbConnect();

  const tickets = session
    ? ((await Ticket.find({ userId: session.userId })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean()) as unknown as UserTicket[])
    : [];

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2.5rem] bg-emerald-950 p-7 text-white md:rounded-[3rem] md:p-10">
          <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
            Moderator help
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ask for help when a booking, call, or payment gets stuck.
          </h1>
          <p className="mt-4 leading-relaxed text-emerald-100/70">
            A moderator can reply here, start a personal support call, and close
            the ticket after the issue is solved.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {(
              [
                [MessageCircle, "Create ticket"],
                [Phone, "Moderator call"],
                [ShieldCheck, "Resolved"],
              ] as [LucideIcon, string][]
            ).map(([Icon, label]) => (
              <div className="rounded-[2rem] bg-white/10 p-4" key={label}>
                <Icon className="h-5 w-5 text-emerald-100" />
                <p className="mt-3 text-sm font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            New support ticket
          </p>
          <h2 className="mt-1 text-2xl font-bold">Tell us what happened</h2>
          <div className="mt-6">
            <SupportTicketForm />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ticket history
            </p>
            <h2 className="mt-1 text-2xl font-bold">Your Support Requests</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {tickets.length} total
          </span>
        </div>

        <div className="space-y-4">
          {tickets.length > 0 ? (
            tickets.map((ticket) => {
              return (
                <div
                  className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5"
                  key={ticket._id.toString()}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-950">
                          {ticket.subject}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {ticket.category} / {ticket.priority} priority
                      </p>
                    </div>
                    <p className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock className="h-3 w-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <SupportTicketThread
                    callStartedAt={ticket.callStartedAt?.toISOString()}
                    messages={ticket.messages.map((message) => ({
                      message: message.message,
                      senderType: message.senderType,
                      timestamp: new Date(message.timestamp).toISOString(),
                    }))}
                    status={ticket.status}
                    ticketId={ticket._id.toString()}
                  />
                </div>
              );
            })
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-200 p-8 text-center">
              <p className="font-bold text-slate-700">No support tickets yet</p>
              <p className="mt-2 text-sm text-slate-500">
                When you ask for help, the conversation will appear here.
              </p>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
