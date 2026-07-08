import type { Metadata } from "next";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { DocumentUploader } from "@/components/user/DocumentUploader";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { Document } from "@/lib/db/models/Document";
import { Pet } from "@/lib/db/models/Pet";

export const metadata: Metadata = {
  title: "Documents | pawwcure",
};

type UserDocument = {
  _id: { toString(): string };
  createdAt: Date;
  mimeType: string;
  petId?: { name?: string };
  title: string;
  type: string;
};

export default async function DocumentsPage() {
  const session = await getSession();
  await dbConnect();

  const [documents, pets] = session
    ? await Promise.all([
        Document.find({ userId: session.userId })
        .populate("petId", "name")
        .sort({ createdAt: -1 })
        .limit(24)
        .lean(),
        Pet.find({ userId: session.userId, isActive: true })
          .select("name")
          .sort({ createdAt: 1 })
          .lean(),
      ])
    : [[], []];
  const typedDocuments = documents as unknown as UserDocument[];

  return (
    <UserPageScaffold
      actionHref="/documents"
      actionLabel="Upload"
      description="Your lab reports, prescriptions, discharge notes, and uploaded health files stay here."
      eyebrow="Health vault"
      title="Documents"
    >
      <DocumentUploader
        pets={(pets as { _id: { toString(): string }; name: string }[]).map(
          (pet) => ({ id: pet._id.toString(), name: pet.name })
        )}
      />
      {typedDocuments.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {typedDocuments.map((document) => (
            <div
              className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm"
              key={document._id.toString()}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {document.petId?.name ?? "Pet"} / {document.type}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{document.title}</h2>
              <p className="mt-3 text-slate-500">
                {new Date(document.createdAt).toLocaleDateString()} /{" "}
                {document.mimeType}
              </p>
              <a
                className="mt-4 inline-flex text-sm font-bold text-emerald-700"
                href={`/api/documents/${document._id.toString()}/download`}
              >
                Open document
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            No documents yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Prescriptions and uploaded medical files will appear here after
            consultations or manual uploads.
          </p>
        </div>
      )}
    </UserPageScaffold>
  );
}
