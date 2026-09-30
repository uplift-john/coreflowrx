#!/usr/bin/env node
// verify-coreflow Check 19 — No named third-party business relationship claims.
//
// RATIONALE: SKILL.md's own closing rule says that when the same class of problem
// appears twice, add a grep-able check rather than fixing the instance. This class
// appeared twice in ONE pass:
//   • MUSC Health — asserted as a home infusion partner in five places (Check 3
//     now confines MUSC to individual bios).
//   • Council Capital — "CoreFlow was established as a joint venture with Council
//     Capital, a healthcare-focused private equity firm" sat on /about with no
//     substantiation in the repo. Removed by John, 2026-09-29.
// Both are representations ABOUT A THIRD PARTY that CoreFlow cannot make
// unilaterally. Check 3 guards one company by name; this guards the SHAPE, so the
// next one is caught before it ships rather than after someone notices.
//
// WHAT IT DOES: over the visible text of every built page, outside `bio` blocks,
// flags the grammatical shapes a partnership/backing claim takes when it names or
// implies a specific organisation.
//
// WHAT IT DOES NOT COVER:
//   • An unnamed but obvious reference ("South Carolina's academic medical
//     centre"). Compliance owns that.
//   • Whether a claim is TRUE or authorised. A real, approved partnership must
//     still be added here deliberately, with the authorisation recorded — that is
//     the point, not a limitation.
//   • Vendor facts that are not relationship claims. "hosted by Formstack under a
//     signed BAA" is a processing disclosure the Privacy Policy requires, and is
//     deliberately allowed.
import { builtPages, visibleText, stripBlocks, report } from "./lib-html-text.mjs";

// A capitalised proper-noun run, allowing internal lowercase joiners ("Board of
// Pharmacy"), so the pattern fires on a NAMED organisation, not on "in
// partnership with local nursing agencies".
const ORG = "[A-Z][A-Za-z&.'\\u2019-]+(?:\\s+(?:of|for|and|the)\\s+[A-Z][A-Za-z&.'\\u2019-]+|\\s+[A-Z][A-Za-z&.'\\u2019-]+){0,4}";

const CLAIMS = [
  [`\\bjoint venture\\b[^.]{0,40}?\\bwith\\s+(${ORG})`, "joint-venture claim"],
  [`\\b(?:in|through)\\s+partnership\\s+with\\s+(${ORG})`, "partnership claim"],
  [`\\bpartnered\\s+with\\s+(${ORG})`, "partnership claim"],
  [`\\b(?:backed|funded|owned|established)\\s+by\\s+(${ORG})`, "investor / ownership claim"],
  [`\\b(?:selected|chosen|endorsed|trusted|approved)\\s+by\\s+(${ORG})`, "endorsement claim"],
  [`\\b(${ORG})\\s+(?:selected|chose|endorses|trusts|has selected|has chosen)\\s+CoreFlow`, "endorsement claim"],
  [`\\b(?:preferred|exclusive|approved)\\s+(?:\\w+\\s+){0,3}(?:partner|provider|vendor)\\s+(?:to|for|of)\\s+(${ORG})`, "preferred-partner claim"],
  [`\\bprivate equity\\b`, "names an investor class"],
];

const problems = [];
for (const { file, html } of builtPages()) {
  const text = visibleText(stripBlocks(html, "bio"));
  for (const [src, label] of CLAIMS) {
    for (const m of text.matchAll(new RegExp(src, "g"))) {
      const around = text.slice(Math.max(0, m.index - 50), m.index + 110).replace(/\s+/g, " ");
      problems.push(`${file}: ${label} — …${around}…`);
    }
  }
}
report("Check 19 · no named third-party business relationship claims", [...new Set(problems)]);
