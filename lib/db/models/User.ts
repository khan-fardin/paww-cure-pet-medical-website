import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  role: "owner" | "vet" | "mod" | "admin";
  isActive: boolean;
  refreshToken?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: String,
    phone: String,
    role: {
      type: String,
      enum: ["owner", "vet", "mod", "admin"],
      default: "owner",
    },
    isActive: { type: Boolean, default: true },
    refreshToken: String,
    avatar: String,
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export const User =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);