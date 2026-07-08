import mongoose, { Schema, type Document } from "mongoose";

export interface IReviewAudit extends Document {
  reviewId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  action: "reported" | "hidden" | "restored";
  reason?: string;
  previousVisibility: boolean;
  resultingVisibility: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewAuditSchema = new Schema<IReviewAudit>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["reported", "hidden", "restored"],
      required: true,
      index: true,
    },
    reason: String,
    previousVisibility: { type: Boolean, required: true },
    resultingVisibility: { type: Boolean, required: true },
  },
  { timestamps: true }
);

ReviewAuditSchema.index({ createdAt: -1 });

export const ReviewAudit =
  mongoose.models.ReviewAudit ??
  mongoose.model<IReviewAudit>("ReviewAudit", ReviewAuditSchema);
