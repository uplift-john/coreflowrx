#!/usr/bin/env node
// Build-time internal link & anchor checker for CoreFlow Rx.
// Fails (exit 1) on: empty anchors (href="#", href=""), internal links to a
// missing built file, and fragment links to a missing id. External links
// (http/https/tel/mailto/data) are not fetched — only internal integrity.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";
const htmlFiles = readdirSync(SITE).filter((f) => f.endsWith(".html"));

// id set per file
const ids = new Map();
const bodies = new Map();
for (const f of htmlFiles) {
  const html = readFileSync(join(SITE, f), "utf8");
  bodies.set(f, html);
  const set = new Set();
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) set.add(m[1]);
  // named anchors <a name="..">
  for (const m of html.matchAll(/<a[^>]+name="([^"]+)"/g)) set.add(m[1]);
  ids.set(f, set);
}

const problems = [];
const attrRe = /\b(?:href|src)="([^"]*)"/g;

for (const f of htmlFiles) {
  const html = bodies.get(f);
  for (const m of html.matchAll(attrRe)) {
    const raw = m[1].trim();
    if (raw === "" || raw === "#") {
      problems.push(`${f}: empty/dead anchor target (${JSON.stringify(raw)})`);
      continue;
    }
    // skip external / non-navigational schemes and root-relative absolute assets
    if (/^(?:https?:)?\/\//.test(raw)) continue;
    if (/^(?:tel:|mailto:|data:|javascript:)/i.test(raw)) continue;

    let path = raw;
    let frag = "";
    const hashAt = raw.indexOf("#");
    if (hashAt >= 0) {
      path = raw.slice(0, hashAt);
      frag = raw.slice(hashAt + 1);
    }

    if (path === "") {
      // same-page fragment
      if (frag && !ids.get(f).has(frag)) {
        problems.push(`${f}: fragment #${frag} has no matching id on the page`);
      }
      continue;
    }

    // normalize target file: strip leading "./" and leading "/"
    let target = path.replace(/^\.\//, "").replace(/^\//, "");
    // directory or extensionless -> try index.html / .html
    let candidates = [target];
    if (!target.endsWith(".html")) {
      if (target.endsWith("/")) candidates.push(target + "index.html");
      else candidates.push(target + ".html", target + "/index.html");
    }
    // asset (css/js/img/pdf/xml/txt) — just check existence as-is
    const exists = candidates.some((c) => {
      try {
        readFileSync(join(SITE, c));
        return true;
      } catch {
        return false;
      }
    });
    if (!exists) {
      problems.push(`${f}: link "${raw}" -> missing built file (${target})`);
      continue;
    }
    // if fragment on a resolved .html target, check its ids
    if (frag && target.endsWith(".html") && ids.has(target)) {
      if (!ids.get(target).has(frag)) {
        problems.push(`${f}: link "${raw}" -> #${frag} not found in ${target}`);
      }
    }
  }
}

if (problems.length) {
  console.error("FAIL — broken internal links / anchors:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`PASS — ${htmlFiles.length} pages, no broken internal links or empty anchors.`);
