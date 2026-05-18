import { ADMIN_NEWS_STATUS_OPTIONS, type AdminCreateNewsPostInput } from "@/lib/admin-news";

type AdminNewsFormFieldsProps = Readonly<{
  values?: Partial<AdminCreateNewsPostInput>;
}>;

const emptyNewsValues: AdminCreateNewsPostInput = {
  content: "",
  excerpt: "",
  featured: false,
  hero: "",
  metaDescription: "",
  metaTitle: "",
  publishedAt: "",
  slug: "",
  status: "draft",
  thumbnail: "",
  title: ""
};

export default function AdminNewsFormFields({ values }: AdminNewsFormFieldsProps) {
  const newsValues = {
    ...emptyNewsValues,
    ...values
  };

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-950">Thông tin bài viết</h3>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tiêu đề</span>
            <input
              name="title"
              required
              defaultValue={newsValues.title}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Slug</span>
            <input
              name="slug"
              required
              defaultValue={newsValues.slug}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Trạng thái</span>
            <select
              name="status"
              defaultValue={newsValues.status}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              {ADMIN_NEWS_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Ngày xuất bản</span>
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={newsValues.publishedAt}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="flex items-center gap-3 self-end rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              name="featured"
              type="checkbox"
              value="1"
              defaultChecked={newsValues.featured}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <span className="text-sm font-bold text-slate-700">Bài nổi bật</span>
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-950">Ảnh hiển thị</h3>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Thumbnail URL</span>
            <input
              name="thumbnail"
              type="text"
              placeholder="/images/news-thumb.jpg"
              defaultValue={newsValues.thumbnail}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Hero URL</span>
            <input
              name="hero"
              type="text"
              placeholder="/images/news-hero.jpg"
              defaultValue={newsValues.hero}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-950">Nội dung</h3>
        </div>

        <div className="grid gap-4 p-5">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tóm tắt</span>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={newsValues.excerpt}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">HTML nội dung</span>
            <textarea
              name="content"
              required
              rows={16}
              defaultValue={newsValues.content}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-950">SEO</h3>
        </div>

        <div className="grid gap-4 p-5">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Meta title</span>
            <input
              name="metaTitle"
              defaultValue={newsValues.metaTitle}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Meta description</span>
            <textarea
              name="metaDescription"
              rows={3}
              defaultValue={newsValues.metaDescription}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>
    </>
  );
}
