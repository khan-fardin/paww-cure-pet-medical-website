import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { Reminder } from "@/lib/db/models/Reminder";
import { Pet } from "@/lib/db/models/Pet";

// TODO: Implement push notifications for reminders
// TODO: Add email reminder scheduling
// TODO: Implement recurring reminder handling
// TODO: Add reminder snooze functionality

const createReminderSchema = z.object({
  petId: z.string().min(1),
  type: z.enum(["medicine", "vaccination", "checkup", "follow-up", "other"]),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  frequency: z.enum(["once", "daily", "weekly", "monthly", "yearly"]).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    await dbConnect();

    const reminders = await Reminder.find({
      userId: payload.userId,
    })
      .select("-__v")
      .populate("petId", "name species breed")
      .sort({ dueDate: 1 });

    return NextResponse.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error("[reminders] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (payload.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only users can create reminders" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createReminderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify pet usership
    const pet = await Pet.findById(parsed.data.petId);
    if (!pet || pet.userId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Pet not found or not yours" },
        { status: 404 }
      );
    }

    const reminder = await Reminder.create({
      userId: payload.userId,
      petId: parsed.data.petId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      frequency: parsed.data.frequency || "once",
      priority: parsed.data.priority || "normal",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reminder created successfully",
        data: reminder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[reminders] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
