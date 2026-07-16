import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import {
  getCloudinary,
  getCloudinaryClientConfig,
} from "@/lib/config/cloudinary";

const requestSchema = z.object({
  kind: z.enum(["avatar", "pet", "vet-document"]),
});

export const runtime = "nodejs";

const uploadPolicy = {
  avatar: {
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    folder: "pawwcure/avatars",
    maxBytes: 5 * 1024 * 1024,
    resourceType: "image",
    type: "upload",
  },
  pet: {
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    folder: "pawwcure/pets",
    maxBytes: 5 * 1024 * 1024,
    resourceType: "image",
    type: "upload",
  },
  "vet-document": {
    allowedFormats: ["jpg", "jpeg", "png", "pdf"],
    folder: "pawwcure/vet-documents",
    maxBytes: 10 * 1024 * 1024,
    resourceType: "auto",
    type: "authenticated",
  },
} as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Log in before uploading files." },
        { status: 401 }
      );
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid upload type." },
        { status: 400 }
      );
    }

    if (parsed.data.kind === "vet-document" && session.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only applicants can upload credentials." },
        { status: 403 }
      );
    }

    const policy = uploadPolicy[parsed.data.kind];
    const timestamp = Math.floor(Date.now() / 1000);
    const publicIdPrefix = `${session.userId}-${crypto.randomUUID()}`;
    const paramsToSign = {
      folder: policy.folder,
      public_id: publicIdPrefix,
      timestamp,
      type: policy.type,
    };
    const signature = getCloudinary().utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      data: {
        ...getCloudinaryClientConfig(),
        ...paramsToSign,
        allowedFormats: policy.allowedFormats,
        maxBytes: policy.maxBytes,
        resourceType: policy.resourceType,
        signature,
      },
    });
  } catch (error) {
    console.error("[media/sign] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not prepare Cloudinary upload.",
      },
      { status: 500 }
    );
  }
}
