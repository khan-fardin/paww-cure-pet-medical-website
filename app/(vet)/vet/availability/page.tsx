import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AvailabilityManager } from "@/components/vet/AvailabilityManager";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { VetProfile } from "@/lib/db/models/VetProfile";

export const metadata: Metadata = {
  title: "Availability | pawwcure",
};

type AvailabilityItem = {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  endTime: string;
  startTime: string;
};

export default async function AvailabilityPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnUrl=/vet/availability");
  }

  if (session.role !== "vet") {
    redirect("/dashboard");
  }

  await dbConnect();

  const vetProfile = await VetProfile.findOne({ userId: session.userId })
    .select("availability consultationDuration")
    .lean<{
      _id: { toString(): string };
      availability?: AvailabilityItem[];
      consultationDuration?: number;
    }>();

  if (!vetProfile) {
    redirect("/apply-as-vet");
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Availability</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Set weekly availability windows. Users will only see open future slots
          that are not already held by pending payments or confirmed sessions.
        </p>
        <p className="mt-3 w-fit rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
          {vetProfile.consultationDuration ?? 30} minute sessions
        </p>
      </div>

      <AvailabilityManager
        initialAvailability={vetProfile.availability ?? []}
        vetProfileId={vetProfile._id.toString()}
      />
    </section>
  );
}
