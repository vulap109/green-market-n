import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatString } from "@/lib/utils";

export const ADMIN_NEWS_LIMIT = 50;
export const ADMIN_NEWS_STATUS_OPTIONS = ["draft", "published", "archived"] as const;

export type AdminNewsFilters = Readonly<{
  keyword: string;
  status: string;
}>;

export type AdminCreateNewsPostInput = Readonly<{
  content: string;
  excerpt: string;
  featured: boolean;
  hero: string;
  metaDescription: string;
  metaTitle: string;
  publishedAt: string;
  slug: string;
  status: string;
  thumbnail: string;
  title: string;
}>;

export type AdminNewsListItem = Readonly<{
  createdAt: Date;
  excerpt: string;
  featured: boolean;
  hero: string;
  id: string;
  publishedAt: Date | null;
  slug: string;
  status: string;
  thumbnail: string;
  title: string;
  updatedAt: Date;
}>;

export type AdminNewsListResult = Readonly<{
  items: AdminNewsListItem[];
  totalPosts: number;
}>;

export type AdminNewsEditDetails = AdminCreateNewsPostInput &
  Readonly<{
    id: string;
  }>;

type NormalizedAdminNewsPostInput = Readonly<{
  content: string;
  slug: string;
  status: string;
  title: string;
}>;

