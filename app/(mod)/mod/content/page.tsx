import type { Metadata } from "next";
import { Clock, FileText } from "lucide-react";

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

export default function ContentPage() {
  const articles = [
    {
      id: "article-001",
      title: "How to build a useful pet health vault",
      author: "pawwcure Clinical Team",
      status: "Submitted",
      category: "Wellness",
      wordCount: 800,
      submittedDate: "May 2, 2026",
      summary:
        "A simple checklist for organizing records, prescriptions, allergies, and care notes before the next vet call.",
    },
  ];

  const approvedArticles = [
    {
      id: "article-002",
      title: "When to book emergency video triage",
      author: "Dr. Amina Rahman",
      status: "Published",
      category: "Emergency",
      wordCount: 950,
      publishedDate: "April 24, 2026",
    },
    {
      id: "article-003",
      title: "Switching pet food safely",
      author: "pawwcure Nutrition Desk",
      status: "Published",
      category: "Dog care",
      wordCount: 650,
      publishedDate: "April 19, 2026",
    },
  ];

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
            {articles.length} pending
          </span>
        </div>

        <div className="space-y-6">
          {articles.map((article) => (
            <div
              className="rounded-[2rem] border-2 border-amber-200 bg-amber-50 p-6"
              key={article.id}
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
                  {article.status}
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
                    {article.submittedDate}
                  </p>
                </div>
              </div>

              <div className="mb-4 max-h-64 overflow-y-auto rounded-2xl bg-white p-4 text-sm text-slate-700">
                <p>
                  A useful pet health vault starts with the basics: vaccine
                  history, recent medications, allergy notes, weight changes, and
                  any lab reports or discharge summaries. Keeping those details
                  close makes every consultation faster and less stressful.
                </p>
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
          ))}
        </div>
      </Card>

      {/* Published Articles */}
      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recently Published</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {approvedArticles.length} published
          </span>
        </div>

        <div className="space-y-3">
          {approvedArticles.map((article) => (
            <div
              className="flex items-center justify-between rounded-[2rem] bg-emerald-50 p-4"
              key={article.id}
            >
              <div className="flex items-start gap-3 flex-1">
                <FileText className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{article.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {article.category} • {article.wordCount} words • Published{" "}
                    {article.publishedDate}
                  </p>
                </div>
              </div>
              <button className="text-sm font-bold text-emerald-700 hover:text-emerald-800">
                View
              </button>
            </div>
          ))}
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
