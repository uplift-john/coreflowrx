#!/usr/bin/env node
// verify-coreflow Check 17 — Every condition and drug rendered comes from _data/.
//
// RATIONALE: Greg's confirmed disease list is still coming, and the drug map is
// an unvetted intake spreadsheet. Both will be replaced wholesale. If a single
// drug or condition name is typed into a template, that replacement silently
// misses it and the page half-updates — which is exactly how a therapy CoreFlow
// cannot service stays published. The data file has to be the only source.
//
// WHAT IT DOES:
//   1. The rendered item set on each page must EQUAL the expected set from
//      _data/ — nothing extra, nothing missing.
//   2. Neither finder template may contain a literal name FROM _data/. (It
//      cannot detect a drug that is in no data file at all — typing "Tysabri"
//      as prose would pass. That is the Clinical reviewer's job, not a
//      provenance check's.)
//   3. No therapy flagged "unconfirmed" may appear anywhere in built HTML.
//      This is the guard that keeps a clinically-flagged drug off the site.
//
// WHAT IT DOES NOT COVER:
//   • Whether the data is CLINICALLY CORRECT. It checks provenance, not truth.
//     A wrong drug in the JSON renders happily. That is the Clinical/Pharmacy
//     reviewer's job and Greg's sign-off.
//   • Prose elsewhere on the site that names a therapy in a sentence — e.g. the
//     providers page "Conditions and therapies we support" section. Only the
//     two finder templates are held to the no-literals rule.
import { readFileSync } from "node:fs";
import { builtPages, report } from "./lib-html-text.mjs";

const therapies = JSON.parse(readFileSync("_data/therapies.json", "utf8"));
const conditions = JSON.parse(readFileSync("_data/conditions.json", "utf8"));
const problems = [];

// Attribute values arrive HTML-encoded ("Crohn&#39;s"); compare decoded.
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const keysIn = (html) =>
  [...html.matchAll(/data-finder-key="([^"]+)"/g)].map((m) => decode(m[1]));

function compare(label, file, expected) {
  const html = readFileSync(`_site/${file}`, "utf8");
  const rendered = new Set(keysIn(html));
  for (const name of expected) {
    if (!rendered.has(name)) problems.push(`${file}: "${name}" is in _data/ but did not render`);
  }
  for (const name of rendered) {
    if (!expected.has(name)) problems.push(`${file}: "${name}" rendered but is not in _data/`);
  }
  if (!rendered.size) problems.push(`${file}: no ${label} rendered at all`);
}

const confirmed = new Set(
  therapies.therapies.filter((t) => t.status === "confirmed").map((t) => t.name)
);
compare("therapies", "drugs-we-provide.html", confirmed);
compare("conditions", "diseases-we-treat.html", new Set(conditions.conditions.map((c) => c.name)));

// 2 — no literal names in the templates.
const allNames = [
  ...therapies.therapies.map((t) => t.name),
  ...conditions.conditions.map((c) => c.name),
];
for (const tpl of ["drugs-we-provide.njk", "diseases-we-treat.njk"]) {
  const src = readFileSync(tpl, "utf8");
  for (const name of allNames) {
    if (src.includes(name)) problems.push(`${tpl}: hardcodes "${name}" — it must come from _data/`);
  }
}

// 3 — a flagged therapy must not reach the built site anywhere.
const unconfirmed = therapies.therapies.filter((t) => t.status === "unconfirmed");
// Every built page, not a hardcoded list \u2014 a new page must not be exempt
// by virtue of being new.
for (const { file: page, html } of builtPages()) {
  for (const t of unconfirmed) {
    if (new RegExp(`\\b${t.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(html)) {
      problems.push(`${page}: publishes "${t.name}", which is flagged unconfirmed in _data/therapies.json`);
    }
  }
}

report("Check 17 · conditions and drugs come only from _data/", [...new Set(problems)]);
