import type { Metadata } from "next";

import {
  VetReviewQueue,
  type VetApplicationItem,
} from "@/components/mod/VetReviewQueue";
import { dbConnect } from "@/lib/db/connect";
import "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export const metadata: Metadata = {
  title: "Vet Verification | pawwcure",
};

type PopulatedVetProfile = {
  _id: { toString(): string };
  avatar?: string;
  bio?: string;
  clinicCity: string;
  clinicName?: string;
  consultationFee: number;
  createdAt: Date;
  degreeDocumentName?: string;
  experience: number;
  isVerified: boolean;
  licenseDocumentName?: string;
  licenseNumber: string;
  phoneNumber?: string;
  rejectionReason?: string;
  specializations: string[];
  applicationStatus: VetApplicationItem["status"];
  userId?: {
    avatar?: string;
    email?: string;
    name?: string;
    phone?: string;
  };
};

function toVetApplication(vet: PopulatedVetProfile): VetApplicationItem {
  return {
    id: vet._id.toString(),
    avatar: vet.userId?.avatar ?? vet.avatar,
    bio: vet.bio,
    clinicCity: vet.clinicCity,
    clinicName: vet.clinicName,
    consultationFee: vet.consultationFee,
    createdAt: vet.createdAt.toISOString(),
    degreeDocumentName: vet.degreeDocumentName,
    email: vet.userId?.email ?? "No email",
    experience: vet.experience,
    isVerified: vet.isVerified,
    licenseDocumentName: vet.licenseDocumentName,
    licenseNumber: vet.licenseNumber,
    name: vet.userId?.name ?? "Unnamed vet",
    phone: vet.userId?.phone ?? vet.phoneNumber,
    rejectionReason: vet.rejectionReason,
    specializations: vet.specializations,
    status: vet.applicationStatus,
  };
}

export default async function VetVerificationPage() {
  await dbConnect();

  const vets = (await VetProfile.find({
    applicationStatus: { $in: ["submitted", "approved", "rejected"] },
  })
    .populate("userId", "name email phone avatar")
    .sort({ createdAt: -1 })
    .lean()) as unknown as PopulatedVetProfile[];

  const applications = vets.map(toVetApplication);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vet Verification Queue</h1>
        <p className="mt-2 text-slate-500">
          Review vet applications and approve or reject submitted profiles.
        </p>
      </div>

      <VetReviewQueue vets={applications} />
    </section>
  );
}
