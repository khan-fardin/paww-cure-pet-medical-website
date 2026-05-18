import mongoose, { Schema, type Document } from "mongoose";

export interface ITicket extends Document {
  subject: string;
  userId: mongoose.Types.ObjectId;
  userType: "user" | "vet" | "admin";
  status: "open" | "in-progress" | "closed" | "on-hold";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  description: string;
  messages: Array<{
    senderType: "user" | "support";
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    subject: { type: String, required: true, trim: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userType: {
      type: String,
      enum: ["user", "vet", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed", "on-hold"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    messages: [
      {
        senderType: {
          type: String,
          enum: ["user", "support"],
          required: true,
        },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ status: 1, priority: -1, createdAt: -1 });

export const Ticket =
  mongoose.models.Ticket ?? mongoose.model<ITicket>("Ticket", TicketSchema);
