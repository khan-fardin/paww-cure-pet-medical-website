import { dbConnect } from "@/lib/db/connect";
import {
  markSslPaymentFailed,
  readSslCallbackPayload,
} from "@/lib/services/booking-payment.service";

export async function POST(req: Request) {
  await dbConnect();
  const payload = await readSslCallbackPayload(req);
  return markSslPaymentFailed(payload, "cancelled");
}

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  return markSslPaymentFailed(
    Object.fromEntries(url.searchParams.entries()),
    "cancelled"
  );
}
