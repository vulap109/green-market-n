import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import {
  findAdminNewsSlugConflict,
  getAdminNewsPostForEdit,
  updateAdminNewsPost
} from "@/lib/admin-news";
import { isAdminRole } from "@/lib/auth/login";
import { formatString } from "@/lib/utils";
import AdminNewsForm, { type AdminNewsFormState } from "../../_components/AdminNewsForm";
import AdminNewsFormFields from "../../_components/AdminNewsFormFields";
import {
  createAdminNewsFormError,
  getAdminNewsInputFromFormData,
  getAdminNewsMutationErrorMessage,
  getAdminNewsSlugFromFormData,
  getDuplicateNewsPostMessage
} from "../../_lib/news-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sửa bài viết"
};

type AdminEditNewsPostPageProps = Readonly<{
  params: Promise<{
    postId: string;
  }>;
}>;

async function updateNewsPostAction(
  _state: AdminNewsFormState,
  formData: FormData
): Promise<AdminNewsFormState> {
  "use server";

  const session = await auth();
  const postId = formatString(formData.get("postId"));
  let updatedSlug = "";

  if (!session?.user || !isAdminRole(session.user.role)) {
    return createAdminNewsFormError("Bạn không có quyền cập nhật bài viết.");
  }

  try {
    const slug = getAdminNewsSlugFromFormData(formData);
    const hasConflict = await findAdminNewsSlugConflict(slug, postId);

    if (hasConflict) {
      return createAdminNewsFormError(getDuplicateNewsPostMessage());
    }

    const newsInput = getAdminNewsInputFromFormData(formData);
    updatedSlug = newsInput.slug;
    await updateAdminNewsPost(postId, newsInput);
  } catch (error) {
    return createAdminNewsFormError(getAdminNewsMutationErrorMessage(error));
  }

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${updatedSlug}`);
  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${postId}/edit`);
  redirect("/admin/news");
}

export default async function AdminEditNewsPostPage({ params }: AdminEditNewsPostPageProps) {
  const { postId } = await params;
  const post = await getAdminNewsPostForEdit(postId);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Sửa bài viết</h2>
          <p className="mt-1 text-sm text-slate-600">Cập nhật nội dung, ảnh và trạng thái cho {post.title}.</p>
        </div>
        <Link
          href="/admin/news"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          <span>Danh sách</span>
        </Link>
      </section>

      <AdminNewsForm action={updateNewsPostAction}>
        <input type="hidden" name="postId" value={post.id} />
        <AdminNewsFormFields values={post} />

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/news"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Hủy
          </Link>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-[#004e29]"
          >
            <i className="fa-solid fa-floppy-disk text-xs" aria-hidden="true" />
            <span>Cập nhật bài viết</span>
          </button>
        </div>
      </AdminNewsForm>
    </div>
  );
}
