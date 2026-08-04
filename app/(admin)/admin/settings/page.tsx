import type { Metadata } from "next";
import {
  Bell,
  CheckCircle2,
  Database,
  Lock,
  ServerCog,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react";

import { PLATFORM_COMMISSION_PERCENT } from "@/lib/config/fees";
import { dbConnect } from "@/lib/db/connect";
import { Consultation } from "@/lib/db/models/Consultation";
import { Payment } from "@/lib/db/models/Payment";
import { Pet } from "@/lib/db/models/Pet";
import { User } from "@/lib/db/models/User";
import { VetProfile } from "@/lib/db/models/VetProfile";

export const metadata: Metadata = {
  title: "Platform Settings | pawwcure Admin",
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

function envReady(...names: string[]) {
  return names.every((name) => Boolean(process.env[name]?.trim()));
}

function StatusPill({ ready }: { ready: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
        ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {ready ? "Configured" : "Needs setup"}
    </span>
  );
}

function SettingRow({
  description,
  label,
  value,
}: {
  description?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900">{label}</p>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function ServiceCard({
  description,
  ready,
  title,
}: {
  description: string;
  ready: boolean;
  title: string;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
        <StatusPill ready={ready} />
      </div>
    </div>
  );
}

export default async function AdminSettingsPage() {
  await dbConnect();

  const [
    totalUsers,
    activeUsers,
    verifiedVets,
    pendingVetApplications,
    activePets,
    paidPayments,
    pendingPayouts,
    activeConsultations,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    VetProfile.countDocuments({ isVerified: true, isActive: true }),
    VetProfile.countDocuments({ applicationStatus: "submitted" }),
    Pet.countDocuments({ isActive: true }),
    Payment.countDocuments({ status: "paid" }),
    Payment.countDocuments({ payoutStatus: "pending", status: "paid" }),
    Consultation.countDocuments({ status: { $in: ["scheduled", "ongoing"] } }),
  ]);

  const appVersion = process.env.npm_package_version ?? "0.1.0";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "Not configured";
  const nodeEnv = process.env.NODE_ENV ?? "development";

  const services = [
    {
      description: "Required for all database-backed pages and APIs.",
      ready: envReady("MONGODB_URI"),
      title: "MongoDB",
    },
    {
      description: "Required for secure login cookies and role sessions.",
      ready: envReady("JWT_SECRET"),
      title: "JWT Auth",
    },
    {
      description: "Required for sandbox or production checkout callbacks.",
      ready: envReady("SSL_Store_ID", "SSL_Store_Password"),
      title: "SSLCommerz",
    },
    {
      description: "Required for consultation video and audio calls.",
      ready: envReady(
        "AGORA_APP_ID",
        "AGORA_APP_CERTIFICATE",
        "NEXT_PUBLIC_AGORA_APP_ID"
      ),
      title: "Agora",
    },
    {
      description: "Required for profile photos and vet application uploads.",
      ready: envReady(
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET"
      ),
      title: "Cloudinary",
    },
    {
      description: "Optional for private clinical documents and attachments.",
      ready: envReady("AWS_REGION", "S3_BUCKET_NAME"),
      title: "S3 Documents",
    },
    {
      description: "Optional email delivery for notifications and support.",
      ready: envReady("SMTP_HOST", "SMTP_USER", "SMTP_PASS"),
      title: "SMTP Email",
    },
  ];

  const species =
    (Pet.schema.path("species")?.options as { enum?: string[] } | undefined)
      ?.enum ?? [];

  const notificationTypes = [
    "booking",
    "consultation",
    "payment",
    "payout",
    "review",
    "support",
    "system",
  ];

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Platform Settings
        </div>
        <h1 className="text-4xl font-bold">Configuration</h1>
        <p className="mt-2 text-slate-500">
          Real platform configuration, service readiness, and operational
          settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-8">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Financial
            </p>
            <h2 className="mb-6 text-2xl font-bold">Revenue Settings</h2>
            <div className="space-y-4">
              <SettingRow
                description="Current code-level commission used by payment split calculation."
                label="Platform commission"
                value={`${PLATFORM_COMMISSION_PERCENT}%`}
              />
              <SettingRow
                description="Payouts are manually marked paid by admin from the payments page."
                label="Payout mode"
                value="Manual admin payout"
              />
              <SettingRow
                description="Current payment gateway configured in the payment model and booking flow."
                label="Payment gateway"
                value="SSLCommerz"
              />
              <SettingRow
                description="Paid payment records still waiting for manual payout completion."
                label="Pending payout records"
                value={pendingPayouts.toLocaleString("en-US")}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Features
            </p>
            <h2 className="mb-6 text-2xl font-bold">Enabled Workflows</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                label="Video and audio consults"
                value="Agora enabled by env"
              />
              <FeatureCard
                icon={<Bell className="h-5 w-5" />}
                label="Notifications"
                value="Database backed"
              />
              <FeatureCard
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Vet verification"
                value={`${pendingVetApplications} pending`}
              />
              <FeatureCard
                icon={<WalletCards className="h-5 w-5" />}
                label="Payout accounting"
                value={`${paidPayments} paid records`}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Platform
            </p>
            <div className="space-y-4">
              <SettingRow label="Version" value={appVersion} />
              <SettingRow label="Environment" value={nodeEnv} />
              <SettingRow label="App URL" value={appUrl} />
              <SettingRow
                label="Status"
                value={envReady("MONGODB_URI", "JWT_SECRET") ? "Operational" : "Needs setup"}
              />
            </div>
          </Card>

          <Card className="border border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div>
                <p className="font-bold text-blue-900">Database Snapshot</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-800">
                  {activeUsers.toLocaleString("en-US")} active users,{" "}
                  {verifiedVets.toLocaleString("en-US")} verified vets,{" "}
                  {activePets.toLocaleString("en-US")} active pets, and{" "}
                  {activeConsultations.toLocaleString("en-US")} active
                  consultations.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Services
        </p>
        <h2 className="mb-6 text-2xl font-bold">Integration Readiness</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pets
          </p>
          <h2 className="mb-6 text-2xl font-bold">Supported Species</h2>
          <div className="flex flex-wrap gap-2">
            {species.map((item) => (
              <span
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold capitalize text-slate-700"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Notifications
          </p>
          <h2 className="mb-6 text-2xl font-bold">Supported Types</h2>
          <div className="flex flex-wrap gap-2">
            {notificationTypes.map((item) => (
              <span
                className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold capitalize text-emerald-700"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-4">
          <Lock className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
          <div>
            <p className="font-bold text-amber-900">Admin Safety</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-800">
              Destructive controls are intentionally not exposed on this page.
              Data reset, production fee changes, and payout automation should
              be handled through reviewed admin tools with audit logging.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}

function FeatureCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
        {icon}
      </div>
      <p className="font-bold text-slate-900">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{value}</p>
    </div>
  );
}
