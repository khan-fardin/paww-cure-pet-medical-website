import mongoose, { Schema, type Document } from "mongoose";

export interface IConsultation extends Document {
  userId: mongoose.Types.ObjectId;
  vetId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  type: "video" | "audio" | "chat" | "in-clinic";
  status: "scheduled" | "ongoing" | "completed" | "cancelled" | "no-show";
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  fees: {
    consultationFee: number;
    discount?: number;
    tax?: number;
    total: number;
  };
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  recordingUrl?: string;
  isFollowUp: boolean;
  followUpDueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "audio", "chat", "in-clinic"],
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    scheduledAt: { type: Date, required: true },
    startedAt: Date,
    completedAt: Date,
    notes: String,
    diagnosis: String,
    treatmentPlan: String,
    fees: {
      consultationFee: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String,
    recordingUrl: String,
    isFollowUp: { type: Boolean, default: false },
    followUpDueDate: Date,
  },
  { timestamps: true }
);

// Indices for common queries
ConsultationSchema.index({ userId: 1, status: 1 });
ConsultationSchema.index({ vetId: 1, status: 1 });
ConsultationSchema.index({ petId: 1 });
ConsultationSchema.index({ scheduledAt: 1 });
ConsultationSchema.index({ paymentStatus: 1 });

export const Consultation =
  mongoose.models.Consultation ??
  mongoose.model<IConsultation>("Consultation", ConsultationSchema);
