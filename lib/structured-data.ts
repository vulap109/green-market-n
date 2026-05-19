import type { ProductRecord } from "@/lib/product-types";
import { getProductDisplayPricing } from "@/lib/product-utils";
import { ADDRESS_ROUTE, buildNewsDetailUrl, buildProductDetailUrl } from "@/lib/routes";
import type { NewsArticle } from "@/lib/types";
import { formatProductSlug, formatString, resolveAssetPath } from "@/lib/utils";

export const SITE_ORIGIN = "https://greenmarket.com.vn";
const BUSINESS_NAME = "Green Market";
const BUSINESS_PHONE = "+84973074063";
const BUSINESS_EMAIL = "contact@greenmarket.com.vn";
const BUSINESS_LOGO = "/images/logo_1.png";
const BUSINESS_IMAGE = "/images/cover.jpg";
const BUSINESS_SAME_AS = [
  "https://www.facebook.com/profile.php?id=61577502750044",
  "https://www.instagram.com/greenmarket063?igsh=MjMxcnJpOWQxYjUy&utm_source=qr"
];

export type BreadcrumbSchemaItem = Readonly<{
  href?: string | null;
  label?: string | null;
}>;

export function buildAbsoluteUrl(path?: string | null): string {
  return new URL(formatString(path) || "/", SITE_ORIGIN).toString();
}

export function stripHtml(value?: string | null): string {
  return formatString(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stringifyJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildBreadcrumbListSchema(items: ReadonlyArray<BreadcrumbSchemaItem>) {
  const itemListElement = items
    .map((item) => ({
      href: formatString(item.href),
      label: formatString(item.label)
    }))
    .filter((item) => item.label)
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: buildAbsoluteUrl(item.href) } : {})
    }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement
  };
}

function formatIsoDate(value?: string | null): string {
  const dateValue = formatString(value);
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? dateValue : date.toISOString();
}

function buildBusinessBase(locationId: string) {
  const addressUrl = buildAbsoluteUrl(ADDRESS_ROUTE);

  return {
    "@type": ["LocalBusiness", "Store"],
    "@id": `${buildAbsoluteUrl("/")}#${locationId}`,
    name: BUSINESS_NAME,
    url: addressUrl,
    image: [buildAbsoluteUrl(BUSINESS_IMAGE)],
    logo: buildAbsoluteUrl(BUSINESS_LOGO),
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    priceRange: "VND",
    sameAs: BUSINESS_SAME_AS,
    areaServed: ["Hà Nội", "TP. Hồ Chí Minh", "Việt Nam"]
  };
}

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...buildBusinessBase("ho-chi-minh-store"),
        name: `${BUSINESS_NAME} TP.HCM`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "32/42/11 Bùi Đình Túy, Phường 12, Quận Bình Thạnh",
          addressLocality: "TP. Hồ Chí Minh",
          addressRegion: "TP. Hồ Chí Minh",
          addressCountry: "VN"
        },
        hasMap: "https://maps.google.com/?q=32/42/11+Bui+Dinh+Tuy,+Phuong+12,+Quan+Binh+Thanh,+Ho+Chi+Minh"
      },
      {
        ...buildBusinessBase("ha-noi-store"),
        name: `${BUSINESS_NAME} Hà Nội`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "207 Mai Dịch, Cầu Giấy",
          addressLocality: "Hà Nội",
          addressRegion: "Hà Nội",
          addressCountry: "VN"
        },
        hasMap: "https://maps.google.com/?q=207+Mai+Dich,+Cau+Giay,+Ha+Noi"
      }
    ]
  };
}

export function buildArticleSchema(article: NewsArticle, fallbackSlug?: string | null) {
  const articleHref = buildNewsDetailUrl(article.slug || fallbackSlug);
  const articleUrl = buildAbsoluteUrl(articleHref);
  const headline = article.title || "Tin tức";
  const image = resolveAssetPath(article.hero || article.thumbnail);
  const datePublished = formatIsoDate(article.publishedAt || article.createdAt);
  const dateModified = formatIsoDate(article.updatedAt || article.publishedAt || article.createdAt);
  const authorName = formatString(article.author) || BUSINESS_NAME;
  const isBusinessAuthor = authorName === BUSINESS_NAME;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleUrl}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    headline,
    ...(article.metaDescription || article.description
      ? { description: article.metaDescription || article.description }
      : {}),
    ...(image ? { image: [buildAbsoluteUrl(image)] } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: {
      "@type": isBusinessAuthor ? "Organization" : "Person",
      name: authorName
    },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      logo: {
        "@type": "ImageObject",
        url: buildAbsoluteUrl(BUSINESS_LOGO)
      }
    },
    inLanguage: "vi-VN"
  };
}

export function buildProductSchema(product: ProductRecord, productImage: string, descriptionHtml: string) {
  const productUrl = buildAbsoluteUrl(buildProductDetailUrl({ slug: formatProductSlug(product) }));
  const description = formatString(product.metaDescription) || stripHtml(descriptionHtml);
  const pricing = getProductDisplayPricing(product);
  const category = [product.parentCategoryName, product.categoryName].filter(Boolean).join(" > ");
  const images = productImage ? [buildAbsoluteUrl(productImage)] : [];
  const hasPrice = pricing.currentPrice > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name || product.sku || "Product",
    ...(images.length ? { image: images } : {}),
    ...(description ? { description } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(category ? { category } : {}),
    brand: {
      "@type": "Brand",
      name: "Green Market"
    },
    ...(hasPrice
      ? {
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "VND",
            price: pricing.currentPrice,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: "Green Market"
            }
          }
        }
      : {})
  };
}
