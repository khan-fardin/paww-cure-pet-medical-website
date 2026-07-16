import mongoose, { Schema, type Document } from "mongoose";

export interface IChatMessage extends Document {
  consultationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: "user" | "vet" | "mod" | "admin";
  body: string;
  isSystem: boolean;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "vet", "mod", "admin"],
      required: true,
    },
    body: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    isSystem: { type: Boolean, default: false },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

ChatMessageSchema.index({ consultationId: 1, createdAt: 1 });

export const ChatMessage =
  mongoose.models.ChatMessage ??
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
