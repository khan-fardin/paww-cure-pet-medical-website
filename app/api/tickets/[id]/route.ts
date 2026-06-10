import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Ticket } from "@/lib/db/models/Ticket";

const updateTicketSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("reply"),
    message: z.string().trim().min(1).max(2000),
  }),
  z.object({ action: z.literal("assign") }),
  z.object({
    action: z.literal("start-call"),
    message: z.string().trim().max(800).optional(),
  }),
  z.object({
    action: z.literal("resolve"),
    message: z.string().trim().max(1200).optional(),
  }),
]);

function canAccessTicket(
  ticket: { userId: { toString(): string } },
  session: { role: string; userId: string }
) {
  return (
    session.role === "admin" ||
    session.role === "mod" ||
    ticket.userId.toString() === session.userId
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const ticket = await Ticket.findById(id)
      .populate("userId", "name email role")
      .populate({
        path: "assignedModId",
        select: "name email",
        strictPopulate: false,
      })
      .lean();

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    if (!canAccessTicket(ticket, session)) {
      return NextResponse.json(
        { success: false, message: "You cannot view this ticket" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("[tickets/id] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    const parsed = updateTicketSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket action" },
        { status: 400 }
      );
    }

    await dbConnect();

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    if (!canAccessTicket(ticket, session)) {
      return NextResponse.json(
        { success: false, message: "You cannot update this ticket" },
        { status: 403 }
      );
    }

    const isStaff = session.role === "mod" || session.role === "admin";

    if (
      ["assign", "start-call", "resolve"].includes(parsed.data.action) &&
      !isStaff
    ) {
      return NextResponse.json(
        { success: false, message: "Only moderators can perform this action" },
        { status: 403 }
      );
    }

    if (ticket.status === "closed") {
      return NextResponse.json(
        { success: false, message: "This ticket is already closed" },
        { status: 400 }
      );
    }

    if (parsed.data.action === "reply") {
      ticket.messages.push({
        senderId: new mongoose.Types.ObjectId(session.userId),
        senderType: isStaff ? "support" : "user",
        message: parsed.data.message,
        timestamp: new Date(),
      });

      if (isStaff && ticket.status === "open") {
        ticket.status = "in-progress";
        ticket.assignedModId ??= new mongoose.Types.ObjectId(session.userId);
      }
    }

    if (parsed.data.action === "assign") {
      ticket.assignedModId = new mongoose.Types.ObjectId(session.userId);
      if (ticket.status === "open") ticket.status = "in-progress";
      ticket.messages.push({
        senderId: new mongoose.Types.ObjectId(session.userId),
        senderType: "system",
        message: "A moderator accepted this support ticket.",
        timestamp: new Date(),
      });
    }

    if (parsed.data.action === "start-call") {
      ticket.assignedModId = new mongoose.Types.ObjectId(session.userId);
      ticket.status = "in-call";
      ticket.callToken = crypto.randomBytes(18).toString("hex");
      ticket.callStartedAt = new Date();
      ticket.callEndedAt = undefined;
      ticket.messages.push({
        senderId: new mongoose.Types.ObjectId(session.userId),
        senderType: "support",
        message:
          parsed.data.message ||
          "Moderator started a personal support call. Keep this ticket open until the issue is solved.",
        timestamp: new Date(),
      });
    }

    if (parsed.data.action === "resolve") {
      ticket.status = "closed";
      ticket.callToken = undefined;
      ticket.callEndedAt = new Date();
      ticket.resolvedAt = new Date();
      ticket.messages.push({
        senderId: new mongoose.Types.ObjectId(session.userId),
        senderType: "support",
        message: parsed.data.message || "Issue solved. Ticket closed.",
        timestamp: new Date(),
      });
    }

    await ticket.save();

    return NextResponse.json({
      success: true,
      message: "Ticket updated",
      data: { id: ticket._id.toString(), status: ticket.status },
    });
  } catch (error) {
    console.error("[tickets/id] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
