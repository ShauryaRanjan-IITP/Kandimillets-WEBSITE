import { MetadataRoute } from "next";
import siteConfig from "@/data/siteConfig";
import { getAllProductSlugs } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.seo.domain;

  const staticRoutes = [
    "",
    "/about",
    "/products",
    "/sourcing",
    "/partner",
    "/agri-tech",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const productRoutes = getAllProductSlugs().map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
