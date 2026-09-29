module.exports = function (eleventyConfig) {
  // Static assets: copy through untouched to _site/
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("site.js");
  eleventyConfig.addPassthroughCopy("finder.js");
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

  // ── Filters for the /diseases-we-treat and /drugs-we-provide finders ──
  // These exist so the templates never hardcode a drug or condition name:
  // every rendered item comes out of _data/therapies.json or
  // _data/conditions.json. Guarded by verify-coreflow Check 17.
  eleventyConfig.addFilter("whereStatus", (items, status) =>
    (items || []).filter((item) => item.status === status)
  );
  eleventyConfig.addFilter("inSpecialty", (items, specialtyId) =>
    (items || []).filter((item) => (item.specialties || []).includes(specialtyId))
  );
  eleventyConfig.addFilter("specialtyNames", (ids, specialties) =>
    (specialties || [])
      .filter((specialty) => (ids || []).includes(specialty.id))
      .map((specialty) => specialty.name)
  );

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
