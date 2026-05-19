import type { MetadataRoute } from "next";
import { buildAbsoluteUrl } from "@/lib/structured-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/cart/",
        "/checkout",
        "/checkout/",
        "/checkout/success",
        "/check-out",
        "/check-out/",
        "/order-success",
        "/login",
        "/account",
        "/account/",
        "/admin",
        "/admin/",
        "/api",
        "/api/",
        "/*?sort=",
        "/*?price=",
        "/*?minPrice=",
        "/*?maxPrice=",
        "/*?category=",
        "/*?q=",
        "/*?search="
      ]
    },
    sitemap: buildAbsoluteUrl("/sitemap.xml")
  };
}
