import type { Metadata } from "next";
import { MessageCircle, User, Clock } from "lucide-react";

import { Ticket } from "@/lib/db/models/Ticket";
import { User as UserModel } from "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "Support Tickets | pawwcure",
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

function getStatusColor(status: string) {
  switch (status) {
    case "open":
      return "bg-red-50 text-red-700";
    case "in-progress":
      return "bg-blue-50 text-blue-700";
    case "closed":
      return "bg-emerald-50 text-emerald-700";
    case "on-hold":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-50 text-slate-700";
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    case "low":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(date: Date | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TicketsPage() {
  // Fetch all tickets with user info
  const allTickets = await Ticket.find({})
    .populate("userId", "name role")
    .sort({ createdAt: -1 })
    .lean();

  const tickets = allTickets as any[];

  // Calculate status counts
  const statusCounts = {
    open: tickets.filter((t) => t.status === "open").length,
    "in-progress": tickets.filter((t) => t.status === "in-progress").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    "on-hold": tickets.filter((t) => t.status === "on-hold").length,
  };

  const lastMessage = (ticket: any): string => {
    if (ticket.messages && ticket.messages.length > 0) {
      return ticket.messages[ticket.messages.length - 1].message;
    }
    return ticket.description;
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="mt-2 text-slate-500">
          Manage user and vet support requests
        </p>
      </div>

      <Card>
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Open
            </p>
            <p className="mt-2 text-3xl font-bold">{statusCounts.open}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              In Progress
            </p>
            <p className="mt-2 text-3xl font-bold">{statusCounts["in-progress"]}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Closed
            </p>
            <p className="mt-2 text-3xl font-bold">{statusCounts.closed}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold">{tickets.length}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <Card key={ticket._id?.toString()}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircle className="h-5 w-5 text-slate-400" />
                    <h3 className="text-lg font-bold">{ticket.subject}</h3>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {(ticket.userId as any)?.name || "Unknown User"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-3 rounded-2xl text-sm">
                    &quot;{lastMessage(ticket)}&quot;
                  </p>

                  <div className="mt-3 flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace("-", " ")}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
                    View
                  </button>
                  <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                    Assign
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-slate-500">No support tickets</p>
          </Card>
        )}
      </div>
    </section>
  );
}
