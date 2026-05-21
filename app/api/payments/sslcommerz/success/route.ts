import { dbConnect } from "@/lib/db/connect";
import {
  completeSslPayment,
  readSslCallbackPayload,
} from "@/lib/services/booking-payment.service";

export async function POST(req: Request) {
  await dbConnect();
  const payload = await readSslCallbackPayload(req);
  return completeSslPayment(payload);
}

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  return completeSslPayment(Object.fromEntries(url.searchParams.entries()));
}
