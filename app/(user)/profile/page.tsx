import type { Metadata } from "next";

import { ProfilePhotoForm } from "@/components/user/ProfilePhotoForm";
import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { getSession } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export const metadata: Metadata = {
  title: "My Profile | pawwcure",
};

export default async function UserProfilePage() {
  const session = await getSession();
  await dbConnect();
  const user = session
    ? await User.findById(session.userId)
        .select("avatar email name phone")
        .lean()
    : null;

  return (
    <UserPageScaffold
      description="Manage the identity shown with your consultations, reviews, and support requests."
      eyebrow="Account"
      title="My profile"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Profile photo</h2>
          <p className="mb-5 mt-2 text-sm leading-relaxed text-slate-500">
            Use a clear JPG, PNG, or WebP image. It will be optimized and served
            securely through Cloudinary.
          </p>
          <ProfilePhotoForm currentAvatar={user?.avatar} />
        </section>

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Account details</h2>
          <dl className="mt-6 space-y-5">
            <Detail label="Name" value={user?.name} />
            <Detail label="Email" value={user?.email} />
            <Detail label="Phone" value={user?.phone} />
          </dl>
        </section>
      </div>
    </UserPageScaffold>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 break-words font-bold text-slate-800">
        {value || "Not provided"}
      </dd>
    </div>
  );
}
