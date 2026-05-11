import type { Metadata } from "next";
import { AlertCircle, Clock, MessageCircle, User } from "lucide-react";

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

export default function TicketsPage() {
  const tickets = [
    {
      id: "ticket-001",
      subject: "Cannot book consultation",
      userType: "User",
      userName: "Nadia Chowdhury",
      status: "Open",
      priority: "High",
      date: "May 2, 2026",
      lastMessage: "Getting error when trying to checkout",
    },
    {
      id: "ticket-002",
      subject: "Billing issue - duplicate charge",
      userType: "Vet",
      userName: "Dr. Amina Rahman",
      status: "In Progress",
      priority: "High",
      date: "May 1, 2026",
      lastMessage: "Was charged twice for the same consultation",
    },
    {
      id: "ticket-003",
      subject: "Profile verification status",
      userType: "Vet",
      userName: "Dr. Samuel Das",
      status: "Open",
      priority: "Medium",
      date: "April 30, 2026",
      lastMessage: "How long does verification take?",
    },
    {
      id: "ticket-004",
      subject: "App crash on consultation room",
      userType: "User",
      userName: "Ahmed Khan",
      status: "Closed",
      priority: "High",
      date: "April 29, 2026",
      lastMessage: "Resolved - user reinstalled app",
    },
    {
      id: "ticket-005",
      subject: "Feature request: video recording",
      userType: "User",
      userName: "Sara Islam",
      status: "Open",
      priority: "Low",
      date: "April 28, 2026",
      lastMessage: "Would like to record consultations for reference",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-50 text-red-700";
      case "In Progress":
        return "bg-blue-50 text-blue-700";
      case "Closed":
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-amber-100 text-amber-700";
      case "Low":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
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
            <p className="mt-2 text-3xl font-bold">3</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              In Progress
            </p>
            <p className="mt-2 text-3xl font-bold">1</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Closed
            </p>
            <p className="mt-2 text-3xl font-bold">1</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold">5</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="h-5 w-5 text-slate-400" />
                  <h3 className="text-lg font-bold">{ticket.subject}</h3>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {ticket.userType}: {ticket.userName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {ticket.date}
                  </span>
                </div>

                <p className="text-slate-700 bg-slate-50 p-3 rounded-2xl text-sm">
                  &quot;{ticket.lastMessage}&quot;
                </p>

                <div className="mt-3 flex gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
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
        ))}
      </div>
    </section>
  );
}
