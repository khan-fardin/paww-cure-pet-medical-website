import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { ChatMessage } from "@/lib/db/models/ChatMessage";
import { Consultation } from "@/lib/db/models/Consultation";
import "@/lib/db/models/User";

const createMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

type PopulatedUser = {
  _id: { toString(): string };
};

type LeanMessage = {
  _id: { toString(): string };
  body: string;
  createdAt: Date;
  isSystem: boolean;
  senderId?: {
    _id?: { toString(): string };
    avatar?: string;
    name?: string;
  };
  senderRole: "user" | "vet" | "mod" | "admin";
};

function serializeMessage(message: LeanMessage) {
  return {
    id: message._id.toString(),
    body: message.body,
    createdAt: message.createdAt,
    isSystem: message.isSystem,
    sender: {
      avatar: message.senderId?.avatar ?? null,
      id: message.senderId?._id?.toString() ?? null,
      name: message.senderId?.name ?? "pawwcure",
      role: message.senderRole,
    },
  };
}

async function getAuthorizedConsultation(id: string) {
  const session = await getSession();

  if (!session) {
    return {
      response: NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      ),
      session: null,
      consultation: null,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      response: NextResponse.json(
        { success: false, message: "Invalid consultation ID" },
        { status: 400 }
      ),
      session,
      consultation: null,
    };
  }

  await dbConnect();

  const consultation = await Consultation.findById(id)
    .populate("userId", "_id")
    .populate("vetId", "_id");

  if (!consultation) {
    return {
      response: NextResponse.json(
        { success: false, message: "Consultation not found" },
        { status: 404 }
      ),
      session,
      consultation: null,
    };
  }

  const user = consultation.userId as unknown as PopulatedUser;
  const vet = consultation.vetId as unknown as PopulatedUser;
  const isUser = user._id.toString() === session.userId;
  const isVet = vet._id.toString() === session.userId;
  const isStaff = session.role === "admin" || session.role === "mod";

  if (!isUser && !isVet && !isStaff) {
    return {
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      ),
      session,
      consultation: null,
    };
  }

  return { response: null, session, consultation };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorized = await getAuthorizedConsultation(id);

    if (authorized.response) return authorized.response;

    const after = request.nextUrl.searchParams.get("after");
    const query: Record<string, unknown> = { consultationId: id };

    if (after && !Number.isNaN(Date.parse(after))) {
      query.createdAt = { $gt: new Date(after) };
    }

    const messages = await ChatMessage.find(query)
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 })
      .limit(after ? 100 : 200)
      .lean<LeanMessage[]>();

    return NextResponse.json({
      success: true,
      data: messages.map(serializeMessage),
    });
  } catch (error) {
    console.error("[consultation-messages] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorized = await getAuthorizedConsultation(id);

    if (authorized.response) return authorized.response;
    if (!authorized.session || !authorized.consultation) {
      return NextResponse.json(
        { success: false, message: "Unable to verify consultation access" },
        { status: 403 }
      );
    }

    if (
      ["cancelled", "completed", "no-show"].includes(
        authorized.consultation.status
      )
    ) {
      return NextResponse.json(
        { success: false, message: "This consultation chat is read-only" },
        { status: 409 }
      );
    }

    const parsed = createMessageSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Message cannot be empty" },
        { status: 400 }
      );
    }

    const message = await ChatMessage.create({
      body: parsed.data.body,
      consultationId: id,
      readBy: [authorized.session.userId],
      senderId: authorized.session.userId,
      senderRole: authorized.session.role,
    });
    const populated = await message.populate("senderId", "name avatar");

    return NextResponse.json(
      {
        success: true,
        data: serializeMessage(populated.toObject() as LeanMessage),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[consultation-messages] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send chat message" },
      { status: 500 }
    );
  }
}
