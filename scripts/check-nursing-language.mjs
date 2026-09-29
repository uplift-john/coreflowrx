#!/usr/bin/env node
// verify-coreflow Check 16 — Nursing language.
//
// RATIONALE, and this one is a legal exposure rather than a style preference:
// the nurses are NOT CoreFlow employees. Copy that says "CoreFlow nurses" or
// "our nurses" asserts an employment relationship that does not exist, which
// bears on liability, on payer representations, and on the nurses' own status.
// Separately, CRNI is removed everywhere it describes a nurse.
//
// WHAT IT DOES, over the visible text of every built page:
//   • FAIL on CRNI in any form.
//   • FAIL on "CoreFlow nurse(s)", "CoreFlow's nurse(s)", "CoreFlow RN(s)",
//     "CoreFlow-credentialed RN(s)/nurse(s)", "our nurse(s)", "we employ …
//     nurses", "nurses we employ", "staff nurses", "employed nurses".
//
// DELIBERATELY ALLOWED: "CoreFlow nursing partner", "our nursing partners",
// "credentialed nursing partners", "the nursing team caring for your patient",
// "the infusion nurse assigned to your patient", "experienced infusion nurses",
// "your nurse", and "CoreFlow's clinical standards" — standards do belong to
// CoreFlow; nurses do not. Note "nursing" never matches, only "nurse"/"nurses".
//
// WHAT IT DOES NOT COVER:
//   • Structural implication without the words. "Meet the CoreFlow team" over a
//     grid of nurse photos would pass this and still imply employment. The
//     Compliance reviewer owns that, as a blocker not a style note.
//   • The Careers page describing nursing roles — recruiting language can imply
//     employment without any banned phrase.
import { builtPages, visibleText, report } from "./lib-html-text.mjs";

const PATTERNS = [
  [/\bCRNI\b/gi, "CRNI credential (Invariant 4a)"],
  [/\bCoreFlow(?:'s|’s)?[\s-]+nurses?\b/gi, "CoreFlow-possessive nursing (Invariant 4b)"],
  [/\bCoreFlow(?:'s|’s)?[\s-]+RNs?\b/gi, "CoreFlow-possessive RN (Invariant 4b)"],
  [/\bCoreFlow[\s-]*credentialed\s+(?:RNs?|nurses?)\b/gi, "CoreFlow-credentialed RN/nurse (Invariant 4b)"],
  // Up to three intervening words: "our credentialed infusion nurses" is
  // the same claim as "our nurses".
  [/\bour(?:\s+[a-z-]+){0,3}\s+nurses?\b/gi, '"our \u2026 nurse(s)" (Invariant 4b)'],
  [/\bour(?:\s+[a-z-]+){0,3}\s+RNs?\b/gi, '"our \u2026 RN(s)" (Invariant 4b)'],
  [/\bwe\s+employ\b[^.]{0,40}\bnurses?\b/gi, "states CoreFlow employs nurses (Invariant 4b)"],
  [/\bnurses?\s+we\s+employ\b/gi, "states CoreFlow employs nurses (Invariant 4b)"],
  [/\b(?:staff|employed|in-house)\s+nurses?\b/gi, "implies employed nursing staff (Invariant 4b)"],
];

const problems = [];
for (const { file, html } of builtPages()) {
  // Attribute text is copy too \u2014 the homepage hero alt read "A CoreFlow nurse".
  const attrs = [...html.matchAll(/(?:alt|aria-label|title)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(" \u00b7 ");
  const text = visibleText(html) + " \u00b7 " + attrs;
  for (const [re, label] of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const around = text.slice(Math.max(0, m.index - 50), m.index + 60).replace(/\s+/g, " ");
      problems.push(`${file}: ${label} — …${around}…`);
    }
  }
}
report("Check 16 · nursing language (no CRNI, no implied employment)", [...new Set(problems)]);
