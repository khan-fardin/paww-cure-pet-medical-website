import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Ticket } from "@/lib/db/models/Ticket";
import { notifyRoles } from "@/lib/services/notification.service";

const createTicketSchema = z.object({
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(2000),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  subject: z.string().trim().min(3).max(140),
});

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const query =
      session.role === "mod" || session.role === "admin"
        ? {}
        : { userId: session.userId };

    const tickets = await Ticket.find(query)
      .populate("userId", "name email role")
      .populate({
        path: "assignedModId",
        select: "name email",
        strictPopulate: false,
      })
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error("[tickets] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load tickets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (session.role === "admin" || session.role === "mod") {
      return NextResponse.json(
        { success: false, message: "Use a user account to open support tickets" },
        { status: 403 }
      );
    }

    const parsed = createTicketSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Please complete the support request" },
        { status: 400 }
      );
    }

    await dbConnect();

    const ticket = await Ticket.create({
      ...parsed.data,
      userId: session.userId,
      userType: session.role,
      messages: [
        {
          senderId: session.userId,
          senderType: "user",
          message: parsed.data.description,
          timestamp: new Date(),
        },
      ],
    });

    await Promise.all([
      notifyRoles({
        body: `${parsed.data.priority.toUpperCase()} priority: ${parsed.data.subject}`,
        link: "/mod/tickets",
        roles: ["mod"],
        title: "New support ticket",
        type: "support",
      }),
      notifyRoles({
        body: `${parsed.data.priority.toUpperCase()} priority support ticket was opened.`,
        link: "/admin/dashboard",
        roles: ["admin"],
        title: "Support activity",
        type: "support",
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Support ticket created",
        data: { id: ticket._id.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[tickets] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
