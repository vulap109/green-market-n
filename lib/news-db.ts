import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { NewsArticle } from "@/lib/types";
import { formatDate, formatLowercaseString, formatString } from "@/lib/utils";

const newsPostListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  thumbnail: true,
  hero: true,
  featured: true,
  metaTitle: true,
  metaDescription: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      fullName: true
    }
  }
} satisfies Prisma.NewsPostSelect;

const newsPostDetailSelect = {
  ...newsPostListSelect,
  content: true
} satisfies Prisma.NewsPostSelect;

type NewsPostListRecord = Prisma.NewsPostGetPayload<{
  select: typeof newsPostListSelect;
}>;

type NewsPostDetailRecord = Prisma.NewsPostGetPayload<{
  select: typeof newsPostDetailSelect;
}>;

export type NewsArticleDetail = Readonly<{
  article: NewsArticle;
  contentHtml: string;
}>;

type NewsDataOptions = Readonly<{
  featuredFirst?: boolean;
  take?: number | null;
}>;

function createContentUnavailableMarkup(): string {
  return `
    <div class="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-sm text-gray-500">
      Không tải được nội dung bài viết. Vui lòng thử tải lại trang sau ít phút.
    </div>
  `;
}

function normalizeNewsContentHtml(contentHtml: string): string {
  return contentHtml
    .replace(/\s+onclick="toggleTOC\(\)"/g, ' data-news-action="toggle-toc"')
    .replace(
      /\s+onclick="showCollectionPage\('([^']+)'\)"/g,
      ' data-news-action="open-catalog" data-news-category="$1"'
    );
}

function getPublishedNewsWhere(now = new Date()): Prisma.NewsPostWhereInput {
  return {
    status: "published",
    OR: [
      {
        publishedAt: null
      },
      {
        publishedAt: {
          lte: now
        }
      }
    ]
  };
}

function getNewsDate(post: Pick<NewsPostListRecord, "createdAt" | "publishedAt">): Date {
  return post.publishedAt ?? post.createdAt;
}

function sanitizeNewsTake(take?: number | null): number | undefined {
  const newsTake = Math.floor(Number(take));
  return Number.isFinite(newsTake) && newsTake > 0 ? newsTake : undefined;
}

function mapNewsPost(post: NewsPostListRecord): NewsArticle {
  const articleDate = getNewsDate(post);
  const thumbnail = formatString(post.thumbnail);
  const hero = formatString(post.hero);
  const excerpt = formatString(post.excerpt);

  return {
    author: formatString(post.author?.fullName) || "Green Market",
    createdAt: post.createdAt.toISOString(),
    dateLabel: formatDate(articleDate, {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }),
    description: excerpt,
    featured: post.featured,
    hero: hero || undefined,
    id: post.id.toString(),
    metaDescription: formatString(post.metaDescription) || undefined,
    metaTitle: formatString(post.metaTitle) || undefined,
    publishedAt: post.publishedAt?.toISOString(),
    slug: formatString(post.slug) || undefined,
    thumbnail: thumbnail || undefined,
    title: formatString(post.title) || undefined,
    updatedAt: post.updatedAt.toISOString()
  };
}

function mapNewsPostDetail(post: NewsPostDetailRecord): NewsArticleDetail {
  const contentHtml = formatString(post.content)
    ? normalizeNewsContentHtml(post.content)
    : createContentUnavailableMarkup();

  return {
    article: mapNewsPost(post),
    contentHtml
  };
}

export const getNewsData = cache(async (options: NewsDataOptions = {}): Promise<NewsArticle[]> => {
  const newsTake = sanitizeNewsTake(options.take);
  const newsPosts = await prisma.newsPost.findMany({
    where: getPublishedNewsWhere(),
    select: newsPostListSelect,
    orderBy: [
      ...(options.featuredFirst
        ? [
            {
              featured: "desc" as const
            }
          ]
        : []),
      {
        publishedAt: {
          sort: "desc",
          nulls: "last"
        }
      },
      {
        createdAt: "desc"
      },
      {
        id: "desc"
      }
    ],
    ...(newsTake ? { take: newsTake } : {})
  });

  return newsPosts.map((post) => mapNewsPost(post));
});

export const findNewsArticleBySlug = cache(async (slug?: string | null): Promise<NewsArticleDetail | null> => {
  const articleSlug = formatLowercaseString(slug);

  if (!articleSlug) {
    return null;
  }

  const newsPost = await prisma.newsPost.findFirst({
    where: {
      ...getPublishedNewsWhere(),
      slug: {
        equals: articleSlug,
        mode: "insensitive"
      }
    },
    select: newsPostDetailSelect
  });

  return newsPost ? mapNewsPostDetail(newsPost) : null;
});
