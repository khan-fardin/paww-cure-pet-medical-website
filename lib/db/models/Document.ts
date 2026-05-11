import mongoose, { Schema, type Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  type:
    | "prescription"
    | "lab-report"
    | "vaccination"
    | "discharge-summary"
    | "medical-record"
    | "x-ray"
    | "other";
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number; // in bytes
  mimeType: string;
  uploadedBy: mongoose.Types.ObjectId; // vet or user
  relatedConsultationId?: mongoose.Types.ObjectId;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
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
      enum: [
        "prescription",
        "lab-report",
        "vaccination",
        "discharge-summary",
        "medical-record",
        "x-ray",
        "other",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: String,
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true, min: 0 },
    mimeType: { type: String, required: true },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    relatedConsultationId: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
    },
    isPublic: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

// Indices for common queries
DocumentSchema.index({ userId: 1, petId: 1 });
DocumentSchema.index({ petId: 1 });
DocumentSchema.index({ type: 1 });
DocumentSchema.index({ uploadedBy: 1 });

export const Document =
  mongoose.models.Document ??
  mongoose.model<IDocument>("Document", DocumentSchema);
