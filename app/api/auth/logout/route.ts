import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("access_token")?.value;

    if (accessToken) {
      const payload = await verifyToken(accessToken);
      await dbConnect();
      await User.findByIdAndUpdate(payload.userId, { refreshToken: null });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (err) {
    console.error("[logout]", err);
    const response = NextResponse.json({
      success: true,
      message: "Logged out",
    });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }
}
