import mongoose, { Schema, type Document } from "mongoose";

export interface IPet extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  species: "dog" | "cat" | "rabbit" | "bird" | "other";
  breed: string;
  weight: number; // in kg
  dateOfBirth: Date;
  avatar?: string;
  microchipId?: string;
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  vaccinationStatus: "up-to-date" | "pending" | "overdue";
  lastVaccineDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PetSchema = new Schema<IPet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    species: {
      type: String,
      enum: ["dog", "cat", "rabbit", "bird", "other"],
      required: true,
    },
    breed: { type: String, required: true, trim: true },
    weight: { type: Number, required: true, min: 0 },
    dateOfBirth: { type: Date, required: true },
    avatar: String,
    microchipId: { type: String, unique: true, sparse: true },
    medicalConditions: [String],
    allergies: [String],
    medications: [String],
    vaccinationStatus: {
      type: String,
      enum: ["up-to-date", "pending", "overdue"],
      default: "pending",
    },
    lastVaccineDate: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indices for common queries
PetSchema.index({ userId: 1 });
PetSchema.index({ userId: 1, isActive: 1 });
PetSchema.index({ microchipId: 1 });

export const Pet =
  mongoose.models.Pet ?? mongoose.model<IPet>("Pet", PetSchema);
