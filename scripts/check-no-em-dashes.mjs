#!/usr/bin/env node
// verify-coreflow Check 21 — Zero em dashes (U+2014) in built HTML.
//
// RATIONALE: a house style rule John set on 2026-10-01. It is mechanical, so it
// gets a script rather than a reviewer's eye, and it is worth a script because
// an em dash is the single easiest character to reintroduce by accident — every
// word processor and most AI-drafted copy inserts them automatically.
//
// SCANS RAW HTML, NOT visibleText(). This is deliberate and is the one
// interesting decision in the file. visibleText() strips comments, and the
// retired PH-042891 permit number reached production inside an HTML comment on
// /payers.html precisely because comment content was never scanned. An HTML
// comment IS shipped to the browser and IS readable in page source, so for a
// "zero of this character in what we ship" rule, raw bytes are the right scope.
// Entity-encoded forms are caught too: &mdash; and &#8212;/&#x2014; render as an
// em dash on screen, so a find-and-replace that only swapped literal characters
// would otherwise pass while the page still displays one.
//
// WHAT IT DOES NOT COVER — read this before trusting a green result:
//   • PDFs. coreflow-fax-cover-sheet.pdf is SHA-256-pinned (Check 12) and, as of
//     2026-10-01, contains TWO em dashes in its section labels ("SEND TO — …",
//     "FROM — …"). They cannot be removed without regenerating the document and
//     re-pinning the hash. Logged in docs/stage2/blockers.md. This check does not
//     read PDFs at all.
//   • The Formstack referral workflow and the GoHighLevel hosted forms. Their
//     contents live in a third-party iframe, are fetched at runtime, and are not
//     in _site/. Only John can edit that copy.
//   • Anything outside the build: form confirmation screens, auto-reply emails,
//     SMS templates, the Google Business profile.
//   • styles.css. 20 em dashes remain in its CSS COMMENTS by decision — they are
//     developer notes, never rendered, and not site copy. Nothing stops a future
//     em dash in a `content:` pseudo-element, which WOULD be visible copy; there
//     is none today, and if one is ever added this check will not see it.
//   • EN dashes (U+2013) are explicitly NOT covered. "2–6 messages per month"
//     and "8:30 AM – 4:30 PM" are correct typography for numeric ranges. Four
//     remain in the build on purpose. Do not extend this check to them without
//     asking first.
// ALSO SCANS BUILT JS. finder.js built an aria-live announcement as
// `specialty + " \u2014 "` — an em dash injected into the DOM at runtime, which a
// built-HTML-only scan cannot see and which a screen reader reads aloud. Any
// script that writes copy into the page is in scope, so _site/*.js is scanned for
// the literal character and for the \u2014 / \x{2014} escapes that produce it.
import { builtPages, report } from "./lib-html-text.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const FORMS = [
  ["—", "literal em dash U+2014"],
  ["&mdash;", "HTML entity &mdash;"],
  ["&#8212;", "numeric entity &#8212;"],
  ["&#x2014;", "hex entity &#x2014;"],
  ["&#X2014;", "hex entity &#X2014;"],
];

const problems = [];
for (const { file, html } of builtPages()) {
  for (const [needle, label] of FORMS) {
    let from = 0;
    for (;;) {
      const i = html.indexOf(needle, from);
      if (i === -1) break;
      from = i + needle.length;
      const line = html.slice(0, i).split("\n").length;
      const around = html.slice(Math.max(0, i - 75), i + 75).replace(/\s+/g, " ");
      problems.push(`${file}:${line}: ${label} — …${around}…`);
    }
  }
}

// --- built JS: copy injected into the DOM at runtime -----------------------
const JS_FORMS = [
  ["\u2014", "literal em dash U+2014"],
  ["\\u2014", "JS escape \\u2014"],
  ["\\x{2014}", "JS regex escape \\x{2014}"],
];
for (const file of readdirSync("_site").filter((f) => f.endsWith(".js")).sort()) {
  const src = readFileSync(join("_site", file), "utf8");
  for (const [needle, label] of JS_FORMS) {
    let from = 0;
    for (;;) {
      const i = src.indexOf(needle, from);
      if (i === -1) break;
      from = i + needle.length;
      const line = src.slice(0, i).split("\n").length;
      const around = src.slice(Math.max(0, i - 75), i + 75).replace(/\s+/g, " ");
      problems.push(`${file}:${line}: ${label} in built JS — …${around}…`);
    }
  }
}

report("Check 21 · zero em dashes (U+2014) in built HTML and built JS", [
  ...new Set(problems),
]);
