import mongoose, { Schema, type Document } from "mongoose";

export interface IPrescription extends Document {
  consultationId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  vetId: mongoose.Types.ObjectId;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  precautions?: string[];
  dietRecommendations?: string;
  followUpInstructions?: string;
  issuedDate: Date;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    vetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: String,
      },
    ],
    precautions: [String],
    dietRecommendations: String,
    followUpInstructions: String,
    issuedDate: { type: Date, default: () => new Date() },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Indices for common queries
PrescriptionSchema.index({ consultationId: 1 });
PrescriptionSchema.index({ petId: 1 });
PrescriptionSchema.index({ vetId: 1 });
PrescriptionSchema.index({ expiryDate: 1 });

export const Prescription =
  mongoose.models.Prescription ??
  mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
