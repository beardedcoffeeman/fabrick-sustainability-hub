import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, ArrowUpRight, Leaf } from "lucide-react";
import { getArticleContent, articleContent } from "@/lib/article-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(articleContent).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleContent(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: `${article.title} | Fabrick Built Environment Data`,
    description: article.heroSubtitle,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleContent(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = article.relatedArticles
    .map((id) => articleContent[id])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 pb-16 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Hub
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="rounded-full bg-teal/20 px-3 py-1 text-xs font-semibold text-teal">
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-gray-400 leading-relaxed">
            {article.heroSubtitle}
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
            <span>{article.author}</span>
            <span>·</span>
            <span>{new Date(article.publishDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {article.sections.map((section, idx) => (
            <section key={idx}>
              {section.heading && (
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy mb-3">
                  {section.heading}
                </h2>
              )}
              <div className="space-y-4">
                {section.body.split("\n\n").map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-base text-navy/80 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Key Takeaways */}
        <div className="mt-12 rounded-2xl bg-charcoal p-6 text-white">
          <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-teal" />
            Key Takeaways
          </h3>
          <ul className="space-y-2">
            {article.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal shrink-0" />
                {takeaway}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-teal p-6 text-center text-white">
          <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold">
            Ready to calculate your project&apos;s carbon impact?
          </h3>
          <p className="mt-2 text-sm text-white/80">
            Use our Carbon Calculator to specify materials and discover lower-carbon alternatives.
          </p>
          <Link
            href="/materials"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-cream"
          >
            Open Carbon Calculator
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-navy mb-4">
              Related Articles
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/knowledge/${related.id}`}
                  className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-navy">
                    {related.category}
                  </span>
                  <h4 className="mt-2 text-sm font-semibold text-navy leading-snug group-hover:text-teal transition-colors">
                    {related.title}
                  </h4>
                  <span className="mt-2 flex items-center gap-1 text-xs text-warm-gray">
                    <Clock className="h-3 w-3" />
                    {related.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
