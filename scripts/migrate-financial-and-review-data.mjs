import mongoose from "mongoose";

const APPLY = process.argv.includes("--apply");
const PLATFORM_COMMISSION_RATE = 0.2;

function calculatePaymentSplit(amount) {
  const safeAmount = Number.isFinite(amount) && amount >= 0 ? amount : 0;
  const platformFee = Math.round(safeAmount * PLATFORM_COMMISSION_RATE);

  return {
    platformFee,
    vetPayout: Math.max(safeAmount - platformFee, 0),
  };
}

async function backfillPayments(db) {
  const payments = db.collection("payments");
  const rows = await payments
    .find(
      {
        status: "paid",
      },
      {
        projection: {
          amount: 1,
          payoutStatus: 1,
          platformFee: 1,
          vetPayout: 1,
        },
      }
    )
    .toArray();

  const operations = rows.flatMap((payment) => {
    const split = calculatePaymentSplit(Number(payment.amount));
    const payoutStatus =
      payment.payoutStatus === "paid" ? "paid" : "pending";
    const alreadyCorrect =
      payment.platformFee === split.platformFee &&
      payment.vetPayout === split.vetPayout &&
      payment.payoutStatus === payoutStatus;

    return alreadyCorrect
      ? []
      : [
          {
            updateOne: {
              filter: { _id: payment._id },
              update: {
                $set: {
                  payoutStatus,
                  platformFee: split.platformFee,
                  vetPayout: split.vetPayout,
                },
              },
            },
          },
        ];
  });

  const unpaidResult = APPLY
    ? await payments.updateMany(
        {
          status: { $ne: "paid" },
          $or: [
            { platformFee: { $exists: false } },
            { vetPayout: { $exists: false } },
            { payoutStatus: { $exists: false } },
          ],
        },
        {
          $set: {
            platformFee: 0,
            payoutStatus: "pending",
            vetPayout: 0,
          },
        }
      )
    : null;

  if (APPLY && operations.length > 0) {
    await payments.bulkWrite(operations, { ordered: false });
  }

  return {
    paidPaymentsScanned: rows.length,
    paidPaymentsToUpdate: operations.length,
    unpaidPaymentsUpdated: unpaidResult?.modifiedCount ?? 0,
  };
}

async function backfillVetRatings(db) {
  const reviews = db.collection("reviews");
  const vetProfiles = db.collection("vetprofiles");

  const [ratingRows, profiles] = await Promise.all([
    reviews
      .aggregate([
        { $match: { isVisible: true } },
        {
          $group: {
            _id: "$vetId",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    vetProfiles
      .find({}, { projection: { averageRating: 1, totalReviews: 1, userId: 1 } })
      .toArray(),
  ]);

  const ratingMap = new Map(
    ratingRows.map((row) => [
      row._id.toString(),
      {
        averageRating: Math.round(row.averageRating * 10) / 10,
        totalReviews: row.totalReviews,
      },
    ])
  );

  const operations = profiles.flatMap((profile) => {
    const stats = ratingMap.get(profile.userId.toString()) ?? {
      averageRating: 0,
      totalReviews: 0,
    };
    const alreadyCorrect =
      profile.averageRating === stats.averageRating &&
      profile.totalReviews === stats.totalReviews;

    return alreadyCorrect
      ? []
      : [
          {
            updateOne: {
              filter: { _id: profile._id },
              update: { $set: stats },
            },
          },
        ];
  });

  if (APPLY && operations.length > 0) {
    await vetProfiles.bulkWrite(operations, { ordered: false });
  }

  return {
    profilesScanned: profiles.length,
    profilesToUpdate: operations.length,
    visibleReviewGroups: ratingRows.length,
  };
}

async function ensureIndexes(db) {
  const definitions = [
    ["payments", { vetId: 1, payoutStatus: 1, status: 1 }],
    ["payments", { tranId: 1 }, { unique: true }],
    ["reviews", { consultationId: 1 }, { unique: true }],
    ["reviews", { vetId: 1, isVisible: 1 }],
    ["vetprofiles", { userId: 1 }, { unique: true }],
    ["vetprofiles", { isVerified: 1, isActive: 1 }],
  ];

  if (!APPLY) {
    return { indexesToEnsure: definitions.length };
  }

  for (const [collectionName, keys, options = {}] of definitions) {
    const collection = db.collection(collectionName);
    let indexes = [];

    try {
      indexes = await collection.listIndexes().toArray();
    } catch (error) {
      if (error?.code !== 26) throw error;
    }

    const existing = indexes.find(
      (index) => JSON.stringify(index.key) === JSON.stringify(keys)
    );

    if (existing) {
      if (options.unique && !existing.unique) {
        throw new Error(
          `${collectionName} already has a non-unique index for ${JSON.stringify(
            keys
          )}; inspect duplicates before converting it`
        );
      }
      continue;
    }

    await collection.createIndex(keys, options);
  }

  return { indexesEnsured: definitions.length };
}

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(uri, { maxPoolSize: 5 });
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection did not provide a database");
  }

  console.log(
    APPLY
      ? "Applying financial/review migration..."
      : "Dry run only. Pass --apply to write changes."
  );

  const paymentSummary = await backfillPayments(db);
  const reviewSummary = await backfillVetRatings(db);
  const indexSummary = await ensureIndexes(db);

  console.table({
    payments: paymentSummary,
    reviews: reviewSummary,
    indexes: indexSummary,
  });
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
