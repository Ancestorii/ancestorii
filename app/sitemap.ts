import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.ancestorii.com/",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://www.ancestorii.com/privacy-policy",
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: "https://www.ancestorii.com/terms",
      lastModified: new Date(),
      priority: 0.6,
    },
  ];
}
