import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/catalog/ProductCard";
import HomeCarousel from "@/components/home/HomeCarousel";
import NewsCard from "@/components/news/NewsCard";
import { buildCollectionUrl } from "@/lib/catalog";
import { getNewsData } from "@/lib/news-db";
import { findProductByCategory, findProductsByFeatured } from "@/lib/product-db";
import { buildLocalBusinessSchema, stringifyJsonLd } from "@/lib/structured-data";
import type { ProductRecord } from "@/lib/product-types";

const HOME_SHELF_LIMIT = 8;

type HomeShelfConfig = Readonly<{
  ctaHref: string;
  title: string;
  badge?: string;
} & (
    | {
      category: string;
      featured?: never;
    }
    | {
      category?: never;
      featured: string;
    }
  )>;

type BenefitItem = {
  description: string;
  iconClassName: string;
  title: string;
};

type Testimonial = {
  imageSrc: string;
  name: string;
  quote: string;
};

const homeShelfConfigs: HomeShelfConfig[] = [
  {
    title: "Sản Phẩm Bán Chạy",
    badge: "HOT",
    ctaHref: buildCollectionUrl({ category: "ban-chay" }),
    featured: "ban-chay"
  },
  {
    title: "Giỏ Quà Trái Cây",
    ctaHref: buildCollectionUrl({ category: "fruit-basket" }),
    category: "fruit-basket"
  },
  {
    title: "Trái Cây Nhập Khẩu",
    ctaHref: buildCollectionUrl({ category: "imported-fruits" }),
    category: "imported-fruits"
  },
  {
    title: "Bánh Kem",
    ctaHref: buildCollectionUrl({ category: "cream-cake" }),
    category: "cream-cake"
  }
];

async function getHomeShelfProducts(config: HomeShelfConfig): Promise<ProductRecord[]> {
  if (config.featured) {
    return findProductsByFeatured(config.featured, HOME_SHELF_LIMIT);
  }

  return findProductByCategory(config.category, HOME_SHELF_LIMIT);
}

const benefitItems: BenefitItem[] = [
  {
    title: "Trái Cây Tươi Mới",
    description: "Trái cây mùa tuyển chọn, đảm bảo độ tươi ngon nhất.",
    iconClassName: "fa-solid fa-leaf"
  },
  {
    title: "Đóng Gói Thủ Công",
    description: "Mỗi giỏ quà đều được trang trí thủ công tỉ mỉ.",
    iconClassName: "fa-solid fa-hand-holding-heart"
  },
  {
    title: "Giao Hàng Hỏa Tốc",
    description: "Giao hỏa tốc trong ngày tại TP. Hồ Chí Minh.",
    iconClassName: "fa-solid fa-truck-fast"
  },
  {
    title: "Quà Tặng Sang Trọng",
    description: "Phù hợp cho mọi dịp lễ, sinh nhật, thăm hỏi.",
    iconClassName: "fa-solid fa-gift"
  }
];

const testimonials: Testimonial[] = [
  {
    imageSrc: "/images/KH1.jpg",
    name: "Lan Nguyễn",
    quote: "Giỏ trái cây đẹp, trái tươi và đóng gói rất cẩn thận. Mình đặt tặng sinh nhật, bạn mình rất thích."
  },
  {
    imageSrc: "/images/KH2.jpg",
    name: "Tuấn TM",
    quote: "Shop giao đúng giờ, giỏ quà nhìn sang hơn ảnh. Trái cây tươi, không bị dập"
  },
  {
    imageSrc: "/images/KH3.jpg",
    name: "Huong Pham",
    quote: "Dịch vụ tư vấn nhanh, gói quà đẹp. Mình đặt gấp nhưng shop vẫn giao kịp."
  }
];

