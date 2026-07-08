import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

const updateSchema = z.object({
  avatarPublicId: z.string().min(1).max(300),
  avatarUrl: z
    .string()
    .url()
    .refine(
      (value) => new URL(value).hostname === "res.cloudinary.com",
      "Avatar must be hosted by Cloudinary.",
    ),
});

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 },
    );
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid profile image." },
      { status: 400 },
    );
  }

  const expectedPrefix = `pawwcure/avatars/${session.userId}-`;
  if (!parsed.data.avatarPublicId.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { success: false, message: "This upload does not belong to your account." },
      { status: 403 },
    );
  }

  await dbConnect();
  const user = await User.findByIdAndUpdate(
    session.userId,
    {
      avatar: parsed.data.avatarUrl,
      avatarPublicId: parsed.data.avatarPublicId,
    },
    { new: true },
  ).select("avatar name");

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Account not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { avatar: user.avatar, name: user.name },
    message: "Profile photo updated.",
  });
}
