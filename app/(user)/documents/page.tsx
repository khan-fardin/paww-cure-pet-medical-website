import type { Metadata } from "next";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { demoDocuments } from "@/lib/demo/userContent";

export const metadata: Metadata = {
  title: "Documents | pawwcure",
};

export default function DocumentsPage() {
  return (
    <UserPageScaffold
      actionHref="/documents"
      actionLabel="Upload"
      description="Document vault skeleton for lab reports, prescriptions, discharge notes, and S3-backed uploads."
      eyebrow="Health vault"
      title="Documents"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {demoDocuments.map((document) => (
          <div
            className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm"
            key={document.id}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {document.petName}
            </p>
            <h2 className="mt-2 text-2xl font-bold">{document.label}</h2>
            <p className="mt-3 text-slate-500">{document.uploadedAt}</p>
          </div>
        ))}
      </div>
    </UserPageScaffold>
  );
}
