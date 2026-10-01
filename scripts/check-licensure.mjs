#!/usr/bin/env node
// verify-coreflow Check 18 — Licensure is stated currently and not over-stated.
//
// THIS CHECK WAS INVERTED ON 2026-10-01. Do not restore the previous version.
//
// Until 2026-09-30 CoreFlow held no pharmacy permit, and this check's whole job
// was to FAIL on any claim of holding one (and on a fabricated number,
// #PH-042891, that had been sitting in the footer). Its own closing note said:
// "WHEN THE PERMIT IS ISSUED: update every reference together, then relax rules
// 1 and 3 here in the same commit and pin the real number in rule 2's place."
//
// The permit issued. SC Board of Pharmacy pharmacy permit 24402 was issued to
// CoreFlow Rx LLC on 2026-09-30, active, permit holder Jason Clapsaddle,
// supervising pharmacist Gregory Edward Regan. So the old rules now assert the
// opposite of the truth and have been replaced. The number itself is pinned by
// Check 20, which is a SEPARATE script on purpose: a merged check can be passed
// by weakening either half.
//
// WHAT IT DOES NOW, over built HTML:
//   1. FAIL on retired PRE-ISSUANCE language ("permit not yet issued", "applied
//      for a permit", "application submitted"). This is a regression guard, not
//      a style rule: this repo has twice had stale pre-issuance copy come back
//      via a feature branch cut from an out-of-date main. Understating licensure
//      is less dangerous than overstating it, but on a payer credentialing page
//      it is still wrong, and it is the failure mode with actual precedent here.
//   2. FAIL on a published EXPIRATION DATE. Permits renew; a published expiry
//      goes stale by itself and invites "is this still current?" from the exact
//      reader we least want asking. The permit number lets anyone verify status
//      directly with the Board.
//   3. FAIL on "no disciplinary action" / "no disciplinary history". It is true,
//      and it is also what someone with something to explain would write. The
//      Board record is public; let it speak.
//
// WHAT IT DOES NOT COVER:
//   • The permit NUMBER, and licensure-vs-accreditation wording — Check 20.
//   • Whether the permit is still active today. That is off-repo; the Board's
//     public lookup is the source. Re-verify before any renewal window.
//   • Accreditation claims — Check 2. Accreditation is NOT licensure and the
//     two must never blur; Check 2 is unchanged and stays unchanged.
//   • Individual licences. "Licensed by the SC Board of Pharmacy" under the
//     Pharmacist-in-Charge, "licensed registered nurse", "licensed physicians"
//     and "out-of-state licenses" describe PEOPLE and remain allowed.
import { builtPages, visibleText, report } from "./lib-html-text.mjs";

// NOTE on rule 1: matches "issued", never "awarded". "Accreditation has been
// initiated and has not yet been awarded." is the REQUIRED accreditation
// disclaimer (Check 2) and must survive this check untouched.
const STALE = [
  [/\bpermit (?:is |has |had )?not yet (?:been )?issued\b/gi, 'retired pre-issuance language "permit not yet issued"'],
  [/\bnot yet (?:been )?issued\b/gi, 'retired pre-issuance language "not yet issued"'],
  [/\bapplied for\b[^.]{0,60}\b(?:permit|licen[cs]e)\b/gi, 'retired "applied for a permit" language'],
  [/\b(?:permit|licen[cs]e)\b[^.]{0,40}\bapplied for\b/gi, 'retired "permit applied for" language'],
  [/\bpermit\b[^.]{0,60}\bapplication submitted\b/gi, 'retired "application submitted" language'],
  [/\bhave applied\b[^.]{0,80}\bBoard of Pharmacy\b/gi, 'retired "have applied ... Board of Pharmacy" language'],
];

const EXPIRY = [
  [/\b(?:0?6\/30\/2027|2027-06-30)\b/g, 'publishes the permit expiration date'],
  [/\bJune\s+30,?\s+2027\b/gi, 'publishes the permit expiration date'],
  [/\b(?:permit|licen[cs]e)\b[^.]{0,60}\b(?:expires?|expiration|expiry|valid through|valid until)\b/gi, 'publishes a permit expiration'],
  [/\b(?:expires?|expiration|expiry)\b[^.]{0,40}\b(?:permit|licen[cs]e)\b/gi, 'publishes a permit expiration'],
];

const DISCIPLINE = [
  [/\bno disciplinary\b/gi, 'publishes a "no disciplinary action" assertion'],
  [/\bdisciplinary (?:action|history|record)\b/gi, 'raises disciplinary history'],
];

const problems = [];
for (const { file, html } of builtPages()) {
  const text = visibleText(html);
  for (const [re, label] of [...STALE, ...EXPIRY, ...DISCIPLINE]) {
    for (const m of text.matchAll(re)) {
      // "not yet been awarded" is the accreditation disclaimer — never flag it.
      if (/awarded/i.test(m[0])) continue;
      const around = text.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, " ");
      problems.push(`${file}: ${label} — …${around}…`);
    }
  }
}
report("Check 18 · licensure stated currently, no expiry, no discipline claim", [...new Set(problems)]);
