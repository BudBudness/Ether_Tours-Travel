import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ether-tours-travel.vercel.app").replace(/\/$/, "");
  const routes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/tours", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/destinations", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/enquire", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  ];
  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
