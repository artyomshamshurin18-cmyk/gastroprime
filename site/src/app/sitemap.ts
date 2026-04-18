import type { MetadataRoute } from "next";
import { cases } from "@/content/cases";
import { siteUrl, solutions } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/contacts",
    "/request",
    "/offer",
    "/refund",
    "/quality",
    "/cases",
    ...solutions.map((solution) => `/${solution.slug}`),
    ...cases.map((item) => `/cases/${item.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
