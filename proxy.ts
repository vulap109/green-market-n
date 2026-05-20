import { NextResponse, type NextRequest } from "next/server";

const legacySlugPattern = /^[a-z0-9-]+$/i;

const legacyCollectionCategorySlugs: Record<string, string> = {
  "fruit-basket": "gio-trai-cay",
  "imported-fruits": "trai-cay-nhap-khau",
  "flowers": "hoa-tuoi",
  "cream-cake": "banh-kem"
};

const legacyCollectionSubcategorySlugs: Record<string, string> = {
  "fresh": "gio-trai-cay-tuoi",
  "box": "hop-qua-trai-cay",
  "funeral": "gio-trai-cay-vieng"
};

function createPermanentRedirect(request: NextRequest, pathname: string): NextResponse {
  const targetUrl = request.nextUrl.clone();
  targetUrl.pathname = pathname;
  targetUrl.search = "";

  return NextResponse.redirect(targetUrl, 301);
}

function createCollectionLegacyRedirect(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length !== 2 || pathSegments[0] !== "collections") {
    return null;
  }

  const currentCategory = pathSegments[1];
  const nextCategory = legacyCollectionCategorySlugs[currentCategory] || currentCategory;
  const currentSubcategory = request.nextUrl.searchParams.get("subcategory")?.trim() || "";
  const nextSubcategory =
    nextCategory === "gio-trai-cay"
      ? legacyCollectionSubcategorySlugs[currentSubcategory] || currentSubcategory
      : currentSubcategory;

  if (currentCategory === nextCategory && currentSubcategory === nextSubcategory) {
    return null;
  }

  const targetUrl = request.nextUrl.clone();
  targetUrl.pathname = `/collections/${encodeURIComponent(nextCategory)}`;

  if (currentSubcategory !== nextSubcategory) {
    targetUrl.searchParams.set("subcategory", nextSubcategory);
  }

  return NextResponse.redirect(targetUrl, 301);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const collectionRedirect = createCollectionLegacyRedirect(request);

  if (collectionRedirect) {
    return collectionRedirect;
  }

  const hasSlugParam = request.nextUrl.searchParams.has("slug");
  const slug = request.nextUrl.searchParams.get("slug")?.trim() || "";

  if (!hasSlugParam) {
    return NextResponse.next();
  }

  if (!legacySlugPattern.test(slug)) {
    return pathname === "/news" ? createPermanentRedirect(request, "/news") : NextResponse.next();
  }

  if (pathname === "/product") {
    return createPermanentRedirect(request, `/products/${encodeURIComponent(slug)}`);
  }

  return createPermanentRedirect(request, `/news/${encodeURIComponent(slug)}`);
}

export const config = {
  matcher: ["/product", "/news", "/collections/:path*"]
};
