import mongoose, { Schema, type Document } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  vetProfileId: mongoose.Types.ObjectId;
  vetId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  consultationId?: mongoose.Types.ObjectId;
  type: "video" | "audio" | "chat" | "in-clinic";
  status: "pending_payment" | "confirmed" | "payment_failed" | "cancelled";
  scheduledAt: Date;
  amount: number;
  currency: "BDT";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vetProfileId: {
      type: Schema.Types.ObjectId,
      ref: "VetProfile",
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
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
    },
    type: {
      type: String,
      enum: ["video", "audio", "chat", "in-clinic"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "payment_failed", "cancelled"],
      default: "pending_payment",
      index: true,
    },
    scheduledAt: { type: Date, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["BDT"], default: "BDT" },
    notes: String,
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ vetId: 1, scheduledAt: -1 });

export const Booking =
  mongoose.models.Booking ??
  mongoose.model<IBooking>("Booking", BookingSchema);
