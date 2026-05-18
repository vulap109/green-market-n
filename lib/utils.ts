import type { PaymentMethod } from "@/lib/types";

type ParamStringValue = string | string[] | null | undefined;
type DateFormatValue = Date | number | string | null | undefined;
type ProductSlugSource = Readonly<{
  name?: string | null;
  slug?: string | null;
}>;

export function formatString(value: unknown): string {
  return String(value ?? "").trim();
}

export function formatLowercaseString(value: unknown): string {
  return formatString(value).toLowerCase();
}

export function formatParamString(value?: ParamStringValue): string {
  return formatString(Array.isArray(value) ? value[0] : value);
}

export function formatPathname(value: unknown): string {
  return formatString(value).replace(/\/+$/, "") || "/";
}

export function resolveAssetPath(assetPath?: string | null): string {
  const normalizedPath = formatString(assetPath);

  if (!normalizedPath) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
}

export function formatSearchText(value: unknown): string {
  return formatLowercaseString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatSlugString(value: unknown): string {
  return formatLowercaseString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatProductSlug(product?: ProductSlugSource | null): string {
  return formatString(product?.slug) || formatSlugString(product?.name);
}

export function formatMoney(amount: number | string | null | undefined): string {
  return `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;
}

export function formatDate(value: DateFormatValue, options: Intl.DateTimeFormatOptions): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", options).format(date);
}

export function getPaymentMethodLabel(method: PaymentMethod | string): string {
  return method === "cod"
    ? "Thanh toán khi nhận hàng"
    : "Chuyển khoản ngân hàng trực tiếp";
}

export function getPaymentMethodNote(method: PaymentMethod | string): string {
  return method === "cod"
    ? "Khách thanh toán khi nhận hàng từ nhân viên giao nhận."
    : "Vui lòng mở thông tin chuyển khoản và chuyển đúng số tiền, đúng nội dung để shop xác nhận nhanh.";
}
