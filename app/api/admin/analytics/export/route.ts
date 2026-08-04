import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Payment } from "@/lib/db/models/Payment";
import { User } from "@/lib/db/models/User";
import "@/lib/db/models/VetProfile";

function csvEscape(value: string | number) {
  const text = String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function row(values: (string | number)[]) {
  return values.map(csvEscape).join(",");
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  if (session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Only admins can export analytics" },
      { status: 403 }
    );
  }

  await dbConnect();

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const nextMonthStart = endOfMonth(now);

  const [
    users,
    consultations,
    revenue,
    specialtyDemand,
    topVets,
  ] = await Promise.all([
    User.countDocuments({}),
    Consultation.countDocuments({
      createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
    }),
    Payment.aggregate<{ total: number; platformFee: number; vetPayout: number }>(
      [
        {
          $match: {
            paidAt: { $gte: currentMonthStart, $lt: nextMonthStart },
            status: "paid",
          },
        },
        {
          $group: {
            _id: null,
            platformFee: { $sum: "$platformFee" },
            total: { $sum: "$amount" },
            vetPayout: { $sum: "$vetPayout" },
          },
        },
      ]
    ),
    Consultation.aggregate<{ _id: string; consultations: number }>([
      {
        $match: {
          createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
        },
      },
      {
        $lookup: {
          as: "vetProfile",
          foreignField: "userId",
          from: "vetprofiles",
          localField: "vetId",
        },
      },
      { $unwind: "$vetProfile" },
      { $unwind: "$vetProfile.specializations" },
      {
        $group: {
          _id: "$vetProfile.specializations",
          consultations: { $sum: 1 },
        },
      },
      { $sort: { consultations: -1 } },
    ]),
    Consultation.aggregate<{
      _id: string;
      consultations: number;
      name?: string;
      revenue?: number;
    }>([
      {
        $match: {
          createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
        },
      },
      { $group: { _id: "$vetId", consultations: { $sum: 1 } } },
      {
        $lookup: {
          as: "user",
          foreignField: "_id",
          from: "users",
          localField: "_id",
        },
      },
      {
        $lookup: {
          as: "payments",
          foreignField: "vetId",
          from: "payments",
          localField: "_id",
        },
      },
      {
        $project: {
          consultations: 1,
          name: { $arrayElemAt: ["$user.name", 0] },
          revenue: {
            $sum: {
              $map: {
                as: "payment",
                in: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$$payment.status", "paid"] },
                        { $gte: ["$$payment.paidAt", currentMonthStart] },
                        { $lt: ["$$payment.paidAt", nextMonthStart] },
                      ],
                    },
                    "$$payment.amount",
                    0,
                  ],
                },
                input: "$payments",
              },
            },
          },
        },
      },
      { $sort: { consultations: -1, revenue: -1 } },
    ]),
  ]);

  const totals = revenue[0] ?? { platformFee: 0, total: 0, vetPayout: 0 };
  const lines = [
    row(["pawwcure analytics export"]),
    row(["Generated at", now.toISOString()]),
    row(["Period", currentMonthStart.toISOString(), nextMonthStart.toISOString()]),
    "",
    row(["Summary Metric", "Value"]),
    row(["Total users", users]),
    row(["Monthly consultations", consultations]),
    row(["Paid revenue", totals.total]),
    row(["Platform fees", totals.platformFee]),
    row(["Vet payout owed", totals.vetPayout]),
    "",
    row(["Specialty", "Consultations"]),
    ...specialtyDemand.map((item) => row([item._id, item.consultations])),
    "",
    row(["Vet", "Consultations", "Revenue"]),
    ...topVets.map((vet) =>
      row([vet.name ?? "Unknown vet", vet.consultations, vet.revenue ?? 0])
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Disposition": `attachment; filename="pawwcure-analytics-${now
        .toISOString()
        .slice(0, 10)}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
