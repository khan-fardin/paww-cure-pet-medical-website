import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

const updateRoleSchema = z.object({
  role: z.enum(["mod"]),
});

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

    if (session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admins can change account roles" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (session.userId === id) {
      return NextResponse.json(
        { success: false, message: "You cannot change your own admin role" },
        { status: 400 }
      );
    }

    const parsed = updateRoleSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid role request" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(id).select("name email role isActive");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { success: false, message: "Admin accounts cannot be reassigned here" },
        { status: 400 }
      );
    }

    if (user.role === "vet") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vet accounts keep the vet role. Assign a regular user account as moderator.",
        },
        { status: 400 }
      );
    }

    user.role = parsed.data.role;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `${user.name} is now a moderator`,
      data: {
        email: user.email,
        id: user._id.toString(),
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[admin/users/id/role] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user role" },
      { status: 500 }
    );
  }
}
