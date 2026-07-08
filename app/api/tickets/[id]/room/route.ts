import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Ticket } from "@/lib/db/models/Ticket";
import "@/lib/db/models/User";
import {
  createAgoraRtcToken,
  createAgoraSupportChannelName,
} from "@/lib/services/agora.service";

type PopulatedUser = {
  _id: { toString(): string };
  name?: string;
};

export async function GET(
  _req: Request,
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
      .populate("userId", "name")
      .populate({
        path: "assignedModId",
        select: "name",
        strictPopulate: false,
      });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const user = ticket.userId as unknown as PopulatedUser;
    const moderator = ticket.assignedModId as unknown as
      | PopulatedUser
      | undefined;
    const isUser = user._id.toString() === session.userId;
    const isAssignedModerator =
      session.role === "mod" &&
      moderator?._id.toString() === session.userId;
    const isAdmin = session.role === "admin";

    if (!isUser && !isAssignedModerator && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "You cannot join this support call" },
        { status: 403 }
      );
    }

    if (ticket.status !== "in-call") {
      return NextResponse.json(
        { success: false, message: "This support call is not active" },
        { status: 409 }
      );
    }

    if (!ticket.agoraChannelName) {
      ticket.agoraChannelName = createAgoraSupportChannelName(
        ticket._id.toString()
      );
      await ticket.save();
    }

    const agora = createAgoraRtcToken({
      channelName: ticket.agoraChannelName,
      userId: session.userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        appId: agora.appId,
        channelName: agora.channelName,
        displayName: isUser
          ? user.name ?? "pawwcure user"
          : moderator?.name ?? "pawwcure moderator",
        role: isUser ? "user" : "mod",
        ticketId: ticket._id.toString(),
        token: agora.token,
        uid: agora.uid,
      },
    });
  } catch (error) {
    console.error("[ticket-room] error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to prepare support room",
      },
      { status: 500 }
    );
  }
}
