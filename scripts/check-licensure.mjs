#!/usr/bin/env node
// verify-coreflow Check 18 — Licensure is never claimed as held.
//
// RATIONALE: John confirmed on 2026-09-29 that CoreFlow has NO Resident Pharmacy
// Permit yet — the application is submitted. Before that answer the site claimed
// one in four separate affirmative forms: "We hold a South Carolina Board of
// Pharmacy Resident Pharmacy Permit" (index), "Permit issued under Reg 99-43(B)"
// (about), "issued by the SC Board of Pharmacy" (payers), "a South
// Carolina-licensed specialty infusion pharmacy" (payers hero), plus a concrete
// permit number "#PH-042891" in the site-wide footer that had an in-repo TODO
// against it. Claiming a pharmacy licence you do not hold is a regulatory
// misrepresentation, not a copy nit — this is the same failure class as the
// accreditation claim guarded by Check 2, and it gets the same shape of guard.
//
// WHAT IT DOES, over built HTML:
//   1. FAIL on any affirmative claim of holding a permit or pharmacy licence.
//   2. FAIL on any permit number, and specifically on the retired #PH-042891.
//   3. Require the disclaimer INSIDE <main> on every page whose own content
//      raises the Resident Pharmacy Permit. The footer carries the applied-for
//      line on every page, so a footer-only match would make rule 3 trivial.
//
// WHAT IT DOES NOT COVER:
//   • Whether the application has in fact been submitted. That is John's word.
//   • Individual licences. "Licensed by the SC Board of Pharmacy" under the
//     Pharmacist-in-Charge, "licensed registered nurse", "licensed physicians"
//     and "out-of-state licenses" all describe PEOPLE and are deliberately
//     allowed — a pharmacist can hold a personal licence while the pharmacy's
//     permit is pending.
//   • Accreditation, which is Check 2's job.
//
// WHEN THE PERMIT IS ISSUED: update every reference together, then relax rules
// 1 and 3 here in the same commit and pin the real number in rule 2's place.
import { builtPages, visibleText, report } from "./lib-html-text.mjs";

const CLAIMS = [
  [/\bwe hold\b[^.]{0,80}\b(?:permit|licen[cs]e)\b/gi, 'claims to hold a permit or licence'],
  [/\bwe are licensed\b/gi, 'claims to be licensed'],
  [/\bpermit\s*#/gi, 'states a permit number'],
  [/PH-?0?42891/gi, 'the retired #PH-042891 permit number'],
  [/\bpermit (?:is |was )?issued\b/gi, 'says the permit is issued'],
  [/\bpermit issued under\b/gi, 'says the permit is issued'],
  [/\b(?:South Carolina|SC)[-‑]licensed\b/gi, 'describes CoreFlow as state-licensed'],
  [/\blicensed (?:specialty |home |infusion )*pharmacy\b/gi, 'describes CoreFlow as a licensed pharmacy'],
];
const DISCLAIMER = /not yet (?:been )?issued/i;

const problems = [];
for (const { file, html } of builtPages()) {
  const text = visibleText(html);
  for (const [re, label] of CLAIMS) {
    for (const m of text.matchAll(re)) {
      const around = text.slice(Math.max(0, m.index - 60), m.index + 80).replace(/\s+/g, " ");
      problems.push(`${file}: ${label} — …${around}…`);
    }
  }

  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) {
    problems.push(`${file}: no <main> landmark found`);
    continue;
  }
  const main = visibleText(mainMatch[1]);
  if (/Resident Pharmacy Permit/i.test(main) && !DISCLAIMER.test(main)) {
    problems.push(
      `${file}: <main> raises the Resident Pharmacy Permit without saying it is ` +
        `"not yet issued" (the footer's applied-for line does not count — it is on every page)`
    );
  }
}
report("Check 18 · licensure never claimed as held", [...new Set(problems)]);
