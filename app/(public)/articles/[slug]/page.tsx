import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { demoArticles, getDemoArticle } from "@/lib/demo/publicContent";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return demoArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getDemoArticle(slug);

  return {
    description: article?.summary,
    title: article ? `${article.title} | pawwcure` : "Article | pawwcure",
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getDemoArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-5xl">
        <Link
          className="mb-8 inline-flex text-sm font-bold text-emerald-600 hover:text-emerald-700"
          href="/articles"
        >
          Back to articles
        </Link>

        <header className="mb-10">
          <div className="mb-5 flex flex-wrap gap-3">
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {article.category}
            </span>
            <span className="rounded-full border border-slate-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {article.minutesToRead} min read
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            {article.title}
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-500">
            {article.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold text-slate-400">
            <span>{article.author}</span>
            <span>{article.publishedAt}</span>
          </div>
        </header>

        <div className="relative mb-12 h-[360px] overflow-hidden rounded-[3rem] shadow-sm md:h-[520px]">
          <Image
            alt={article.title}
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 80vw, 100vw"
            src={article.heroImage}
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="space-y-7 rounded-[2.5rem] bg-white p-8 text-lg leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100 md:p-10">
            {article.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className="h-fit rounded-[2.5rem] bg-emerald-950 p-7 text-white">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
              Article tags
            </p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-emerald-50"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
