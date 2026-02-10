import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.ancestorii.com/",
      lastModified: new Date(),
      priority: 1,
    },

    /* --- Guides hub --- */
    {
      url: "https://www.ancestorii.com/guides",
      lastModified: new Date(),
      priority: 0.9,
    },

    /* --- Individual guides --- */
    {
      url: "https://www.ancestorii.com/guides/how-to-preserve-family-memories",
      lastModified: new Date(),
      priority: 0.85,
    },
    {
      url: "https://www.ancestorii.com/guides/how-to-save-family-voices",
      lastModified: new Date(),
      priority: 0.85,
    },
    {
      url: "https://www.ancestorii.com/guides/how-to-record-family-stories",
      lastModified: new Date(),
      priority: 0.85,
    },
    {
      url: "https://www.ancestorii.com/guides/what-to-do-with-old-family-photos",
      lastModified: new Date(),
      priority: 0.85,
    },

    /* --- Podcast --- */
    {
      url: "https://www.ancestorii.com/moments-worth-keeping",
      lastModified: new Date(),
      priority: 0.75,
    },

    /* --- Trust & legal --- */
    {
      url: "https://www.ancestorii.com/why-this-exists",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://www.ancestorii.com/digital-legacy",
      lastModified: new Date(),
      priority: 0.7,
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
