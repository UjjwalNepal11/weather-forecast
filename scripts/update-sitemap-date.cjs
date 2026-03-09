const fs = require("fs");
const path = require("path");
const sitemapPath = path.join(__dirname, "..", "public", "sitemap.xml");
const today = new Date().toISOString().split("T")[0];
let sitemap = fs.readFileSync(sitemapPath, "utf8");
sitemap = sitemap.replace(
  /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
  `<lastmod>${today}</lastmod>`,
);
fs.writeFileSync(sitemapPath, sitemap);
console.log(`Sitemap updated with date: ${today}`);
