import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://soonpublicite.com",
      lastModified: new Date(2024, 11, 11),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://soonpublicite.com/anuncios",
      lastModified: new Date(2024, 11, 11),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: "https://soonpublicite.com/crear",
      lastModified: new Date(2024, 11, 11),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: "https://soonpublicite.com/suscripciones",
      lastModified: new Date(2024, 11, 11),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://soonpublicite.com/packs-publicaciones",
      lastModified: new Date(2024, 11, 11),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
