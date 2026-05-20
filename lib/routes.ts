import { formatString } from "@/lib/utils";

type QueryValue = string | number | null | undefined;

export const HOME_ROUTE = "/";
export const COLLECTIONS_ROUTE = "/collections";
export const PRODUCT_ROUTE = "/products";
export const SEARCH_ROUTE = "/search";
export const CART_ROUTE = "/cart";
export const CHECKOUT_ROUTE = "/check-out";
export const ORDER_SUCCESS_ROUTE = "/order-success";
export const NEWS_ROUTE = "/news";
export const PRIVACY_POLICY_ROUTE = "/chinh-sach-bao-mat";
export const DELIVERY_POLICY_ROUTE = "/chinh-sach-giao-hang";
export const RETURN_POLICY_ROUTE = "/chinh-sach-doi-tra";
export const CHECKING_POLICY_ROUTE = "/chinh-sach-kiem-hang";
export const PAYMENT_POLICY_ROUTE = "/chinh-sach-thanh-toan";
export const ADDRESS_ROUTE = "/chi-nhanh-cua-hang";

export function buildUrlWithQuery(pathname: string, query: Record<string, QueryValue>): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    const normalizedValue = formatString(value);
    if (!normalizedValue) {
      return;
    }

    searchParams.set(key, normalizedValue);
  });

  const queryString = searchParams.toString();
  return `${pathname}${queryString ? `?${queryString}` : ""}`;
}

export function buildProductDetailUrl(options: Readonly<{ id?: QueryValue; slug?: QueryValue }>): string {
  const slug = formatString(options.slug);
  if (slug) {
    return `${PRODUCT_ROUTE}/${encodeURIComponent(slug)}`;
  }

  const id = formatString(options.id);
  return id ? buildUrlWithQuery(PRODUCT_ROUTE, { id }) : PRODUCT_ROUTE;
}

export function buildNewsDetailUrl(slug?: string | null): string {
  const nextSlug = formatString(slug);
  return nextSlug ? `${NEWS_ROUTE}/${encodeURIComponent(nextSlug)}` : NEWS_ROUTE;
}
