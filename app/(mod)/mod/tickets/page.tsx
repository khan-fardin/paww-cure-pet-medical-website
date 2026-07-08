import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, Phone, PhoneCall, User } from "lucide-react";

import { TicketActions } from "@/components/mod/TicketActions";
import { TicketHistoryModal } from "@/components/mod/TicketHistoryModal";
import { dbConnect } from "@/lib/db/connect";
import { Ticket } from "@/lib/db/models/Ticket";
import "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Support Tickets | pawwcure",
};

type ModTicket = {
  _id: { toString(): string };
  assignedModId?: { email?: string; name?: string };
  callEndedAt?: Date;
  callStartedAt?: Date;
  category: string;
  createdAt: Date;
  description: string;
  messages: { message: string; senderType: string; timestamp: Date }[];
  moderatorNotes?: string;
  priority: "low" | "medium" | "high" | "critical";
  resolvedAt?: Date;
  status: "open" | "in-progress" | "in-call" | "closed" | "on-hold";
  subject: string;
  userId?: { email?: string; name?: string; phone?: string; role?: string };
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

function statusClass(status: ModTicket["status"]) {
  if (status === "open") return "bg-red-50 text-red-700";
  if (status === "in-progress") return "bg-blue-50 text-blue-700";
  if (status === "in-call") return "bg-purple-50 text-purple-700";
  if (status === "closed") return "bg-emerald-50 text-emerald-700";
  return "bg-amber-50 text-amber-700";
}

function priorityClass(priority: ModTicket["priority"]) {
  if (priority === "critical") return "bg-red-100 text-red-700";
  if (priority === "high") return "bg-orange-100 text-orange-700";
  if (priority === "medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function formatDate(date: Date | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

export default async function TicketsPage() {
  await dbConnect();

  const tickets = (await Ticket.find({})
    .populate("userId", "name email phone role")
    .populate({
      path: "assignedModId",
      select: "name email",
      strictPopulate: false,
    })
    .sort({ status: 1, priority: -1, updatedAt: -1 })
    .limit(100)
    .lean()) as unknown as ModTicket[];
  const activeTickets = tickets.filter((ticket) => ticket.status !== "closed");
  const closedTickets = tickets.filter((ticket) => ticket.status === "closed");

  const statusCounts = {
    open: tickets.filter((ticket) => ticket.status === "open").length,
    active: tickets.filter((ticket) =>
      ["in-progress", "in-call"].includes(ticket.status)
    ).length,
    closed: tickets.filter((ticket) => ticket.status === "closed").length,
    total: tickets.length,
  };

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          Support operations
        </div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Reply to users, start a personal support call when they are blocked,
          and close the ticket after the problem is solved.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Open" value={statusCounts.open} />
        <Metric label="Active" value={statusCounts.active} />
        <Metric label="Closed" value={statusCounts.closed} />
        <Metric label="Total" value={statusCounts.total} />
      </div>

      <div className="space-y-4">
        {activeTickets.length > 0 ? (
          activeTickets.map((ticket) => {
            const id = ticket._id.toString();
            const lastMessage =
              ticket.messages.at(-1)?.message || ticket.description;
            const phone = ticket.userId?.phone;

            return (
              <Card
                className={ticket.status === "in-call" ? "border-blue-200" : ""}
                key={id}
              >
                <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityClass(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {ticket.category}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-950">
                          {ticket.subject}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {ticket.userId?.name || "Unknown user"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {ticket.userId?.email || "No email"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {phone || "No phone"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(ticket.createdAt)}
                          </span>
                          {ticket.status === "in-call" ? (
                            <span className="flex items-center gap-1 font-bold text-blue-700">
                              <PhoneCall className="h-4 w-4" />
                              Support call active
                            </span>
                          ) : null}
                          {ticket.callStartedAt ? (
                            <span className="text-xs font-bold text-slate-400">
                              Started {formatDate(ticket.callStartedAt)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <Info label="Subject" value={ticket.subject} />
                      <Info label="Category" value={ticket.category} />
                      <Info label="Priority" value={ticket.priority} />
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        User message from form
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Latest update
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-amber-900">
                        {lastMessage}
                      </p>
                    </div>

                    <div className="mt-5 space-y-2">
                      {ticket.messages.slice(-3).map((message, index) => (
                        <div
                          className="rounded-2xl border border-slate-100 bg-white p-3 text-sm"
                          key={`${id}-${index}`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {message.senderType} /{" "}
                            {formatDate(message.timestamp)}
                          </p>
                          <p className="mt-1 text-slate-600">
                            {message.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-slate-50 p-4">
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Assigned moderator
                      </p>
                      <p className="mt-1 font-bold text-slate-800">
                        {ticket.assignedModId?.name ?? "Unassigned"}
                      </p>
                    </div>
                    <TicketActions
                      phone={phone}
                      status={ticket.status}
                      ticketId={id}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <p className="font-bold text-slate-700">No support tickets</p>
            <p className="mt-1 text-sm text-slate-500">
              Active user support requests will appear here.
            </p>
          </Card>
        )}
      </div>

      <Card>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              History
            </p>
            <h2 className="mt-1 text-2xl font-bold">Resolved Tickets</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {closedTickets.length}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {closedTickets.length > 0 ? (
            closedTickets.map((ticket) => (
              <div
                className="grid gap-3 py-4 md:grid-cols-[1fr_auto]"
                key={ticket._id.toString()}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-slate-950">
                      {ticket.subject}
                    </h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      resolved
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.userId?.name ?? "Unknown user"} /{" "}
                    {ticket.category} / {formatDate(ticket.resolvedAt)}
                  </p>
                </div>

                <TicketHistoryModal
                  category={ticket.category}
                  callEndedAt={ticket.callEndedAt?.toISOString()}
                  callStartedAt={ticket.callStartedAt?.toISOString()}
                  createdAt={new Date(ticket.createdAt).toISOString()}
                  description={ticket.description}
                  messages={ticket.messages.map((message) => ({
                    message: message.message,
                    senderType: message.senderType,
                    timestamp: new Date(message.timestamp).toISOString(),
                  }))}
                  priority={ticket.priority}
                  moderatorNotes={ticket.moderatorNotes}
                  resolvedAt={ticket.resolvedAt?.toISOString()}
                  subject={ticket.subject}
                  userEmail={ticket.userId?.email}
                  userName={ticket.userId?.name}
                  userPhone={ticket.userId?.phone}
                />
              </div>
            ))
          ) : (
            <p className="py-4 text-sm font-semibold text-slate-500">
              No resolved support tickets yet.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
