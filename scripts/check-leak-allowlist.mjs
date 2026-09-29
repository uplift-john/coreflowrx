#!/usr/bin/env node
// verify-coreflow Check 8 (mechanised) — No internal content published.
// ALLOWLIST, never a denylist: a denylist only catches leaks someone already
// thought of, and the next internal file postdates the list. That is exactly
// how AGENTS.md and .agents/ leaked. An unignored draft fails here by ROUTE,
// not by name.
import { readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { report } from "./lib-html-text.mjs";

const ROUTES = new Set([
  "index", "about", "accessibility", "careers", "contact", "diseases-we-treat",
  "drugs-we-provide", "non-discrimination", "notice-of-privacy-practices",
  "patients", "payers", "privacy", "providers", "refer", "terms", "thanks", "404",
]);
// Code and text assets pass by type — they cannot carry a confidential document.
const TYPES = new Set([".html", ".css", ".js", ".txt", ".xml"]);
// IMAGES pass by EXACT FILENAME, for the same reason PDFs do. `.eleventy.js`
// globs *.png/*.jpg, so a screenshot of an insurance card or a payer contract
// left at the repo root would publish silently and pass a type-based check.
// A leaked image is the same incident as a leaked PDF.
const IMAGES = new Set([
  "accent-iv-bags.jpg", "accent-iv-care.jpg", "accent-iv-drip.jpg",
  "hero-about.jpg", "hero-home-infusion.jpg", "hero-home.jpg",
  "hero-patients.jpg", "hero-providers.jpg",
  "coreflow-horizontal-logo.png", "logo-horizontal-black.png",
  "logo-horizontal-color.png", "logo-horizontal-gray.png",
  "logo-stacked-color.png", "logo-stacked-transparent.png",
  "favicon.svg",
]);
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".svg", ".ico", ".webp", ".gif"]);
const EXTENSIONLESS = new Set(["_headers", "_redirects"]);
// Documents by EXACT filename — a bare "pdf" type would silently ship any
// confidential PDF left at the repo root.
const DOCUMENTS = new Set(["coreflow-fax-cover-sheet.pdf"]);

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const problems = [];
for (const file of walk("_site")) {
  const rel = file.replace(/^_site\//, "");
  const name = basename(rel);
  const ext = extname(rel).toLowerCase();

  if (ext === ".html") {
    const route = rel.replace(/\/index\.html$/, "").replace(/\.html$/, "");
    if (!ROUTES.has(route)) problems.push(`${rel}: route "${route}" is not in the allowlist`);
    continue;
  }
  if (DOCUMENTS.has(name) || EXTENSIONLESS.has(name) || TYPES.has(ext)) continue;
  if (IMAGE_EXT.has(ext)) {
    if (IMAGES.has(name)) continue;
    problems.push(
      `${rel}: image not on the allowlist. If publishing it is deliberate, add ` +
        `"${name}" to IMAGES in scripts/check-leak-allowlist.mjs.`
    );
    continue;
  }
  problems.push(`${rel}: file type "${ext || "(none)"}" is not allowed to publish`);
}
report("Check 8 · no internal content published (allowlist)", problems);
