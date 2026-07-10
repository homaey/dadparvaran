import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/*/dashboard", "/*/auth"],
      },
    ],
    sitemap: "https://www.dadparvaran.com/sitemap.xml",
    host: "https://www.dadparvaran.com",
  };
}
