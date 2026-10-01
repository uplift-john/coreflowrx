#!/usr/bin/env node
// verify-coreflow Check 18 — No pharmacy licensure claims of any kind.
//
// THIS CHECK HAS NOW BEEN INVERTED TWICE. Read the history before touching it,
// because each version asserts the opposite of the one before and restoring an
// old one would publish a false statement.
//
//   v1 (to 2026-09-30) — CoreFlow held no permit. FAIL on any claim of holding
//      one, and on the fabricated number #PH-042891.
//   v2 (2026-10-01)    — SC Board of Pharmacy permit 24402 issued 2026-09-30.
//      FAIL on stale pre-issuance language, on a published expiry, on any
//      disciplinary assertion.
//   v3 (2026-10-01, this one) — leadership removed licensure from the site
//      entirely. The permit is real and current; it is simply not advertised.
//      The reasoning: a pharmacy that is open is necessarily permitted, so
//      stating it adds nothing a prescriber or payer did not already assume.
//
// So this is NOT the v1 rule returning. v1 said "do not claim what you do not
// have." v3 says "do not discuss licensure at all." The permit exists.
//
// WHAT IT DOES:
//   FAIL, over visible text, on any reference to the pharmacy's own licensure:
//   "Board of Pharmacy", "pharmacy permit", a bare "permit", "licensure",
//   "Reg 99-43", "Resident Pharmacy Permit", "we are licensed", "licensed
//   pharmacy", "state-licensed" / "SC-licensed".
//
// DELIBERATELY ALLOWED — these are about OTHER PEOPLE, not this pharmacy, and
// every one of them is load-bearing copy:
//   • "licensed physicians and other providers eligible to prescribe" — the
//     prescriber-order gate on five pages. Removing it would weaken a real
//     control, not a marketing line.
//   • "licensed providers to submit patient referrals" (terms).
//   • "permitted by law" / "as permitted by HIPAA" — the regex is \bpermit\b,
//     which does not match "permitted". This is why the rule is a word boundary
//     and not a substring.
//
// WHAT IT DOES NOT COVER:
//   • A permit NUMBER specifically, including inside HTML comments — Check 20,
//     which scans raw bytes. Kept separate because a merged check can be passed
//     by weakening either half.
//   • Accreditation — Check 2.
//   • Whether permit 24402 is current. It is not published, so nothing on the
//     site goes stale; but nothing on the site will warn you either. Off-repo.
//
// IF THE POLICY IS REVERSED, rewrite this in the same commit as the copy.
import { builtPages, visibleText, report } from "./lib-html-text.mjs";

const CLAIMS = [
  [/\bBoard of Pharmacy\b/gi, 'references the Board of Pharmacy'],
  [/\bpharmacy permit\b/gi, 'references a pharmacy permit'],
  [/\bpermit\b/gi, 'uses the word "permit"'],
  [/\blicensur\w*/gi, 'uses the word "licensure"'],
  [/\bReg\.?\s?99-43/gi, 'cites Reg 99-43 (the permit regulation)'],
  [/\bResident Pharmacy\b/gi, 'references the Resident Pharmacy Permit'],
  [/\bwe are licensed\b/gi, 'claims CoreFlow is licensed'],
  [/\blicensed\s+(?:specialty\s+|home\s+|infusion\s+|retail\s+)*pharmacy\b/gi, 'describes CoreFlow as a licensed pharmacy'],
  [/\b(?:state|South Carolina|SC)[\s‐‑-]licensed\b/gi, 'describes CoreFlow as state-licensed'],
];

const problems = [];
for (const { file, html } of builtPages()) {
  const text = visibleText(html);
  for (const [re, label] of CLAIMS) {
    for (const m of text.matchAll(re)) {
      const around = text.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, " ");
      problems.push(`${file}: ${label} — …${around}…`);
    }
  }
}
report("Check 18 · no pharmacy licensure claims of any kind", [...new Set(problems)]);
