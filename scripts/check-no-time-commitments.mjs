#!/usr/bin/env node
// verify-coreflow Check 13 — No specific time commitments.
//
// RATIONALE: CoreFlow cannot yet honour a named turnaround, and a published
// clock ("within one business day") is a promise a referring office will hold
// us to on day one. Speed as a quality is fine; speed as a deadline is not.
//
// WHAT IT DOES: flags any number — digit or number-word — within 5 words of
// hour / day / business day / week in the VISIBLE TEXT of every built page.
//
// WHAT IT DOES NOT COVER:
//   • Prose that means "one business day" without using those words. "We
//     confirm by close of business" would pass. Only a human catches that —
//     it is the Marketing Copy reviewer's job, not this script's.
//   • Anything outside the repo. The Formstack confirmation screen and the
//     referral auto-reply email are NOT scanned and have historically carried
//     the same promise. See docs/stage2/blockers.md.
//   • Minutes and months. Deliberate: "the infusion takes about an hour" is a
//     clinical duration, not a turnaround, and hour/day/week is where the
//     commitments actually live.
import { builtPages, visibleText, report } from "./lib-html-text.mjs";

// "business" is deliberately NOT a unit on its own: "business hours" and
// "Business address" are not commitments. "one business day" is still caught,
// because "one" falls inside the window around "day".
const UNITS = /^(hour|hours|day|days|week|weeks)$/i;
// Hyphenated compounds are split before matching, so "same-day" and "24-hour"
// become [same, day] and [24, hour] instead of one token that matched neither
// list — the two most natural phrasings of the promise being guarded.
const NUMBERS =
  /^(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|twentyfour|fortyeight|seventytwo|first|second|third|same|next|couple|few|several|single|whole|full)$/i;
const WINDOW = 5;

// The ONLY carve-out, by exact string and with a legal reason. 45 CFR Part 92
// (Section 1557) requires the grievance notice to state the period in which a
// complainant may file. That is a deadline imposed on the READER by federal
// rule, not a service turnaround CoreFlow is promising — deleting it would be
// a compliance defect. Scoped to one exact phrase so that any NEW timeframe,
// on this page or any other, still fails.
const STATUTORY_EXCEPTIONS = [
  { file: "non-discrimination.html", phrase: "within sixty (60) days" },
];

function isStatutory(file, html, neighbourhood) {
  return STATUTORY_EXCEPTIONS.some(
    (e) =>
      e.file === file &&
      html.includes(e.phrase) &&
      neighbourhood.includes("sixty") &&
      neighbourhood.includes("60")
  );
}

const problems = [];
for (const { file, html } of builtPages()) {
  // Scrub the digit runs that are never timeframes before tokenising, or a
  // phone number beside "business hours" reads as "854 ... hours".
  // Attribute text is copy too: alt/aria-label/title all render to a user.
  const attrs = [...html.matchAll(/(?:alt|aria-label|title)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(" \u00b7 ");
  const text = (visibleText(html) + " \u00b7 " + attrs)
    .replace(/\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, " ")  // phone / fax
    .replace(/\b\d{1,2}:\d{2}\b/g, " ")                            // clock times
    .replace(/\b(19|20)\d{2}\b/g, " ")                              // years
    .replace(/#?PH-\d+|Reg\s*99-43\(B\)|\b\d{9,}\b/g, " ");      // permit / NPI-shaped

  const words = text
    // Split on hyphens and dashes as well as whitespace.
    .split(/[\s\u2010-\u2015-]+/)
    .map((w) => w.replace(/^[^\w\d]+|[^\w\d]+$/g, ""))
    .filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    if (!UNITS.test(words[i])) continue;
    const lo = Math.max(0, i - WINDOW);
    const hi = Math.min(words.length, i + WINDOW + 1);
    for (let j = lo; j < hi; j++) {
      if (j !== i && NUMBERS.test(words[j])) {
        const neighbourhood = words.slice(lo, hi).join(" ");
        if (!isStatutory(file, html, neighbourhood)) {
          problems.push(
            `${file}: "${neighbourhood}" — numeric timeframe near "${words[i]}"`
          );
        }
        i = hi; // one report per neighbourhood
        break;
      }
    }
  }
}
report("Check 13 · no specific time commitments", [...new Set(problems)]);