function buildAdminNewsWhere(filters: AdminNewsFilters): Prisma.NewsPostWhereInput {
  const keyword = formatString(filters.keyword);
  const status = formatString(filters.status);
  const where: Prisma.NewsPostWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (keyword) {
    where.OR = [
      {
        title: {
          contains: keyword,
          mode: "insensitive"
        }
      },
      {
        slug: {
          contains: keyword,
          mode: "insensitive"
        }
      },
      {
        excerpt: {
          contains: keyword,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
}

function normalizeNewsStatus(status: string): string {
  return ADMIN_NEWS_STATUS_OPTIONS.some((option) => option === status) ? status : "draft";
}

function parsePositiveBigInt(value?: string | null): bigint | null {
  const normalizedValue = formatString(value);

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const parsedValue = BigInt(normalizedValue);

  return parsedValue > BigInt(0) ? parsedValue : null;
}

function parseAuthorId(authorId?: string | null): bigint | null {
  return parsePositiveBigInt(authorId);
}

function parseNewsPostId(postId?: string | null): bigint | null {
  return parsePositiveBigInt(postId);
}

function formatDateTimeLocal(date?: Date | null): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function getPublishedAt(input: AdminCreateNewsPostInput, status: string): Date | null {
  const publishedAt = formatString(input.publishedAt);

  if (publishedAt) {
    const parsedDate = new Date(publishedAt);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return status === "published" ? new Date() : null;
}

function normalizeNewsPostInput(input: AdminCreateNewsPostInput): NormalizedAdminNewsPostInput {
  const title = formatString(input.title);
  const slug = formatString(input.slug);
  const content = formatString(input.content);
  const status = normalizeNewsStatus(formatString(input.status));

  if (!title) {
    throw new Error("Vui lòng nhập tiêu đề bài viết.");
  }

  if (!slug) {
    throw new Error("Vui lòng nhập slug bài viết.");
  }

  if (!content) {
    throw new Error("Vui lòng nhập nội dung bài viết.");
  }

  return {
    content,
    slug,
    status,
    title
  };
}

export async function findAdminNewsPosts(filters: AdminNewsFilters): Promise<AdminNewsListResult> {
  const where = buildAdminNewsWhere(filters);
  const [totalPosts, posts] = await Promise.all([
    prisma.newsPost.count({ where }),
    prisma.newsPost.findMany({
      where,
      select: {
        createdAt: true,
        excerpt: true,
        featured: true,
        hero: true,
        id: true,
        publishedAt: true,
        slug: true,
        status: true,
        thumbnail: true,
        title: true,
        updatedAt: true
      },
      orderBy: [
        {
          updatedAt: "desc"
        },
        {
          id: "desc"
        }
      ],
      take: ADMIN_NEWS_LIMIT
    })
  ]);

  return {
    items: posts.map((post) => ({
      createdAt: post.createdAt,
      excerpt: post.excerpt || "",
      featured: post.featured,
      hero: post.hero || "",
      id: post.id.toString(),
      publishedAt: post.publishedAt,
      slug: post.slug,
      status: post.status,
      thumbnail: post.thumbnail || "",
      title: post.title,
      updatedAt: post.updatedAt
    })),
    totalPosts
  };
}

export async function getAdminNewsPostForEdit(postId: string): Promise<AdminNewsEditDetails | null> {
  const parsedPostId = parseNewsPostId(postId);

  if (!parsedPostId) {
    return null;
  }

  const post = await prisma.newsPost.findUnique({
    where: {
      id: parsedPostId
    },
    select: {
      content: true,
      excerpt: true,
      featured: true,
      hero: true,
      id: true,
      metaDescription: true,
      metaTitle: true,
      publishedAt: true,
      slug: true,
      status: true,
      thumbnail: true,
      title: true
    }
  });

  if (!post) {
    return null;
  }

  return {
    content: post.content,
    excerpt: post.excerpt || "",
    featured: post.featured,
    hero: post.hero || "",
    id: post.id.toString(),
    metaDescription: post.metaDescription || "",
    metaTitle: post.metaTitle || "",
    publishedAt: formatDateTimeLocal(post.publishedAt),
    slug: post.slug,
    status: post.status,
    thumbnail: post.thumbnail || "",
    title: post.title
  };
}

export async function findAdminNewsSlugConflict(
  slug: string,
  excludePostId?: string | null
): Promise<boolean> {
  const normalizedSlug = formatString(slug);

  if (!normalizedSlug) {
    return false;
  }

  const excludedPostId = parseNewsPostId(excludePostId);

  const post = await prisma.newsPost.findFirst({
    where: {
      slug: normalizedSlug,
      ...(excludedPostId
        ? {
            id: {
              not: excludedPostId
            }
          }
        : {})
    },
    select: {
      id: true
    }
  });

  return Boolean(post);
}

export async function createAdminNewsPost(
  input: AdminCreateNewsPostInput,
  authorId?: string | null
): Promise<void> {
  const normalizedInput = normalizeNewsPostInput(input);

  await prisma.newsPost.create({
    data: {
      authorId: parseAuthorId(authorId),
      content: normalizedInput.content,
      excerpt: formatString(input.excerpt) || null,
      featured: input.featured,
      hero: formatString(input.hero) || null,
      metaDescription: formatString(input.metaDescription) || null,
      metaTitle: formatString(input.metaTitle) || null,
      publishedAt: getPublishedAt(input, normalizedInput.status),
      slug: normalizedInput.slug,
      status: normalizedInput.status,
      thumbnail: formatString(input.thumbnail) || null,
      title: normalizedInput.title
    }
  });
}

export async function updateAdminNewsPost(
  postId: string,
  input: AdminCreateNewsPostInput
): Promise<void> {
  const parsedPostId = parseNewsPostId(postId);

  if (!parsedPostId) {
    throw new Error("Không tìm thấy bài viết.");
  }

  const existingPost = await prisma.newsPost.findUnique({
    where: {
      id: parsedPostId
    },
    select: {
      id: true
    }
  });

  if (!existingPost) {
    throw new Error("Không tìm thấy bài viết.");
  }

  const normalizedInput = normalizeNewsPostInput(input);

  await prisma.newsPost.update({
    where: {
      id: parsedPostId
    },
    data: {
      content: normalizedInput.content,
      excerpt: formatString(input.excerpt) || null,
      featured: input.featured,
      hero: formatString(input.hero) || null,
      metaDescription: formatString(input.metaDescription) || null,
      metaTitle: formatString(input.metaTitle) || null,
      publishedAt: getPublishedAt(input, normalizedInput.status),
      slug: normalizedInput.slug,
      status: normalizedInput.status,
      thumbnail: formatString(input.thumbnail) || null,
      title: normalizedInput.title,
      updatedAt: new Date()
    }
  });
}
