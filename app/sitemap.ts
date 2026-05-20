import type { MetadataRoute } from "next";
import { buildCollectionUrl } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import {
  ADDRESS_ROUTE,
  CHECKING_POLICY_ROUTE,
  DELIVERY_POLICY_ROUTE,
  HOME_ROUTE,
  NEWS_ROUTE,
  PAYMENT_POLICY_ROUTE,
  PRIVACY_POLICY_ROUTE,
  RETURN_POLICY_ROUTE,
  buildNewsDetailUrl,
  buildProductDetailUrl
} from "@/lib/routes";
import { buildAbsoluteUrl } from "@/lib/structured-data";

export const revalidate = 3600;

const collectionSitemapCategories = [
  "ban-chay",
  "gio-trai-cay",
  "trai-cay-nhap-khau",
  "banh-kem",
  "hoa-tuoi"
] as const;

const staticSitemapRoutes = [
  HOME_ROUTE,
  NEWS_ROUTE,
  ADDRESS_ROUTE,
  PRIVACY_POLICY_ROUTE,
  DELIVERY_POLICY_ROUTE,
  RETURN_POLICY_ROUTE,
  CHECKING_POLICY_ROUTE,
  PAYMENT_POLICY_ROUTE
] as const;

function createSitemapEntry(
  pathname: string,
  options: Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "lastModified" | "priority"> = {}
): MetadataRoute.Sitemap[number] {
  return {
    url: buildAbsoluteUrl(pathname),
    ...options
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [products, newsPosts] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "active"
      },
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: {
        id: "asc"
      }
    }),
    prisma.newsPost.findMany({
      where: {
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
      },
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: {
        id: "asc"
      }
    })
  ]);

  return [
    ...staticSitemapRoutes.map((route) =>
      createSitemapEntry(route, {
        changeFrequency: route === HOME_ROUTE ? "daily" : "monthly",
        priority: route === HOME_ROUTE ? 1 : route === NEWS_ROUTE ? 0.8 : 0.5
      })
    ),
    ...collectionSitemapCategories.map((category) =>
      createSitemapEntry(buildCollectionUrl({ category }), {
        changeFrequency: "daily",
        priority: 0.8
      })
    ),
    ...products
      .filter((product) => product.slug)
      .map((product) =>
        createSitemapEntry(buildProductDetailUrl({ slug: product.slug }), {
          changeFrequency: "weekly",
          lastModified: product.updatedAt,
          priority: 0.7
        })
      ),
    ...newsPosts
      .filter((post) => post.slug)
      .map((post) =>
        createSitemapEntry(buildNewsDetailUrl(post.slug), {
          changeFrequency: "weekly",
          lastModified: post.updatedAt,
          priority: 0.6
        })
      )
  ];
}
