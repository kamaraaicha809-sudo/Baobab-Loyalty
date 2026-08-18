import { MetadataRoute } from "next";
import config from "@/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = `https://${config.domainName}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/auth"],
      },
      // Robots IA explicitement autorisés (compréhension/citation par les moteurs IA)
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
          "PerplexityBot",
          "CCBot",
        ],
        allow: "/",
        disallow: ["/dashboard", "/admin", "/auth"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
