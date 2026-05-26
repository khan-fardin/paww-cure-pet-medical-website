import { type NextRequest, NextResponse } from "next/server";
import { signToken, verifyToken, type TokenPayload } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

async function resolvePayload(req: NextRequest): Promise<{
  payload: TokenPayload;
  shouldRefreshAccess: boolean;
}> {
  const token = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (token) {
    try {
      return {
        payload: await verifyToken(token),
        shouldRefreshAccess: false,
      };
    } catch {
      // Fall through to refresh token.
    }
  }

  if (!refreshToken) {
    throw new Error("Not authenticated");
  }

  return {
    payload: await verifyToken(refreshToken),
    shouldRefreshAccess: true,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { payload, shouldRefreshAccess } = await resolvePayload(req);

    await dbConnect();

    const user = await User.findById(payload.userId).select(
      "name email phone avatar role isActive refreshToken"
    );

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const vetProfile =
      user.role === "vet"
        ? await VetProfile.findOne({ userId: user._id }).select("isVerified")
        : null;

    const response = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });

    if (shouldRefreshAccess) {
      const accessToken = await signToken(
        {
          userId: user._id.toString(),
          role: user.role,
          ...(user.role === "vet"
            ? { isVerified: Boolean(vetProfile?.isVerified) }
            : {}),
        },
        "15m"
      );

      response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 15,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