function SectionHeading({
  title,
  ctaHref,
  badge
}: Readonly<{
  badge?: string;
  ctaHref: string;
  title: string;
}>) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
      <h2 className="flex items-center gap-3 border-l-4 border-primary pl-4 text-sm font-semibold uppercase tracking-tight text-gray-900 md:text-xl">
        {title}
        {badge ? (
          <span className="rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold italic text-white">
            {badge}
          </span>
        ) : null}
      </h2>
      <Link
        href={ctaHref}
        className="flex items-center gap-2 text-xs font-bold uppercase text-primary hover:text-red-600"
      >
        Xem tất cả
        <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const localBusinessSchema = buildLocalBusinessSchema();
  const [homeNewsItems, homeShelves] = await Promise.all([
    getNewsData({
      featuredFirst: true,
      take: 3
    }),
    Promise.all(
      homeShelfConfigs.map(async (config) => ({
        ...config,
        items: await getHomeShelfProducts(config)
      }))
    )
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(localBusinessSchema) }}
      />

      <main>
        <HomeCarousel />

        <h1 className="sr-only">
          Green Market - Giỏ Trái Cây, Trái Cây Nhập Khẩu & Bánh Kem Cao Cấp
        </h1>
        {/* <section className="bg-white py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight md:text-4xl" style={{color: 'green'}}>
              Green Market - Trái cây nhập khẩu và giỏ quà trái cây cao cấp
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base" style={{color: 'green'}}>
              Green Market chuyên cung cấp trái cây nhập khẩu tươi ngon, giỏ quà trái cây,
              bánh kem và quà tặng cao cấp cho sinh nhật, thăm hỏi, doanh nghiệp và các dịp lễ.
            </p>
          </div>
        </section> */}

        {homeShelves.map((shelf) => (
          <section key={shelf.title} className="pt-12">
            <div className="mx-auto max-w-7xl px-4">
              <SectionHeading
                title={shelf.title}
                badge={shelf.badge}
                ctaHref={shelf.ctaHref}
              />
              {shelf.items.length ? (
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {shelf.items.map((product) => (
                    <ProductCard key={String(product.id ?? product.slug)} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
                  Chưa có sản phẩm để hiển thị.
                </div>
              )}
            </div>
          </section>
        ))}

        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-medium text-gray-800">Tin tức nổi bật</h2>
            </div>
            {homeNewsItems.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {homeNewsItems.map((article) => (
                  <NewsCard key={String(article.id ?? article.slug)} article={article} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
                Chưa có bài viết nào để hiển thị.
              </div>
            )}
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-[0.24em] text-primary">
              Tại Sao Chọn Chúng Tôi?
            </h2>

            <div className="grid gap-8 md:grid-cols-4">
              {benefitItems.map((item) => (
                <article
                  key={item.title}
                  className="group rounded-2xl bg-white p-8 text-center shadow-sm transition-all hover:bg-primary"
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-primary transition-all group-hover:bg-white/20 group-hover:text-white">
                    <i className={`${item.iconClassName} text-2xl`} aria-hidden="true" />
                  </div>
                  <h3 className="mb-3 text-xs font-bold uppercase group-hover:text-white">{item.title}</h3>
                  <p className="text-[11px] font-medium leading-relaxed text-gray-500 group-hover:text-white/80">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 rounded-3xl bg-primary py-10 text-center text-white shadow-2xl shadow-green-900/20">
              <div className="border-r border-white/10">
                <span className="mb-1 block text-4xl font-black italic">5.000+</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                  Khách hàng hài lòng
                </span>
              </div>
              <div className="border-r border-white/10">
                <span className="mb-1 block text-4xl font-black italic">100%</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                  Đảm bảo tươi ngon
                </span>
              </div>
              <div>
                <span className="mb-1 block text-4xl font-black italic">24/7</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                  Hỗ trợ khách hàng
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Khách Hàng Nói Gì
              <span className="ml-2 text-sm font-bold italic tracking-normal text-yellow-400">★ 4.9/5</span>
            </h2>
            <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-primary" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 p-0.5 ring-2 ring-primary/20">
                    <Image
                      src={testimonial.imageSrc}
                      alt={testimonial.name}
                      width={44}
                      height={44}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{testimonial.name}</h3>
                    <div className="text-[9px] text-yellow-400">★★★★★</div>
                  </div>
                </div>
                <p className="text-xs italic text-gray-500">&quot;{testimonial.quote}&quot;</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
