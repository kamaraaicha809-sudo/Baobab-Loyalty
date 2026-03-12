const config = require("./config").default || require("./config");

module.exports = {
  siteUrl: process.env.SITE_URL || `https://${config.domainName}`,
  generateRobotsTxt: true,
  // Exclude routes from the sitemap (user dashboard, admin, auth, etc.)
  exclude: [
    "/twitter-image.*",
    "/opengraph-image.*",
    "/icon.*",
    "/dashboard/*",
    "/dashboard",
    "/admin/*",
    "/admin",
    "/auth/*",
  ],
  robotsTxtOptions: {
    policies: [
      { 
        userAgent: "*", 
        allow: "/" 
      },
      { 
        userAgent: "*", 
        disallow: ["/dashboard", "/admin", "/auth"] 
      },
    ],
    additionalSitemaps: [],
  },
  changefreq: "weekly",
  priority: 0.7,
};
