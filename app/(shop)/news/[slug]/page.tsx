import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsArticleClient from "@/components/news/NewsArticleClient";
import { findNewsArticleBySlug } from "@/lib/news-db";
import { buildNewsDetailUrl, HOME_ROUTE, NEWS_ROUTE } from "@/lib/routes";
import { buildArticleSchema, buildBreadcrumbListSchema, stringifyJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

const DEFAULT_PREVIEW_IMAGE = "/images/cover-trao-yeu-thuong-mb.jpg";

type NewsArticlePageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

async function getNewsPageData(slug: string) {
  const newsArticleDetail = await findNewsArticleBySlug(slug);

  if (!newsArticleDetail) {
    return {
      article: null,
      contentHtml: ""
    };
  }

  return newsArticleDetail;
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const routeParams = await params;
  const { article } = await getNewsPageData(routeParams.slug);

  if (!article) {
    return {
      title: "Không tìm thấy bài viết",
      description: "Đường dẫn bài viết không hợp lệ hoặc nội dung này chưa được xuất bản."
    };
  }

  const metadataTitle = article.metaTitle || article.title || "Tin tức";
  const metadataDescription =
    article.metaDescription || article.description || "Tin tức mới nhất từ Green Market.";
  const metadataImage = article.thumbnail ? String(article.thumbnail) : DEFAULT_PREVIEW_IMAGE;

  return {
    title: metadataTitle,
    description: metadataDescription,
    openGraph: {
      title: metadataTitle,
      description: metadataDescription,
      images: [metadataImage]
    },
    twitter: {
      title: metadataTitle,
      description: metadataDescription,
      images: [metadataImage]
    }
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const routeParams = await params;
  const { article, contentHtml } = await getNewsPageData(routeParams.slug);

  if (!article) {
    notFound();
  }

  const articleTitle = article.title || "Tin tức";
  const articleSchema = buildArticleSchema(article, routeParams.slug);
  const breadcrumbSchema = buildBreadcrumbListSchema([
    { href: HOME_ROUTE, label: "Trang chủ" },
    { href: NEWS_ROUTE, label: "Tin tức" },
    { href: buildNewsDetailUrl(article.slug || routeParams.slug), label: articleTitle }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbSchema) }}
      />
      <NewsArticleClient article={article} contentHtml={contentHtml} />
    </>
  );
}
