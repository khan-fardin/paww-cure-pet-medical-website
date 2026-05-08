import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";
import { dbConnect } from "@/lib/db/connect";
import { Document } from "@/lib/db/models/Document";
import { Pet } from "@/lib/db/models/Pet";

// TODO: Implement S3 file upload
// TODO: Add file type validation and virus scanning
// TODO: Implement document encryption at rest
// TODO: Add document sharing permissions

const createDocumentSchema = z.object({
  petId: z.string().min(1),
  type: z.enum([
    "prescription",
    "lab-report",
    "vaccination",
    "discharge-summary",
    "medical-record",
    "x-ray",
    "other",
  ]),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  tags: z.array(z.string()).optional(),
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

    const searchParams = req.nextUrl.searchParams;
    const petId = searchParams.get("petId");

    await dbConnect();

    let query: any = { ownerId: payload.userId };

    if (petId) {
      query.petId = petId;
    }

    const documents = await Document.find(query)
      .select("-__v")
      .populate("petId", "name species breed")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("[documents] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch documents" },
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

    const body = await req.json();
    const parsed = createDocumentSchema.safeParse(body);

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

    // Verify pet ownership
    const pet = await Pet.findById(parsed.data.petId);
    if (!pet || pet.ownerId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Pet not found or not yours" },
        { status: 404 }
      );
    }

    const document = await Document.create({
      ownerId: payload.userId,
      petId: parsed.data.petId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      fileUrl: parsed.data.fileUrl,
      fileSize: parsed.data.fileSize,
      mimeType: parsed.data.mimeType,
      uploadedBy: payload.userId,
      tags: parsed.data.tags || [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Document uploaded successfully",
        data: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[documents] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload document" },
      { status: 500 }
    );
  }
}
