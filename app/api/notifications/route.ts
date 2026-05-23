import { type NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Notification } from "@/lib/db/models/Notification";

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

    const notifications = await Notification.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .select("-__v");

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("[notifications] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
