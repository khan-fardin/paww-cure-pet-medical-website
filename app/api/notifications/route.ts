import { type NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Notification } from "@/lib/db/models/Notification";
import { z } from "zod";

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("read"), notificationId: z.string().min(1) }),
  z.object({ action: z.literal("read-all") }),
]);

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: session.userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .select("-__v"),
      Notification.countDocuments({
        isRead: false,
        userId: session.userId,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[notifications] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid notification action" },
        { status: 400 }
      );
    }

    await dbConnect();

    if (parsed.data.action === "read-all") {
      await Notification.updateMany(
        { isRead: false, userId: session.userId },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.updateOne(
        { _id: parsed.data.notificationId, userId: session.userId },
        { $set: { isRead: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notifications] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
