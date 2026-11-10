import type { MetadataRoute } from "next";
import { BASE_PATH, getSiteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          `${BASE_PATH}/admin-panel`,
          `${BASE_PATH}/admin-panel/`,
          `${BASE_PATH}/api/`,
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).origin,
  };
}
