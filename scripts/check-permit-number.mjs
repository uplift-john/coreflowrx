#!/usr/bin/env node
// verify-coreflow Check 20 — No permit number anywhere, raw bytes included.
//
// INVERTED 2026-10-01, hours after it was written. The version it replaces
// REQUIRED the permit number to be 24402 and required the canonical licensure
// sentence to be present. Leadership then removed licensure from the site, so
// that version would now fail the build on its own third rule.
//
// This check is the narrow, mechanical backstop under Check 18. Check 18 reads
// visible text and forbids licensure LANGUAGE. This one reads RAW BYTES and
// forbids a permit NUMBER, which is the single most damaging thing to leak:
//
//   • 24402 is a real, current permit number. Publishing it is not false, it is
//     simply off-policy — and a number is what a payer or surveyor copies into a
//     lookup, so it travels further than prose.
//   • PH-042891 was FABRICATED. It was removed from visible copy on 2026-09-29
//     and still shipped for weeks inside an HTML COMMENT on /payers.html,
//     because the guard of the day scanned visibleText() and
//     lib-html-text.mjs:23 strips comments. An HTML comment is served to the
//     browser and readable in page source. That is the entire reason this check
//     scans raw bytes, and why it is a separate script from Check 18 rather
//     than another rule inside it.
//
// WHAT IT DOES:
//   1. FAIL on any permit/licence number token in RAW html — "permit #1234",
//      "license no. 1234", and so on. Case-insensitive, comments included.
//   2. FAIL by name on BOTH known numbers, 24402 and PH-042891, in raw html,
//      in any spacing or casing, whether or not a permit keyword is nearby.
//
// NO ALLOWLIST, DELIBERATELY. There is no page on this site that may state a
// permit number, so there is no exception to maintain and no list to grow.
//
// WHAT IT DOES NOT COVER:
//   • Licensure wording without a number — Check 18.
//   • Accreditation — Check 2.
//   • PDFs. The pinned fax cover sheet (Check 12) contains no permit number
//     today; if a future version adds one, this check will not see it.
//   • Third-party iframes, emails, SMS, printed material.
//
// IF THE POLICY IS REVERSED: the previous version of this file, which pinned
// 24402 as the ONLY permitted number, is in git history on this branch. Restore
// it deliberately, in the same commit as the copy.
import { builtPages, report } from "./lib-html-text.mjs";

const RULES = [
  [/\b(?:permit|licen[cs]e)\s*(?:number|no\.?|#)\s*#?\s*([A-Za-z]{0,3}-?\d{3,}[A-Za-z0-9-]*)/gi, "states a permit/licence number"],
  [/\b24402\b/g, "the real permit number 24402 (correct, but off-policy: licensure is not published)"],
  [/PH-?\s?0?42891/gi, "the retired FABRICATED permit number PH-042891"],
];

const problems = [];
for (const { file, html } of builtPages()) {
  for (const [re, label] of RULES) {
    for (const m of html.matchAll(re)) {
      const line = html.slice(0, m.index).split("\n").length;
      const around = html.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, " ");
      problems.push(`${file}:${line}: ${label} — …${around}…`);
    }
  }
}
report("Check 20 · no permit number anywhere (raw bytes, comments included)", [...new Set(problems)]);
