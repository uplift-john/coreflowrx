#!/usr/bin/env node
// verify-coreflow Check 14 — MUSC appears only inside an individual bio.
//
// REPLACES the old approved-relationship-sentence check. That check whitelisted
// four partnership sentences and a [MUSC_RELATIONSHIP_LANGUAGE] token; the
// posture is now reversed. MUSC may be named ONLY when describing where a named
// team member previously worked. No partnership framing, no relationship
// statement, no logo, no "in collaboration with", no implied affiliation.
// Do not restore the sentence list or the token.
//
// RATIONALE: an implied health-system affiliation is one of the two nursing/
// affiliation claims with real legal weight. It is a representation about a
// third party that CoreFlow cannot make unilaterally.
//
// WHAT IT DOES: after removing every element whose class list contains `bio`,
// any remaining case-insensitive "musc" fails — in built HTML AND in source
// templates, which get the same bio exemption because real bio copy lives there
// (the Pharmacist-in-Charge's employment history is the canonical permitted
// use). A MUSC mention in an HTML or Nunjucks COMMENT fails wherever it sits,
// bio or not: that is how the last wording TODO survived three passes.
//
// WHAT IT DOES NOT COVER:
//   • A logo or image OF MUSC. An <img> inside a bio block, or a file named
//     something else entirely, would pass. Asset review is a human job.
//   • Unnamed but obvious references — "South Carolina's academic medical
//     centre" names no one and passes. The Compliance reviewer owns that.
//   • Whether the employment history inside a bio is TRUE.
import { readFileSync, readdirSync } from "node:fs";
import { builtPages, stripBlocks, report } from "./lib-html-text.mjs";

const problems = [];

for (const { file, html } of builtPages()) {
  const outsideBios = stripBlocks(html, "bio");
  for (const m of outsideBios.matchAll(/musc/gi)) {
    const around = outsideBios.slice(Math.max(0, m.index - 70), m.index + 70).replace(/\s+/g, " ");
    problems.push(`${file}: MUSC outside a bio block — …${around}…`);
  }
}

// Source templates get the same bio-block exemption as the built output — real
// bio copy lives in source too (the Pharmacist-in-Charge's employment history is
// the canonical permitted use). But a MUSC mention in an HTML COMMENT is still
// flagged wherever it sits, including inside a bio: that is how the last
// "replace token with final approved MUSC wording" TODO survived three passes,
// and a comment is an invitation to put the claim back.
const sources = [
  ...readdirSync(".").filter((f) => f.endsWith(".njk")),
  ...readdirSync("_includes")
    .filter((f) => f.endsWith(".njk"))
    .map((f) => `_includes/${f}`),
];

for (const f of sources) {
  const src = readFileSync(f, "utf8");

  for (const c of src.matchAll(/<!--[\s\S]*?-->|\{#[\s\S]*?#\}/g)) {
    if (/musc/i.test(c[0])) {
      problems.push(
        `${f} (source comment): MUSC reference — ${c[0].replace(/\s+/g, " ").slice(0, 110)}`
      );
    }
  }

  for (const m of stripBlocks(src, "bio").matchAll(/musc/gi)) {
    const around = stripBlocks(src, "bio")
      .slice(Math.max(0, m.index - 60), m.index + 60)
      .replace(/\s+/g, " ");
    problems.push(`${f} (source): MUSC outside a bio block — …${around}…`);
  }
}

report("Check 14 · MUSC only inside individual bios", [...new Set(problems)]);
