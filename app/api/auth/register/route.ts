import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { hashPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
  console.log(parsed.error.flatten());

  return NextResponse.json(
    {
      success: false,
      errors: parsed.error.flatten(),
    },
    { status: 400 }
  );
}

    await dbConnect();

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      phone: parsed.data.phone,
      role: "user",
    });

    const accessToken = await signToken(
      { userId: user._id.toString(), role: user.role },
      "15m"
    );

    const refreshToken = await signToken(
      { userId: user._id.toString(), role: user.role },
      "7d"
    );

    await User.findByIdAndUpdate(user._id, { refreshToken });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created",
        data: { name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}