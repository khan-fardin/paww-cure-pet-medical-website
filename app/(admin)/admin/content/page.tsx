import type { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  FileText,
  Tags,
  Search,
  MoreVertical,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Content Management | pawwcure Admin",
};

const articles = [
  {
    id: 1,
    title: "Best Practices for Dog Nutrition",
    author: "Dr. Amina Parveen",
    category: "Nutrition",
    status: "published",
    views: 1243,
    createdDate: "Apr 28, 2026",
    wordCount: 2847,
  },
  {
    id: 2,
    title: "Common Cat Behavioral Issues",
    author: "Dr. Ryan Mitchell",
    category: "Behavior",
    status: "published",
    views: 856,
    createdDate: "Apr 25, 2026",
    wordCount: 1956,
  },
  {
    id: 3,
    title: "Pet Emergency First Aid Guide",
    author: "Dr. Samuel Cross",
    category: "Emergency",
    status: "pending",
    views: 0,
    createdDate: "May 2, 2026",
    wordCount: 3124,
  },
  {
    id: 4,
    title: "Vaccination Schedule for Puppies",
    author: "Dr. Farzana Khan",
    category: "Preventive",
    status: "draft",
    views: 0,
    createdDate: "May 3, 2026",
    wordCount: 1432,
  },
];

const categories = [
  "Nutrition",
  "Behavior",
  "Emergency",
  "Preventive",
  "Surgery",
  "Dermatology",
];

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

export default function AdminContentPage() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Content Management
          </div>
          <h1 className="text-4xl font-bold">Articles & CMS</h1>
          <p className="mt-2 text-slate-500">
            Write, edit, publish articles and manage content categories
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-rose-700"
          href="#"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Articles
              </p>
              <h2 className="mt-1 text-2xl font-bold">All Content</h2>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2 border border-slate-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="flex-1 bg-transparent text-sm font-bold placeholder-slate-400 outline-none"
              placeholder="Search articles..."
              type="text"
            />
          </div>

          <div className="space-y-3">
            {articles.map((article) => (
              <div
                className="rounded-[2rem] border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition p-5 flex items-start justify-between gap-4"
                key={article.id}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 truncate">
                      {article.title}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                        article.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : article.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>
                  <div className="grid gap-1 text-xs text-slate-500">
                    <p>By {article.author}</p>
                    <p>
                      {article.category} • {article.wordCount.toLocaleString()} words
                    </p>
                  </div>
                </div>

                <div className="text-right text-sm">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Views
                  </p>
                  <p className="text-2xl font-bold">{article.views}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                    title="View"
                    type="button"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                    title="Edit"
                    type="button"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <div className="relative group">
                    <button
                      className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                      type="button"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-2xl border border-slate-100 bg-white shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                      <button className="block w-full px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-t-2xl">
                        View details
                      </button>
                      <button className="block w-full px-4 py-3 text-left text-sm font-bold text-blue-700 hover:bg-blue-50">
                        SEO settings
                      </button>
                      <button className="block w-full px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50">
                        Duplicate
                      </button>
                      <button className="block w-full px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50 rounded-b-2xl">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              Categories
            </p>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  className="w-full text-left rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-rose-50 hover:border-rose-200 transition"
                  key={cat}
                  type="button"
                >
                  {cat}
                </button>
              ))}
              <button
                className="w-full text-left rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                type="button"
              >
                + Add Category
              </button>
            </div>
          </Card>

          <Card>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              Content Stats
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Published</p>
                <p className="text-2xl font-bold text-emerald-700">42</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-amber-700">3</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Drafts</p>
                <p className="text-2xl font-bold text-slate-600">7</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-blue-700">18,429</p>
              </div>
            </div>
          </Card>

          <Card className="border border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Moderation Notice</p>
                <p className="mt-1 text-xs text-amber-800">
                  3 articles need moderator review before publishing
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
