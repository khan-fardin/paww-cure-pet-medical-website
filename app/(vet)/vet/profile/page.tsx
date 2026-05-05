import type { Metadata } from "next";
import Image from "next/image";

import { demoVets } from "@/lib/demo/publicContent";

export const metadata: Metadata = {
  title: "My Profile | pawwcure",
};

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const currentVet = demoVets[0];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-2 text-slate-500">
          Edit your public profile and credentials
        </p>
      </div>

      <Card>
        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <div className="mx-auto">
            <Image
              alt={currentVet.name}
              className="h-40 w-40 rounded-3xl object-cover"
              height={160}
              src={currentVet.avatar}
              width={160}
            />
            <button className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
              Change Photo
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  First name
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                  defaultValue="Amina"
                  type="text"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Last name
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                  defaultValue="Rahman"
                  type="text"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                defaultValue="amina@example.com"
                type="email"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">Professional Details</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bio / About
            </label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
              defaultValue={currentVet.bio}
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Years of experience
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                defaultValue={currentVet.yearsExperience}
                type="number"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Consultation fee (BDT)
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                defaultValue="1200"
                type="number"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Specialties
            </label>
            <div className="mt-3 space-y-2">
              {currentVet.specialties.map((specialty) => (
                <div
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                  key={specialty}
                >
                  <span className="font-bold">{specialty}</span>
                  <button className="text-red-600 hover:text-red-700">✕</button>
                </div>
              ))}
            </div>
            <input
              className="mt-3 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
              placeholder="Add a specialty..."
              type="text"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Languages spoken
            </label>
            <div className="mt-3 space-y-2 flex flex-wrap gap-2">
              {currentVet.languages.map((lang) => (
                <span
                  className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700"
                  key={lang}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">Education & Credentials</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Education
            </label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
              defaultValue={currentVet.education}
              rows={2}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              License document
            </label>
            <div className="mt-3 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-500">
                Upload your license document (PDF, JPG, PNG)
              </p>
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                className="mt-2 w-full"
                type="file"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <button className="flex-1 rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700">
          Save Changes
        </button>
        <button className="flex-1 rounded-2xl border border-slate-200 px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </section>
  );
}
