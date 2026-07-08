import type { Types } from "mongoose";

import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { sendNotificationEmail } from "@/lib/services/email.service";

type NotificationType =
  | "booking"
  | "consultation"
  | "payment"
  | "payout"
  | "review"
  | "support"
  | "system";

export async function notifyUser({
  body,
  email = false,
  link,
  title,
  type,
  userId,
}: {
  body: string;
  email?: boolean;
  link?: string;
  title: string;
  type: NotificationType;
  userId: string | Types.ObjectId;
}) {
  const notification = await Notification.create({
    body,
    link,
    title,
    type,
    userId,
  });

  if (email) {
    const user = await User.findById(userId).select("email").lean<{
      email?: string;
    }>();
    await sendNotificationEmail({ body, email: user?.email, title });
  }

  return notification;
}

export async function notifyRoles({
  body,
  link,
  roles,
  title,
  type,
}: {
  body: string;
  link?: string;
  roles: ("admin" | "mod")[];
  title: string;
  type: NotificationType;
}) {
  const recipients = await User.find({
    isActive: true,
    role: { $in: roles },
  })
    .select("_id")
    .lean<{ _id: Types.ObjectId }[]>();

  if (recipients.length === 0) return;

  await Notification.insertMany(
    recipients.map((recipient) => ({
      body,
      link,
      title,
      type,
      userId: recipient._id,
    }))
  );
}
