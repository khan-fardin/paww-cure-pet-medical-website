import mongoose, { Schema, type Document } from "mongoose";

export interface IVetProfile extends Document {
  userId: mongoose.Types.ObjectId;
  licenseNumber: string;
  issuingAuthority?: string;
  licenseExpiryDate?: Date;
  specializations: string[];
  languages: string[];
  experience: number; // in years
  bio?: string;
  clinicName: string;
  clinicAddress: string;
  clinicCity: string;
  clinicProvince: string;
  clinicPostalCode: string;
  phoneNumber: string;
  servicesOffered: string[];
  consultationFee: number; // in BDT
  consultationDuration: number; // in minutes
  isVerified: boolean;
  verificationDate?: Date;
  applicationStatus: "draft" | "submitted" | "approved" | "rejected";
  rejectionReason?: string;
  profilePhotoName?: string;
  licenseDocumentName?: string;
  degreeDocumentName?: string;
  isActive: boolean;
  averageRating: number; // 0-5
  totalReviews: number;
  acceptingNewPatients: boolean;
  availability: {
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const VetProfileSchema = new Schema<IVetProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    issuingAuthority: String,
    licenseExpiryDate: Date,
    specializations: [String],
    languages: [String],
    experience: { type: Number, required: true, min: 0 },
    bio: String,
    clinicName: { type: String, required: true, trim: true },
    clinicAddress: { type: String, required: true, trim: true },
    clinicCity: { type: String, required: true, trim: true },
    clinicProvince: { type: String, required: true, trim: true },
    clinicPostalCode: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    servicesOffered: [String],
    consultationFee: { type: Number, required: true, min: 0 },
    consultationDuration: { type: Number, default: 30, min: 15 },
    isVerified: { type: Boolean, default: false },
    verificationDate: Date,
    applicationStatus: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "submitted",
      index: true,
    },
    rejectionReason: String,
    profilePhotoName: String,
    licenseDocumentName: String,
    degreeDocumentName: String,
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    acceptingNewPatients: { type: Boolean, default: true },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        startTime: String,
        endTime: String,
      },
    ],
  },
  { timestamps: true }
);

// Indices for common queries
VetProfileSchema.index({ isVerified: 1, isActive: 1 });
VetProfileSchema.index({ clinicCity: 1 });

export const VetProfile =
  mongoose.models.VetProfile ??
  mongoose.model<IVetProfile>("VetProfile", VetProfileSchema);
