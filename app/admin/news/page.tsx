import Link from "next/link";
import type { Metadata } from "next";
import {
  ADMIN_NEWS_LIMIT,
  ADMIN_NEWS_STATUS_OPTIONS,
  findAdminNewsPosts,
  type AdminNewsFilters,
  type AdminNewsListItem
} from "@/lib/admin-news";
import { buildNewsDetailUrl } from "@/lib/routes";
import { formatParamString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản lý bài viết"
};

type AdminNewsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const statusBadgeClassNameByStatus: Record<string, string> = {
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200"
};

function resolveAdminNewsFilters(
  searchParams: Record<string, string | string[] | undefined>
): AdminNewsFilters {
  return {
    keyword: formatParamString(searchParams.keyword),
    status: formatParamString(searchParams.status)
  };
}

function formatAdminNewsDate(date?: Date | null): string {
  return date ? date.toLocaleDateString("vi-VN") : "-";
}

function getNewsPostDate(post: AdminNewsListItem): string {
  return formatAdminNewsDate(post.publishedAt || post.createdAt);
}

export default async function AdminNewsPage({ searchParams }: AdminNewsPageProps) {
  const paramsValue = await searchParams;
  const filters = resolveAdminNewsFilters(paramsValue);
  const newsResult = await findAdminNewsPosts(filters);
  const hasMorePosts = newsResult.totalPosts > newsResult.items.length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Bài viết</h2>
          <p className="mt-1 text-sm text-slate-600">
            Quản lý nội dung tin tức, trạng thái xuất bản, ảnh thumbnail và hero.
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-[#004e29]"
        >
          <i className="fa-solid fa-plus text-xs" aria-hidden="true" />
          <span>Thêm bài viết</span>
        </Link>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <form action="/admin/news" method="get" className="grid gap-4 p-4 md:grid-cols-[1fr_220px_auto]">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tiêu đề / slug</span>
            <input
              name="keyword"
              defaultValue={filters.keyword}
              placeholder="Nhập từ khóa..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Trạng thái</span>
            <select
              name="status"
              defaultValue={filters.status}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Tất cả trạng thái</option>
              {ADMIN_NEWS_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <i className="fa-solid fa-filter text-xs" aria-hidden="true" />
              <span>Apply</span>
            </button>
            <Link
              href="/admin/news"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-950">
            {newsResult.totalPosts.toLocaleString("vi-VN")} bài viết
          </p>
          {hasMorePosts ? (
            <p className="text-xs font-medium text-slate-500">
              Đang hiển thị {ADMIN_NEWS_LIMIT} bài viết mới cập nhật gần nhất.
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Bài viết</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Nổi bật</th>
                <th className="px-4 py-3">Ngày đăng</th>
                <th className="px-4 py-3">Cập nhật</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {newsResult.items.length ? (
                newsResult.items.map((post) => (
                  <tr key={post.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-950">{post.title}</p>
                        <p className="mt-1 text-xs text-slate-500">Slug: {post.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                          statusBadgeClassNameByStatus[post.status] ||
                          "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {post.status || "Không rõ"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{post.featured ? "Có" : "Không"}</td>
                    <td className="px-4 py-3 text-slate-500">{getNewsPostDate(post)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatAdminNewsDate(post.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/news/${post.id}/edit`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" aria-hidden="true" />
                          <span>Sửa</span>
                        </Link>
                        {post.status === "published" ? (
                          <Link
                            href={buildNewsDetailUrl(post.slug)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
                            <span>Xem</span>
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    Không tìm thấy bài viết phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
