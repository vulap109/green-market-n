import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsArticleClient from "@/components/news/NewsArticleClient";
import { findNewsArticleBySlug } from "@/lib/news-db";

export const dynamic = "force-dynamic";

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
  const metadataImage = article.thumbnail;

  return {
    title: metadataTitle,
    description: metadataDescription,
    openGraph: {
      title: metadataTitle,
      description: metadataDescription,
      images: metadataImage ? [String(metadataImage)] : undefined
    },
    twitter: {
      title: metadataTitle,
      description: metadataDescription,
      images: metadataImage ? [String(metadataImage)] : undefined
    }
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const routeParams = await params;
  const { article, contentHtml } = await getNewsPageData(routeParams.slug);

  if (!article) {
    notFound();
  }

  return <NewsArticleClient article={article} contentHtml={contentHtml} />;
}
