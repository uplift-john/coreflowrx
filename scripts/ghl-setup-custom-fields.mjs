#!/usr/bin/env node
/**
 * Idempotent GoHighLevel custom-field setup for the CoreFlow website forms.
 *
 * Lists existing contact custom fields for the location and creates only the
 * missing ones needed by the three NON-PHI forms (payer inquiry, careers,
 * contact). Prints a table of { name, fieldKey, id } to paste into
 * docs/forms-field-map.md, and warns if any actual fieldKey differs from the
 * key expected by functions/api/lead.js.
 *
 * Usage:
 *   GHL_TOKEN and GHL_LOCATION_ID from env or ./.dev.vars (git-ignored):
 *     node scripts/ghl-setup-custom-fields.mjs           # create missing fields
 *     node scripts/ghl-setup-custom-fields.mjs --dry-run # no writes, print plan
 *
 * Without a token it prints the exact field list to create manually and exits 0.
 *
 * API (verified against GoHighLevel/highlevel-api-docs, 2026-07-13):
 *   GET  /locations/{locationId}/customFields?model=contact  (locations/customFields.readonly)
 *   POST /locations/{locationId}/customFields                (locations/customFields.write)
 *   Headers: Authorization: Bearer <token>, Version: 2021-07-28
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

// Keep in sync with FORMS.custom in functions/api/lead.js and docs/forms-field-map.md
const REQUIRED_FIELDS = [
  { name: "Payer Contact Title", expectedKey: "contact.payer_contact_title", dataType: "TEXT" },
  { name: "Payer Plan Type", expectedKey: "contact.payer_plan_type", dataType: "TEXT" },
  { name: "Payer Inquiry Type", expectedKey: "contact.payer_inquiry_type", dataType: "TEXT" },
  { name: "Payer Message", expectedKey: "contact.payer_message", dataType: "LARGE_TEXT" },
  { name: "Careers Role Interest", expectedKey: "contact.careers_role_interest", dataType: "TEXT" },
  { name: "Careers License Info", expectedKey: "contact.careers_license_info", dataType: "TEXT" },
  { name: "Careers CRNI Status", expectedKey: "contact.careers_crni_status", dataType: "TEXT" },
  { name: "Careers Referral Source", expectedKey: "contact.careers_referral_source", dataType: "TEXT" },
  { name: "Careers Message", expectedKey: "contact.careers_message", dataType: "LARGE_TEXT" },
  { name: "Contact Role", expectedKey: "contact.contact_role", dataType: "TEXT" },
  { name: "Contact Message", expectedKey: "contact.contact_message", dataType: "LARGE_TEXT" },
];

function loadDevVars() {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const devVars = resolve(repoRoot, ".dev.vars");
  if (!existsSync(devVars)) return {};
  const out = {};
  for (const line of readFileSync(devVars, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const devVars = loadDevVars();
const TOKEN = process.env.GHL_TOKEN || devVars.GHL_TOKEN || "";
const LOCATION_ID = process.env.GHL_LOCATION_ID || devVars.GHL_LOCATION_ID || "";
const DRY_RUN = process.argv.includes("--dry-run");

function printManualList() {
  console.log("\nCreate these CONTACT custom fields in GHL (Settings → Custom Fields):\n");
  for (const f of REQUIRED_FIELDS) {
    console.log(`  - name: "${f.name}"   type: ${f.dataType}   expected key: ${f.expectedKey}`);
  }
  console.log(
    "\nAfter creating them, verify each fieldKey matches the expected key above;" +
      "\nif any differ, update CUSTOM_FIELD_KEYS usage in functions/api/lead.js" +
      "\nand docs/forms-field-map.md.\n"
  );
}

async function ghl(path, options = {}) {
  const resp = await fetch(`${GHL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Version: GHL_VERSION,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`GHL ${options.method || "GET"} ${path} → ${resp.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function main() {
  if (!TOKEN || !LOCATION_ID) {
    console.log("GHL_TOKEN / GHL_LOCATION_ID not set (env or .dev.vars). Skipping live API calls.");
    printManualList();
    return;
  }

  console.log(`Listing existing contact custom fields for location ${LOCATION_ID}…`);
  const listing = await ghl(`/locations/${LOCATION_ID}/customFields?model=contact`);
  const existing = listing.customFields || [];
  const byName = new Map(existing.map((f) => [f.name.trim().toLowerCase(), f]));
  const byKey = new Map(existing.map((f) => [f.fieldKey, f]));

  const results = [];
  for (const spec of REQUIRED_FIELDS) {
    const found = byKey.get(spec.expectedKey) || byName.get(spec.name.toLowerCase());
    if (found) {
      results.push({ ...spec, id: found.id, fieldKey: found.fieldKey, created: false });
      continue;
    }
    if (DRY_RUN) {
      results.push({ ...spec, id: "(would create)", fieldKey: "(would create)", created: false });
      continue;
    }
    const created = await ghl(`/locations/${LOCATION_ID}/customFields`, {
      method: "POST",
      body: JSON.stringify({ name: spec.name, dataType: spec.dataType, model: "contact" }),
    });
    const cf = created.customField || created;
    results.push({ ...spec, id: cf.id, fieldKey: cf.fieldKey, created: true });
  }

  console.log("\n| Name | fieldKey | dataType | GHL field ID | created now? |");
  console.log("|---|---|---|---|---|");
  let mismatches = 0;
  for (const r of results) {
    console.log(`| ${r.name} | \`${r.fieldKey}\` | ${r.dataType} | ${r.id} | ${r.created ? "yes" : "no"} |`);
    if (r.fieldKey !== r.expectedKey && !String(r.fieldKey).startsWith("(")) {
      mismatches++;
      console.error(`  ⚠ fieldKey mismatch: expected ${r.expectedKey}, got ${r.fieldKey}`);
    }
  }
  console.log(
    mismatches
      ? `\n⚠ ${mismatches} fieldKey mismatch(es) — update functions/api/lead.js and docs/forms-field-map.md.`
      : "\nAll fieldKeys match what functions/api/lead.js expects."
  );
  console.log("Paste the table above into docs/forms-field-map.md (GHL field ID column).");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
