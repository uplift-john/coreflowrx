#!/usr/bin/env node
// verify-coreflow Check 10 (mechanised) — Contact facts match the single
// source of truth, including the TWO-ROLE email split.
//
// RATIONALE: a wrong fax number shipped live once — a referring office faxing
// PHI reaches the wrong recipient. The email rule is new (John, 2026-09-29):
// info@ is the public support address and help@ is the address already
// registered in the carrier-facing A2P/10DLC documents. Terms, Privacy and the
// Notice of Privacy Practices must keep help@ so the registered text does not
// move; every other page uses info@. Two addresses on one site is only safe if
// nothing drifts between them, so the split is enforced, not trusted.
//
// WHAT IT DOES:
//   • Every phone/fax-shaped string in built HTML must be a value in site.json,
//     and the two retired numbers must be absent.
//   • Every mailto: must be site.email or site.emailLegal.
//   • Inside <main>, the three legal routes must use ONLY site.emailLegal and
//     every other route ONLY site.email. The site-wide footer is chrome, not
//     page content, and carries the public address on every page including the
//     legal ones — that is intended, so the role rule is scoped to <main>.
//
// WHAT IT DOES NOT COVER:
//   • Whether either mailbox is actually monitored, or whether the A2P campaign
//     record matches. Both are off-repo. See docs/stage2/blockers.md.
//   • Addresses inside a third-party form iframe.
import { readFileSync } from "node:fs";
import { builtPages, report } from "./lib-html-text.mjs";

const site = JSON.parse(readFileSync("_data/site.json", "utf8"));
const LEGAL_ROUTES = ["terms.html", "privacy.html", "notice-of-privacy-practices.html"];
const RETIRED = [/854[)._\s-]*209[)._\s-]*2494|2092494/i, /843[)._\s-]*884[)._\s-]*0102|8840102/i];

const allowedNumbers = new Set([site.phone, site.fax]);
const digitsOf = (s) => s.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
const allowedDigits = new Set([...allowedNumbers].map(digitsOf));
// Third-party numbers this site is REQUIRED to publish verbatim. These are not
// CoreFlow contact facts and must not be rewritten to a CoreFlow number: they
// are the HHS Office for Civil Rights complaint lines mandated by the Section
// 1557 notice and carried into the Notice of Privacy Practices. Listed by exact
// digits so a typo'd CoreFlow number still fails.
const MANDATED_EXTERNAL = new Set([
  "8003681019", // HHS OCR complaint line
  "8005377697", // HHS OCR TDD line
]);
const problems = [];

for (const { file, html } of builtPages()) {
  for (const re of RETIRED) {
    if (re.test(html)) problems.push(`${file}: retired phone/fax number present`);
  }
  // Any phone-shaped run, not just the parenthesised house style — a hardcoded
  // "854-888-9070" bypasses {{ site.* }} just as effectively as "(854) 888-9070".
  for (const m of html.matchAll(/\(?\b\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g)) {
    const d = digitsOf(m[0]);
    if (!allowedDigits.has(d) && !MANDATED_EXTERNAL.has(d)) {
      problems.push(`${file}: "${m[0]}" is not the phone or fax in _data/site.json`);
    }
  }
  // A page can show the right number over the wrong dial target.
  for (const m of html.matchAll(/href="tel:([^"]+)"/g)) {
    if (digitsOf(m[1]) !== digitsOf(site.phoneTel)) {
      problems.push(`${file}: tel: target "${m[1]}" is not site.phoneTel`);
    }
  }
  // A fax must never be dialable as a voice call.
  if (new RegExp(`href="tel:[^"]*${digitsOf(site.fax)}`).test(html)) {
    problems.push(`${file}: the fax number is a tel: link — fax must stay plain text`);
  }

  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) problems.push(`${file}: no <main> landmark found`);
  const main = mainMatch ? mainMatch[1] : "";

  const mails = [...main.matchAll(/mailto:([^"'\s>]+)/g)].map((m) => m[1]);
  const isLegal = LEGAL_ROUTES.includes(file);
  const expected = isLegal ? site.emailLegal : site.email;
  const forbidden = isLegal ? site.email : site.emailLegal;

  // Whole-page: no mailto anywhere may be an address that is not in site.json.
  for (const m of html.matchAll(/mailto:([^"'\s>]+)/g)) {
    if (m[1] !== site.email && m[1] !== site.emailLegal) {
      problems.push(`${file}: mailto "${m[1]}" is in neither site.email nor site.emailLegal`);
    }
  }
  // Role rule is <main>-only — the footer carries the public address everywhere.
  for (const addr of new Set(mails)) {
    if (addr === forbidden) {
      problems.push(
        `${file}: uses ${addr}; ${isLegal ? "legal pages must use site.emailLegal" : "non-legal pages must use site.email"} (${expected})`
      );
    }
  }

  // A bare address in prose bypasses {{ site.* }} just as a mailto does.
  for (const m of html.matchAll(/[\w.+-]+@coreflowrx\.com/g)) {
    if (m[0] !== site.email && m[0] !== site.emailLegal) {
      problems.push(`${file}: hardcoded address "${m[0]}" not in _data/site.json`);
    }
  }
}
report("Check 10 · contact facts and the info@/help@ email split", [...new Set(problems)]);
