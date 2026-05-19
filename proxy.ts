import { NextResponse, type NextRequest } from "next/server";

const legacySlugPattern = /^[a-z0-9-]+$/i;

function createPermanentRedirect(request: NextRequest, pathname: string): NextResponse {
  const targetUrl = request.nextUrl.clone();
  targetUrl.pathname = pathname;
  targetUrl.search = "";

  return NextResponse.redirect(targetUrl, 301);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
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
  matcher: ["/product", "/news"]
};
