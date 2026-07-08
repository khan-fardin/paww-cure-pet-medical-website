import mongoose, { Schema, type Document } from "mongoose";

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  consultationId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  vetId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  gateway: "sslcommerz";
  tranId: string;
  gatewaySessionKey?: string;
  gatewayTranId?: string;
  amount: number;
  currency: "BDT";
  platformFee: number;
  vetPayout: number;
  payoutStatus: "pending" | "paid";
  status: "pending" | "paid" | "failed" | "cancelled";
  rawPayload?: Record<string, unknown>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    gateway: { type: String, enum: ["sslcommerz"], default: "sslcommerz" },
    tranId: { type: String, required: true, unique: true, index: true },
    gatewaySessionKey: String,
    gatewayTranId: String,
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["BDT"], default: "BDT" },
    platformFee: { type: Number, default: 0, min: 0 },
    vetPayout: { type: Number, default: 0, min: 0 },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    rawPayload: Schema.Types.Mixed,
    paidAt: Date,
  },
  { timestamps: true }
);

PaymentSchema.index({ vetId: 1, payoutStatus: 1, status: 1 });

export const Payment =
  mongoose.models.Payment ??
  mongoose.model<IPayment>("Payment", PaymentSchema);
