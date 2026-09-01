module.exports = function (eleventyConfig) {
  // Static assets: copy through untouched to _site/
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("site.js");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("*.jpg");
  eleventyConfig.addPassthroughCopy("*.jpeg");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.svg");
  eleventyConfig.addPassthroughCopy("*.ico");
  eleventyConfig.addPassthroughCopy("*.webp");
  eleventyConfig.addPassthroughCopy("*.gif");
  // PDFs are documents, not bulk assets — publish each ONE by exact name, never a
  // wildcard. A *.pdf glob would silently ship any confidential PDF (BAA, contract,
  // insurance card) left at the repo root. Add a line here AND to the Check 8
  // allowlist when you deliberately publish a new document.
  eleventyConfig.addPassthroughCopy("coreflow-fax-cover-sheet.pdf");

  // Not site content — don't render these as pages.
  eleventyConfig.ignores.add("README.md");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
