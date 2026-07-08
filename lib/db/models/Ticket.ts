import mongoose, { Schema, type Document } from "mongoose";

export interface ITicket extends Document {
  subject: string;
  userId: mongoose.Types.ObjectId;
  assignedModId?: mongoose.Types.ObjectId;
  userType: "user" | "vet" | "admin" | "mod";
  status: "open" | "in-progress" | "in-call" | "closed" | "on-hold";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  description: string;
  callToken?: string;
  agoraChannelName?: string;
  callStartedAt?: Date;
  callEndedAt?: Date;
  moderatorNotes?: string;
  resolvedAt?: Date;
  messages: Array<{
    senderType: "user" | "support" | "system";
    senderId?: mongoose.Types.ObjectId;
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
    assignedModId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userType: {
      type: String,
      enum: ["user", "vet", "admin", "mod"],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "in-call", "closed", "on-hold"],
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
    callToken: String,
    agoraChannelName: String,
    callStartedAt: Date,
    callEndedAt: Date,
    moderatorNotes: String,
    resolvedAt: Date,
    messages: [
      {
        senderType: {
          type: String,
          enum: ["user", "support", "system"],
          required: true,
        },
        senderId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ assignedModId: 1, status: 1 });
TicketSchema.index({ status: 1, priority: -1, createdAt: -1 });

const existingTicketModel = mongoose.models.Ticket as
  | mongoose.Model<ITicket>
  | undefined;

if (
  existingTicketModel &&
  (!existingTicketModel.schema.path("assignedModId") ||
    !existingTicketModel.schema.path("agoraChannelName"))
) {
  delete mongoose.models.Ticket;
}

export const Ticket =
  mongoose.models.Ticket ?? mongoose.model<ITicket>("Ticket", TicketSchema);
