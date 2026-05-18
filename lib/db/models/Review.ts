import mongoose, { Schema, type Document } from "mongoose";

export interface IReview extends Document {
  consultationId: mongoose.Types.ObjectId;
  vetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId; // alias for userId
  rating: number; // 1-5
  title: string;
  comment: string;
  professionalism: number; // 1-5
  communication: number; // 1-5
  punctuality: number; // 1-5
  cleanliness: number; // 1-5
  isVerifiedPurchase: boolean;
  helpful: number; // count of helpful votes
  isVisible: boolean;
  flagReason?: string;
  flaggedBy?: string;
  response?: {
    vetResponse: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
      unique: true,
    },
    vetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    professionalism: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    isVerifiedPurchase: { type: Boolean, default: true },
    helpful: { type: Number, default: 0, min: 0 },
    isVisible: { type: Boolean, default: true },
    flagReason: String,
    flaggedBy: String,
    response: {
      vetResponse: String,
      respondedAt: Date,
    },
  },
  { timestamps: true }
);

// Indices for common queries
ReviewSchema.index({ vetId: 1 });
ReviewSchema.index({ vetId: 1, isVisible: 1 });
ReviewSchema.index({ userId: 1 });

export const Review =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", ReviewSchema);
