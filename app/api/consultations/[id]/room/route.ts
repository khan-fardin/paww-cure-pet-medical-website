import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Notification } from "@/lib/db/models/Notification";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";
import {
  createDailyMeetingToken,
  createDailyRoom,
} from "@/lib/services/daily.service";

type PopulatedUser = {
  _id: { toString(): string };
  name?: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return getOrCreateRoom(req, { params });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return getOrCreateRoom(req, { params });
}

async function getOrCreateRoom(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid consultation ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const consultation = await Consultation.findById(id)
      .populate("userId", "name")
      .populate("vetId", "name");

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: "Consultation not found" },
        { status: 404 }
      );
    }

    const user = consultation.userId as unknown as PopulatedUser;
    const vet = consultation.vetId as unknown as PopulatedUser;
    const isUser = user._id.toString() === session.userId;
    const isVet = vet._id.toString() === session.userId;
    const isStaff = session.role === "admin" || session.role === "mod";

    if (!isUser && !isVet && !isStaff) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (consultation.paymentStatus !== "completed") {
      return NextResponse.json(
        { success: false, message: "Payment is not confirmed yet" },
        { status: 402 }
      );
    }

    if (isUser && !consultation.dailyRoomName && !consultation.dailyRoomUrl) {
      return NextResponse.json(
        { success: false, message: "Your vet has not started the call yet" },
        { status: 409 }
      );
    }

    if (!consultation.dailyRoomName || !consultation.dailyRoomUrl) {
      const room = await createDailyRoom(consultation._id.toString());
      consultation.dailyRoomName = room.name;
      consultation.dailyRoomUrl = room.url;
      await consultation.save();
    }

    const wasScheduled = consultation.status === "scheduled";

    if (wasScheduled) {
      consultation.status = "ongoing";
      consultation.startedAt = new Date();
      await consultation.save();
    }

    if (isVet && wasScheduled && req.method === "POST") {
      await Notification.create({
        body: `${vet.name ?? "Your vet"} has started the consultation. Join the room now.`,
        link: `/consultation/${consultation._id.toString()}`,
        title: "Your consultation is starting",
        type: "consultation",
        userId: user._id,
      });
    }

    const displayName =
      (isVet ? vet.name : user.name) ??
      (isVet ? "pawwcure vet" : "pawwcure user");
    const token = await createDailyMeetingToken({
      isOwner: isVet || isStaff,
      roomName: consultation.dailyRoomName,
      userId: session.userId,
      userName: displayName,
    });

    return NextResponse.json({
      success: true,
      data: {
        consultationId: consultation._id.toString(),
        role: isVet ? "vet" : "user",
        roomName: consultation.dailyRoomName,
        roomUrl: consultation.dailyRoomUrl,
        token,
      },
    });
  } catch (error) {
    console.error("[consultation-room] error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to prepare consultation room",
      },
      { status: 500 }
    );
  }
}
