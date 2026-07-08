import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/Pet";
import "@/lib/db/models/User";
import { notifyUser } from "@/lib/services/notification.service";
import {
  createAgoraChannelName,
  createAgoraRtcToken,
} from "@/lib/services/agora.service";

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

    if (isUser && !consultation.agoraChannelName) {
      return NextResponse.json(
        { success: false, message: "Your vet has not started the call yet" },
        { status: 409 }
      );
    }

    if (!consultation.agoraChannelName) {
      consultation.agoraChannelName = createAgoraChannelName(
        consultation._id.toString()
      );
      await consultation.save();
    }

    const wasScheduled = consultation.status === "scheduled";

    if (wasScheduled) {
      consultation.status = "ongoing";
      consultation.startedAt = new Date();
      await consultation.save();
    }

    if (isVet && wasScheduled && req.method === "POST") {
      await notifyUser({
        body: `${vet.name ?? "Your vet"} has started the consultation. Join the room now.`,
        email: true,
        link: `/consultation/${consultation._id.toString()}`,
        title: "Your consultation is starting",
        type: "consultation",
        userId: user._id.toString(),
      });
    }

    const displayName =
      (isVet ? vet.name : user.name) ??
      (isVet ? "pawwcure vet" : "pawwcure user");
    const agora = createAgoraRtcToken({
      channelName: consultation.agoraChannelName,
      userId: session.userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        appId: agora.appId,
        channelName: agora.channelName,
        consultationId: consultation._id.toString(),
        expiresAt: agora.expiresAt,
        displayName,
        role: isVet ? "vet" : "user",
        token: agora.token,
        uid: agora.uid,
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
