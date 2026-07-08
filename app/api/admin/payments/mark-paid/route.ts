import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Payment } from "@/lib/db/models/Payment";
import { notifyUser } from "@/lib/services/notification.service";

const markPaidSchema = z.object({
  vetId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid vet",
  }),
});

export async function POST(req: NextRequest) {
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
        { success: false, message: "Only admins can mark payouts paid" },
        { status: 403 }
      );
    }

    const parsed = markPaidSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payout request" },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await Payment.updateMany(
      {
        payoutStatus: "pending",
        status: "paid",
        vetId: parsed.data.vetId,
      },
      { $set: { payoutStatus: "paid" } }
    );

    if (result.modifiedCount > 0) {
      await notifyUser({
        body: `${result.modifiedCount} consultation payout record${
          result.modifiedCount === 1 ? " was" : "s were"
        } marked paid by pawwcure.`,
        email: true,
        link: "/vet/earnings",
        title: "Payout completed",
        type: "payout",
        userId: parsed.data.vetId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Vet payout marked paid",
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("[admin/payments/mark-paid] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark payout paid" },
      { status: 500 }
    );
  }
}
