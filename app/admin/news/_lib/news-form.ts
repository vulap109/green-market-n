import { Prisma } from "@/generated/prisma/client";
import type { AdminCreateNewsPostInput } from "@/lib/admin-news";
import { formatString } from "@/lib/utils";
import type { AdminNewsFormState } from "../_components/AdminNewsForm";

type AdminNewsField = keyof AdminCreateNewsPostInput;

export function createAdminNewsFormError(message: string): AdminNewsFormState {
  return {
    message,
    nonce: `${Date.now()}-${Math.random()}`,
    status: "error"
  };
}

export function getDuplicateNewsPostMessage(): string {
  return "Slug này đã tồn tại. Vui lòng nhập slug khác.";
}

export function getAdminNewsMutationErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return getDuplicateNewsPostMessage();
  }

  return error instanceof Error ? error.message : "Không thể lưu bài viết. Vui lòng thử lại.";
}

export function getAdminNewsSlugFromFormData(formData: FormData): string {
  return getFormString(formData, "slug");
}

export function getAdminNewsInputFromFormData(formData: FormData): AdminCreateNewsPostInput {
  return {
    content: getFormString(formData, "content"),
    excerpt: getFormString(formData, "excerpt"),
    featured: getFormBoolean(formData, "featured"),
    hero: getFormString(formData, "hero"),
    metaDescription: getFormString(formData, "metaDescription"),
    metaTitle: getFormString(formData, "metaTitle"),
    publishedAt: getFormString(formData, "publishedAt"),
    slug: getAdminNewsSlugFromFormData(formData),
    status: getFormString(formData, "status"),
    thumbnail: getFormString(formData, "thumbnail"),
    title: getFormString(formData, "title")
  };
}

function getFormString(formData: FormData, key: AdminNewsField): string {
  return formatString(formData.get(key));
}

function getFormBoolean(formData: FormData, key: AdminNewsField): boolean {
  return formatString(formData.get(key)) === "1";
}
