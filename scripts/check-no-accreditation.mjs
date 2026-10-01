#!/usr/bin/env node
// verify-coreflow Check 2 — No accreditation claims of any kind.
//
// THIS CHECK WAS INVERTED ON 2026-10-01. Do not restore the previous version.
//
// Until 2026-10-01 the site stated that CoreFlow was PURSUING URAC Specialty
// Pharmacy v5.0 and ACHC IRX-NO797, and Check 2 enforced the shape of that
// claim: it had to say "pursuing", carry "anticipated Q4 2026", and repeat the
// exact disclaimer "Accreditation has been initiated and has not yet been
// awarded." That check existed because a pursuit claim is one careless edit away
// from reading as a held accreditation.
//
// Leadership removed the pursuit statement from the site entirely on 2026-10-01.
// That is strictly safer: a claim that is absent cannot be misread. But it also
// means the old rule is now backwards — it would demand a disclaimer on copy
// that no longer exists, and it would happily pass a page that re-added
// "pursuing URAC accreditation" as long as the disclaimer came with it.
//
// WHAT IT DOES NOW:
//   1. FAIL on "URAC" or "ACHC" anywhere in RAW built HTML, comments included.
//      These names have no legitimate use on this site any more, so this is an
//      absolute rule with no allowlist to grow.
//   2. FAIL on the grammatical SHAPES an accreditation claim takes, outside bio
//      blocks: "we are accredited", "pursuing … accreditation", "accreditation
//      has been initiated/awarded", "dual-accredited", "accredited by", and an
//      accreditation paired with a target quarter.
//
// WHY SHAPES AND NOT THE BARE WORD: two legitimate uses of "accredit*" remain
// and must not be broken.
//   • Lora Santi's bio names a PRIOR EMPLOYER: "Director of Clinical Operations
//     for an AAAHC-accredited surgery center." That is employment history about
//     a third party, the same carve-out Check 3 makes for MUSC. Bio blocks are
//     stripped before the shape rules run.
//   • privacy.njk twice lists "legal, regulatory, accreditation, and
//     recordkeeping obligations" as a retention category. That is boilerplate
//     about what obligations CAN apply, not a claim that CoreFlow holds or seeks
//     an accreditation. Rewriting legal retention text to dodge a grep would be
//     the wrong trade.
//
// WHAT IT DOES NOT COVER:
//   • State licensure — Checks 18 and 20.
//   • An accreditation claim made as an image or a logo.
//   • Anything outside the build: the Formstack/GoHighLevel iframes, auto-reply
//     emails, the Google Business profile, printed leave-behinds.
//
// IF THE POLICY IS EVER REVERSED and CoreFlow publishes an accreditation status
// again, rewrite this check in the SAME commit — do not just delete it.
import { builtPages, visibleText, stripBlocks, report } from "./lib-html-text.mjs";

// Rule 1 — absolute, raw bytes, comments included.
const NAMES = /\b(URAC|ACHC)\b/gi;

// Rule 2 — claim shapes, outside bios.
const CLAIMS = [
  [/\b(?:we|CoreFlow)\b[^.]{0,40}\b(?:are|is)\b[^.]{0,20}\baccredited\b/gi, 'claims CoreFlow is accredited'],
  [/\bdual[\s-]?accredit/gi, 'claims dual accreditation'],
  [/\baccredited\s+(?:by|under|through)\b/gi, 'names an accrediting body'],
  [/\b(?:pursuing|seeking|applying for|working toward|in pursuit of)\b[^.]{0,60}\baccreditation\b/gi, 'states an accreditation pursuit'],
  [/\baccreditation\b[^.]{0,60}\b(?:pursuing|seeking|initiated|awarded|anticipated|in progress|pending|underway)\b/gi, 'states an accreditation status or timeline'],
  [/\baccreditation\b[^.]{0,40}\bQ[1-4]\s*20\d\d/gi, 'pairs accreditation with a target quarter'],
  [/\b(?:specialty pharmacy v\d|IRX-?NO\s?\d+)/gi, 'names an accreditation programme'],
];

const problems = [];
for (const { file, html } of builtPages()) {
  for (const m of html.matchAll(NAMES)) {
    const line = html.slice(0, m.index).split("\n").length;
    const around = html.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, " ");
    problems.push(`${file}:${line}: names "${m[1]}" in raw HTML (comments included) — …${around}…`);
  }

  const text = visibleText(stripBlocks(html, "bio"));
  for (const [re, label] of CLAIMS) {
    for (const m of text.matchAll(re)) {
      const around = text.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, " ");
      problems.push(`${file}: ${label} — …${around}…`);
    }
  }
}
report("Check 2 · no accreditation claims of any kind", [...new Set(problems)]);
