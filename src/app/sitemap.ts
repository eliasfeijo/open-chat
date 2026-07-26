import type { MetadataRoute } from "next";

import { appConfig } from "@/shared/config/app-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      changeFrequency: "daily",
      lastModified,
      priority: 1,
      url: appConfig.siteUrl,
    },
    {
      changeFrequency: "daily",
      lastModified,
      priority: 0.9,
      url: `${appConfig.siteUrl}/rooms`,
    },
    {
      changeFrequency: "monthly",
      lastModified,
      priority: 0.6,
      url: `${appConfig.siteUrl}/sign-in`,
    },
    {
      changeFrequency: "monthly",
      lastModified,
      priority: 0.7,
      url: `${appConfig.siteUrl}/sign-up`,
    },
  ];
}
