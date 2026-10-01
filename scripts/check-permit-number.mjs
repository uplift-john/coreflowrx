#!/usr/bin/env node
// verify-coreflow Check 20 — The permit number is 24402, and licensure language
// never reads as accreditation.
//
// RATIONALE. Two different failures, one subject, so they live in one script
// only because they share the same scan of the same sentences.
//
//   (a) A WRONG permit number on a pharmacy website is worse than no permit
//       number. It is precisely the field a payer credentialing team or a state
//       surveyor verifies against the Board's public register, and it fails
//       publicly when it does not match. This repo already shipped one: a
//       fabricated "#PH-042891" sat in the site-wide footer for weeks with an
//       in-repo TODO against it, and it survived in an HTML comment on
//       /payers.html (served in page source) even after the visible copy was
//       corrected. The real number, from the Board record, is 24402.
//
//   (b) A STATE LICENSE IS NOT AN ACCREDITATION. CoreFlow holds permit 24402;
//       it does NOT hold URAC or ACHC accreditation and is only pursuing both
//       (Check 2 guards that, and Check 2 is not touched by this one). The two
//       facts sit near each other on /, /about, /providers and /payers, so the
//       risk is not a bald false claim but a blurred sentence: "approved",
//       "certified" and "accredited" all read as accreditation to a payer.
//       "Licensed" and "permitted" are the defensible words.
//
// WHAT IT DOES, over the visible text of built HTML:
//   1. Collect every permit-number-shaped token and FAIL on any that is not
//      24402. Fails explicitly and by name on PH-042891.
//   1b. ALSO scans RAW HTML, including comments, for the retired number and for
//      "permit #<token>". visibleText() strips comments, and an HTML comment IS
//      served in page source — which is exactly how PH-042891 survived on
//      /payers.html after the visible copy was corrected. A visibleText-only
//      scan would not have caught the regression this check exists to prevent.
//   2. FAIL on any sentence that mentions a permit / licence / the Board of
//      Pharmacy AND also contains "accredited", "certified" or bare "approved".
//   3. Require the canonical licensure sentence to appear at least once in the
//      build, so the facts cannot silently vanish from the site entirely.
//
// WHAT IT DOES NOT COVER:
//   • Whether 24402 is still active. Off-repo; verify with the Board.
//   • Accreditation claims on their own — Check 2.
//   • Pre-issuance regressions, the expiry date, disciplinary claims — Check 18.
//   • PDFs, the Formstack embed's contents, or anything outside _site/.
//   • The ENTITY NAME in a licensure claim. The Board lists the licensee as
//     "CoreFlow Rx LLC"; the site's brand name is "CoreFlow Specialty Infusion".
//     This script does not police which appears where, because the brand name is
//     legitimate in marketing copy. See docs/stage2/blockers.md.
import { builtPages, visibleText, report } from "./lib-html-text.mjs";

const EXPECTED = "24402";
const CANONICAL = /Licensed by the South Carolina Board of Pharmacy/i;
const LICENSURE_CONTEXT = /\b(?:permit|licen[cs]ed?|licensure|Board of Pharmacy)\b/i;
const ACCREDITATION_WORDS = /\b(accredited|certified|approved)\b/i;

const problems = [];
let canonicalSeen = false;

for (const { file, html } of builtPages()) {
  const text = visibleText(html);
  if (CANONICAL.test(text)) canonicalSeen = true;

  // --- 1. permit numbers -------------------------------------------------
  // Any token following "permit"/"license"/"licence" (optionally via "#" or
  // "no."), plus any bare "#1234"-shaped token, plus the retired number in any
  // spacing/casing. Deliberately wide: a number we fail to recognise as a
  // permit number is a number nobody checked.
  const NUMBERISH = [
    /\b(?:permit|licen[cs]e)\s*(?:number|no\.?|#)?\s*#?\s*([A-Za-z]{0,3}-?\d{3,}[A-Za-z0-9-]*)/gi,
    /#\s*([A-Za-z]{0,3}-?\d{3,}[A-Za-z0-9-]*)/g,
  ];
  for (const re of NUMBERISH) {
    for (const m of text.matchAll(re)) {
      const token = m[1].replace(/[^A-Za-z0-9-]/g, "");
      if (token.toUpperCase() === EXPECTED) continue;
      const around = text.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, " ");
      problems.push(
        `${file}: permit-number-shaped token "${token}" is not ${EXPECTED} — …${around}…`
      );
    }
  }
  for (const m of text.matchAll(/PH-?\s?0?42891/gi)) {
    const around = text.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, " ");
    problems.push(`${file}: the retired fabricated permit number PH-042891 — …${around}…`);
  }

  // --- 1b. raw scan, comments included ----------------------------------
  const RAW = [
    [/PH-?\s?0?42891/gi, "the retired fabricated permit number PH-042891"],
    [/\b(?:permit|licen[cs]e)\s*(?:number|no\.?|#)\s*#?\s*([A-Za-z]{0,3}-?\d{3,}[A-Za-z0-9-]*)/gi, "permit number"],
  ];
  for (const [re, label] of RAW) {
    for (const m of html.matchAll(re)) {
      const token = (m[1] ?? m[0]).replace(/[^A-Za-z0-9-]/g, "");
      if (token.toUpperCase() === EXPECTED) continue;
      const line = html.slice(0, m.index).split("\n").length;
      const around = html.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, " ");
      problems.push(
        `${file}:${line}: ${label} "${token}" in RAW html (comments included) is not ${EXPECTED} — …${around}…`
      );
    }
  }

  // --- 2. licensure must not read as accreditation -----------------------
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    if (!LICENSURE_CONTEXT.test(sentence)) continue;
    const hit = sentence.match(ACCREDITATION_WORDS);
    if (!hit) continue;
    problems.push(
      `${file}: licensure sentence uses "${hit[1]}", which reads as accreditation ` +
        `(use "licensed" or "permitted") — …${sentence.trim().slice(0, 170)}…`
    );
  }
}

// --- 3. the facts must be present somewhere ------------------------------
if (!canonicalSeen) {
  problems.push(
    'no page states "Licensed by the South Carolina Board of Pharmacy" — the ' +
      "licensure fact has vanished from the build entirely"
  );
}

report(`Check 20 · permit number is ${EXPECTED}; licensure never reads as accreditation`, [
  ...new Set(problems),
]);
