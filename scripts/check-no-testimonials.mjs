#!/usr/bin/env node
// verify-coreflow Check 15 — No fabricated testimonials or attributed quotes.
//
// RATIONALE: the providers and patients pages shipped invented quotes from
// invented people ("Margaret R., Summerville, SC"). A fabricated endorsement
// from a patient is not a copy problem, it is a misrepresentation. The old
// guard was an HTML comment asking a human to notice; this is a guard that
// cannot be talked out of it.
//
// WHAT IT DOES, over built HTML, outside `bio` blocks:
//   1. FAIL on any <blockquote> or <cite>. Neither has a legitimate use on this
//      site — the two real callouts that used <blockquote> are now .note-box.
//   2. FAIL on a dash-attributed personal name ("— Margaret R.", "— Dr. James W.").
//   3. FAIL on a quoted run of 60+ characters, which is how an unattributed
//      fabricated quote would read.
//
// WHAT IT DOES NOT COVER:
//   • A real, consented testimonial. This check cannot tell a true quote from
//      an invented one, so it forbids the shape entirely. When CoreFlow has a
//      consented quote, the check must be revisited deliberately — add the
//      markup pattern here at the same time, and record the consent.
//   • A testimonial rendered as an image, or paraphrased without quote marks
//      ("prescribers tell us we're the easiest partner they work with"). The
//      Marketing Copy and Compliance reviewers own that.
import { builtPages, visibleText, stripBlocks, report } from "./lib-html-text.mjs";

// Any dash shape (em, en, spaced hyphen, double hyphen) followed by a
// personal-name shape, with whitespace on BOTH sides of the dash so a range
// like "Mon\u2013Fri" is not an attribution. The trailing-initial rule is gone:
// "\u2014 Margaret Rodriguez, Summerville SC" is as fabricated as "\u2014 Margaret R.".
// A testimonial attribution is a dash-led PERSON, and it follows a quote.
// Requiring one of those personal-name markers keeps a role title in the
// Section 1557 notice ("\u2014 Civil Rights Coordinator") out of the results
// while still catching "\u2014 Margaret Rodriguez, Summerville SC".
const DASH = "(?:^|\\s)(?:[\\u2014\\u2013]|--|-|\\()\\s*";
const NAME = "(?:Dr\\.?\\s+)?[A-Z][A-Za-z'\u2019-]+(?:\\s+[A-Z][A-Za-z'\u2019.-]*){0,3}";
const ATTRIBUTION = new RegExp(
  DASH + NAME + "(?:" +
    "\\s+[A-Z]\\." +                       // trailing initial: \u201cMargaret R.\u201d
    "|,\\s*[A-Z][A-Za-z'\u2019 .-]{2,},\\s*[A-Z]{2}\\b" + // \u201c, Summerville, SC\u201d
    "|,\\s*[A-Z][A-Za-z'\u2019 .-]{2,}\\s+[A-Z]{2}\\b" +  // \u201c, Summerville SC\u201d
  ")",
  "g"
);
// A dash-led name sitting close after a quoted passage is an attribution even
// without a location or initial. This is the shape of every fabricated
// testimonial the site has carried.
const QUOTE_THEN_NAME = new RegExp(
  '["\\u201C][^"\\u201C\\u201D]{15,}["\\u201D][\\s\\S]{0,120}?' + DASH + NAME,
  "g"
);
const LONG_QUOTE = /["“][^"“”]{60,}["”]/g;

const problems = [];
for (const { file, html } of builtPages()) {
  const outside = stripBlocks(html, "bio");

  for (const tag of ["blockquote", "cite", "q"]) {
    if (new RegExp(`<${tag}\\b`, "i").test(outside)) {
      problems.push(`${file}: <${tag}> present — quote markup does not ship (Invariant 3)`);
    }
  }

  // Attribute text is copy too: alt/aria-label/title all render to a user.
  const attrs = [...outside.matchAll(/(?:alt|aria-label|title)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(" \u00b7 ");
  const text = visibleText(outside) + " \u00b7 " + attrs;
  for (const m of text.matchAll(ATTRIBUTION)) {
    problems.push(`${file}: dash-attributed personal name — "${m[0].trim()}"`);
  }
  for (const m of text.matchAll(QUOTE_THEN_NAME)) {
    problems.push(`${file}: quote followed by a dash-attributed name — "${m[0].slice(0, 90)}…"`);
  }
  for (const m of text.matchAll(LONG_QUOTE)) {
    problems.push(`${file}: long quoted passage — "${m[0].slice(0, 80)}…"`);
  }
}
report("Check 15 · no fabricated testimonials or attributed quotes", [...new Set(problems)]);
