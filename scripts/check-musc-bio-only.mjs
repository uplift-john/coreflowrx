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
// any remaining case-insensitive "musc" in built HTML fails. It also fails on a
// MUSC mention in a source template comment, which is how the last wording TODO
// survived three passes.
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

// Source templates: a MUSC mention in a comment never reaches the page but does
// invite someone to put the claim back.
for (const f of readdirSync(".").filter((f) => f.endsWith(".njk"))) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/musc/gi)) {
    const around = src.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, " ");
    problems.push(`${f} (source): MUSC reference — …${around}…`);
  }
}
for (const f of readdirSync("_includes").filter((f) => f.endsWith(".njk"))) {
  const src = readFileSync(`_includes/${f}`, "utf8");
  if (/musc/i.test(src)) problems.push(`_includes/${f} (source): MUSC reference`);
}

report("Check 14 · MUSC only inside individual bios", [...new Set(problems)]);
