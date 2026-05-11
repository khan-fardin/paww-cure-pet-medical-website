import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { signToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(refreshToken);

    await dbConnect();
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
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

    const newAccessToken = await signToken(
      {
        userId: user._id.toString(),
        role: user.role,
        ...(user.role === "vet"
          ? { isVerified: Boolean(vetProfile?.isVerified) }
          : {}),
      },
      "15m"
    );

    const response = NextResponse.json({
      success: true,
      message: "Token refreshed",
    });

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[refresh]", err);
    return NextResponse.json(
      { success: false, message: "Token refresh failed" },
      { status: 401 }
    );
  }
}
