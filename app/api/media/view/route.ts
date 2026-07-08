import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { getCloudinary } from "@/lib/config/cloudinary";
import { dbConnect } from "@/lib/db/connect";
import { VetProfile } from "@/lib/db/models/VetProfile";

const querySchema = z.object({
  publicId: z.string().min(1).max(300),
  resourceType: z.enum(["image", "raw", "video"]).default("image"),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 },
    );
  }

  const parsed = querySchema.safeParse({
    publicId: request.nextUrl.searchParams.get("publicId"),
    resourceType: request.nextUrl.searchParams.get("resourceType") ?? "image",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid document reference." },
      { status: 400 },
    );
  }

  await dbConnect();
  const profile = await VetProfile.findOne({
    $or: [
      { degreeDocumentPublicId: parsed.data.publicId },
      { licenseDocumentPublicId: parsed.data.publicId },
    ],
  }).select("userId");

  const canReview = session.role === "admin" || session.role === "mod";
  const ownsDocument =
    profile?.userId.toString() === session.userId && session.role === "vet";

  if (!profile || (!canReview && !ownsDocument)) {
    return NextResponse.json(
      { success: false, message: "You cannot view this document." },
      { status: 403 },
    );
  }

  const signedUrl = getCloudinary().url(parsed.data.publicId, {
    resource_type: parsed.data.resourceType,
    secure: true,
    sign_url: true,
    type: "authenticated",
  });

  return NextResponse.redirect(signedUrl);
}
