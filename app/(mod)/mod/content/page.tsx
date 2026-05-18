import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { Article } from "@/lib/db/models/Article";

export const metadata: Metadata = {
  title: "Content Moderation | pawwcure",
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

function formatDate(date: Date | undefined): string {
  if (!date) return "Not submitted";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ContentPage() {
  // Fetch articles by status
  const submittedArticles = await Article.find({ status: "submitted" })
    .sort({ submittedDate: -1 })
    .lean();

  const publishedArticles = await Article.find({ status: "published" })
    .sort({ publishedDate: -1 })
    .limit(10)
    .lean();


  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="mt-2 text-slate-500">
          Review and approve health articles before publishing
        </p>
      </div>

      {/* Submitted Articles */}
      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Articles Awaiting Review</h2>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            {submittedArticles.length} pending
          </span>
        </div>

        <div className="space-y-6">
          {submittedArticles.length > 0 ? (
            submittedArticles.map((article: any) => (
              <div
                className="rounded-[2rem] border-2 border-amber-200 bg-amber-50 p-6"
                key={article._id?.toString()}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-amber-700" />
                      <h3 className="text-lg font-bold text-amber-900">
                        {article.title}
                      </h3>
                    </div>
                    <p className="text-sm text-amber-800 mb-3">{article.summary}</p>
                  </div>
                  <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">
                    Submitted
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-4 text-sm mb-4 bg-white p-3 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Author
                    </p>
                    <p className="mt-1 font-bold text-slate-900">{article.author}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </p>
                    <p className="mt-1 font-bold text-slate-900">{article.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Word Count
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      {article.wordCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Submitted
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      {formatDate(article.submittedDate)}
                    </p>
                  </div>
                </div>

                <div className="mb-4 max-h-64 overflow-y-auto rounded-2xl bg-white p-4 text-sm text-slate-700">
                  <p>{article.content}</p>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
                    Approve & Publish
                  </button>
                  <button className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                    Request Changes
                  </button>
                  <button className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100">
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No articles awaiting review</p>
          )}
        </div>
      </Card>

      {/* Published Articles */}
      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recently Published</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {publishedArticles.length} published
          </span>
        </div>

        <div className="space-y-3">
          {publishedArticles.length > 0 ? (
            publishedArticles.map((article: any) => (
              <div
                className="flex items-center justify-between rounded-[2rem] bg-emerald-50 p-4"
                key={article._id?.toString()}
              >
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">{article.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {article.category} • {article.wordCount} words • Published{" "}
                      {formatDate(article.publishedDate)}
                    </p>
                  </div>
                </div>
                <button className="text-sm font-bold text-emerald-700 hover:text-emerald-800">
                  View
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No published articles</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">Content Guidelines</h2>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            • <span className="font-bold">Accuracy:</span> Ensure medical
            information is accurate and current
          </p>
          <p>
            • <span className="font-bold">Tone:</span> Should be helpful,
            non-promotional, and pet-user friendly
          </p>
          <p>
            • <span className="font-bold">Citations:</span> Medical claims should
            have credible sources
          </p>
          <p>
            • <span className="font-bold">Length:</span> Articles should be 600-1500
            words
          </p>
          <p>
            • <span className="font-bold">Conflicts:</span> Disclose any
            commercial relationships
          </p>
        </div>
      </Card>
    </section>
  );
}
