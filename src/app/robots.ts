import type { MetadataRoute } from "next";

import { appConfig } from "@/shared/config/app-config";

export default function robots(): MetadataRoute.Robots {
  return {
    host: appConfig.siteUrl,
    rules: {
      allow: "/",
      userAgent: "*",
    },
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
  };
}
