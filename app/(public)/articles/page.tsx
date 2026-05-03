import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { demoArticles } from "@/lib/demo/publicContent";

export const metadata: Metadata = {
  title: "Articles | pawwcure",
  description: "Demo pet health articles for pawwcure users.",
};

export default function ArticlesPage() {
  const [featuredArticle, ...restArticles] = demoArticles;

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
            Demo educational content for pet users. We will connect this to the
            article backend, metadata, and publishing workflow later.
          </p>
        </div>

        <Link
          className="group mb-10 grid overflow-hidden rounded-[3rem] bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] lg:grid-cols-[1.05fr_0.95fr]"
          href={`/articles/${featuredArticle.slug}`}
        >
          <div className="relative min-h-[360px]">
            <Image
              alt={featuredArticle.title}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              src={featuredArticle.heroImage}
            />
          </div>
          <div className="p-8 sm:p-12">
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Featured
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                {featuredArticle.category}
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">
              {featuredArticle.title}
            </h2>
            <p className="mb-8 leading-relaxed text-slate-500">
              {featuredArticle.summary}
            </p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 text-sm">
              <span className="font-bold text-slate-500">
                {featuredArticle.author}
              </span>
              <span className="font-bold text-emerald-600">
                {featuredArticle.minutesToRead} min read
              </span>
            </div>
          </div>
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          {restArticles.map((article) => (
            <Link
              className="group overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-[400ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
              href={`/articles/${article.slug}`}
              key={article.slug}
            >
              <div className="relative h-56">
                <Image
                  alt={article.title}
                  className="object-cover"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  src={article.heroImage}
                />
              </div>
              <div className="p-8">
                <span className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {article.category}
                </span>
                <h2 className="mb-3 text-2xl font-bold leading-tight">
                  {article.title}
                </h2>
                <p className="mb-6 leading-relaxed text-slate-500">
                  {article.summary}
                </p>
                <span className="text-sm font-bold text-emerald-600">
                  Read article
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
