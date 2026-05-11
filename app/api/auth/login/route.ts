import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";
import { comparePassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ROLE_HOME: Record<string, string> = {
  user: "/dashboard",
  vet: "/vet/dashboard",
  mod: "/mod/dashboard",
  admin: "/admin/dashboard",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: parsed.data.email });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Account suspended" },
        { status: 403 }
      );
    }

    const vetProfile =
      user.role === "vet"
        ? await VetProfile.findOne({ userId: user._id }).select("isVerified")
        : null;

    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      ...(user.role === "vet" ? { isVerified: Boolean(vetProfile?.isVerified) } : {}),
    };

    const accessToken = await signToken(tokenPayload, "15m");

    const refreshToken = await signToken(tokenPayload, "7d");

    await User.findByIdAndUpdate(user._id, { refreshToken });

    const redirectTo = ROLE_HOME[user.role] ?? "/dashboard";

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        name: user.name,
        role: user.role,
        redirectTo,
      },
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
