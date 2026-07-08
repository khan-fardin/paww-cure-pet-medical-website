import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

import { dbConnect } from "@/lib/db/connect";
import { Article } from "@/lib/db/models/Article";

export const metadata: Metadata = {
  title: "Content Management | pawwcure Admin",
};

type AdminArticle = {
  _id: { toString(): string };
  author: string;
  category: string;
  createdAt: Date;
  slug?: string;
  status: "draft" | "submitted" | "published" | "rejected";
  title: string;
  views: number;
  wordCount: number;
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
      {children}
    </div>
  );
}

function statusClass(status: AdminArticle["status"]) {
  if (status === "published") return "bg-emerald-100 text-emerald-700";
  if (status === "submitted") return "bg-amber-100 text-amber-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
}

export default async function AdminContentPage() {
  await dbConnect();

  const [articles, statusRows, categories] = await Promise.all([
    Article.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Article.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Article.distinct("category", {}),
  ]);

  const typedArticles = articles as unknown as AdminArticle[];
  const counts = new Map(statusRows.map((row) => [row._id, row.count]));

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Content Management
        </div>
        <h1 className="text-4xl font-bold">Articles & CMS</h1>
        <p className="mt-2 text-slate-500">
          Real article records from the publishing collection.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Published" value={counts.get("published") ?? 0} />
        <Metric label="Submitted" value={counts.get("submitted") ?? 0} />
        <Metric label="Drafts" value={counts.get("draft") ?? 0} />
        <Metric label="Rejected" value={counts.get("rejected") ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Article collection
            </p>
            <h2 className="mt-1 text-2xl font-bold">All Content</h2>
          </div>

          <div className="space-y-3">
            {typedArticles.length > 0 ? (
              typedArticles.map((article) => (
                <div
                  className="grid gap-4 rounded-[2rem] border border-slate-100 p-5 md:grid-cols-[1fr_100px]"
                  key={article._id.toString()}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold text-slate-900">
                        {article.title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                          article.status
                        )}`}
                      >
                        {article.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {article.author} / {article.category} /{" "}
                      {article.wordCount.toLocaleString()} words
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Created {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    {article.status === "published" ? (
                      <Link
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
                        href={`/articles/${article.slug ?? article._id.toString()}`}
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        {article.views ?? 0} views
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-200 p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-bold text-slate-700">No articles yet</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Categories
          </p>
          <div className="mt-4 space-y-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600"
                  key={category}
                >
                  {category}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No categories yet.</p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
