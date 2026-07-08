import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { dbConnect } from "@/lib/db/connect";
import { Article } from "@/lib/db/models/Article";

export const metadata: Metadata = {
  title: "Articles | pawwcure",
  description: "Published pet health articles from pawwcure.",
};

type PublicArticle = {
  _id: { toString(): string };
  author: string;
  category: string;
  heroImage?: string;
  slug?: string;
  summary: string;
  title: string;
  wordCount: number;
};

export default async function ArticlesPage() {
  await dbConnect();

  const articles = (await Article.find({ status: "published" })
    .sort({ publishedDate: -1, createdAt: -1 })
    .limit(30)
    .lean()) as unknown as PublicArticle[];
  const [featuredArticle, ...restArticles] = articles;

  return (
    <section className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <div className="mb-5 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Pet health articles
          </div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight md:text-6xl">
            Practical care notes from the pawwcure desk.
          </h1>
          <p className="text-lg leading-relaxed text-slate-500">
            Published veterinary education and pet-care guidance from the
            pawwcure content team.
          </p>
        </div>

        {!featuredArticle ? (
          <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-bold">No published articles yet</h2>
            <p className="mt-2 text-slate-500">
              Published content will appear here after admin approval.
            </p>
          </div>
        ) : (
          <>
            <ArticleCard article={featuredArticle} featured />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {restArticles.map((article) => (
                <ArticleCard article={article} key={article._id.toString()} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ArticleCard({
  article,
  featured = false,
}: {
  article: PublicArticle;
  featured?: boolean;
}) {
  const href = `/articles/${article.slug ?? article._id.toString()}`;
  const minutes = Math.max(1, Math.ceil(article.wordCount / 220));

  return (
    <Link
      className={`group overflow-hidden bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] ${
        featured
          ? "grid rounded-[3rem] lg:grid-cols-[1.05fr_0.95fr]"
          : "block rounded-[2.5rem]"
      }`}
      href={href}
    >
      <div className={`relative ${featured ? "min-h-[360px]" : "h-56"}`}>
        <Image
          alt={article.title}
          className="object-cover"
          fill
          priority={featured}
          sizes={featured ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
          src={article.heroImage || "/og-image.png"}
        />
      </div>
      <div className={featured ? "p-8 sm:p-12" : "p-8"}>
        <span className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          {article.category}
        </span>
        <h2 className={`${featured ? "text-3xl md:text-4xl" : "text-2xl"} font-bold leading-tight`}>
          {article.title}
        </h2>
        <p className="mt-4 leading-relaxed text-slate-500">{article.summary}</p>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
          <span className="font-bold text-slate-500">{article.author}</span>
          <span className="font-bold text-emerald-600">{minutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
