import mongoose, { Schema, type Document } from "mongoose";

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  type: "medicine" | "vaccination" | "checkup" | "follow-up" | "other";
  title: string;
  description?: string;
  dueDate: Date;
  frequency: "once" | "daily" | "weekly" | "monthly" | "yearly";
  isCompleted: boolean;
  completedAt?: Date;
  notificationSent: boolean;
  relatedConsultationId?: mongoose.Types.ObjectId;
  priority: "low" | "normal" | "high";
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
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
      enum: ["medicine", "vaccination", "checkup", "follow-up", "other"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: String,
    dueDate: { type: Date, required: true },
    frequency: {
      type: String,
      enum: ["once", "daily", "weekly", "monthly", "yearly"],
      default: "once",
    },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    notificationSent: { type: Boolean, default: false },
    relatedConsultationId: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
  },
  { timestamps: true }
);

// Indices for common queries
ReminderSchema.index({ userId: 1, isCompleted: 1 });
ReminderSchema.index({ petId: 1 });
ReminderSchema.index({ dueDate: 1 });
ReminderSchema.index({ userId: 1, dueDate: 1 });

export const Reminder =
  mongoose.models.Reminder ??
  mongoose.model<IReminder>("Reminder", ReminderSchema);
