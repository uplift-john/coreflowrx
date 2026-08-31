# CONTEXT — CoreFlow Rx × GoHighLevel go-live (state as of 2026-07-20)

Attach this file to any new thread planning or executing the GHL launch.
Repo: `~/Desktop/coreflow-rx` (github.com/uplift-john/coreflowrx). Read the
repo's `CLAUDE.md` too — it is the standing source of truth for build/deploy
rules and wins on any conflict with this file.

## 1. Business context

CoreFlow Specialty Infusion ("CoreFlow Rx") — home/specialty infusion pharmacy,
Mount Pleasant SC, serving South Carolina. CEO Jason Clapsaddle. Audiences:
prescribers, patients/caregivers, payers. Positioning: fast in-home infusion,
credentialed RNs, closed-loop reporting, local not-mail-order. Site:
coreflowrx.com. Phone (854) 888-9070 · fax (843) 884-0102 (single source of
truth: `_data/site.json`). Copy is legally constrained (accreditation
"pursuing, anticipated Q4 2026" + exact disclaimer; MUSC placeholder token; no
dummy regulated data) — any copy change must pass the `verify-coreflow` skill.

## 2. Hard constraint — HIPAA / PHI

- GoHighLevel has **NO signed BAA** for this account. **No PHI may ever be
  sent to GHL** or any non-BAA endpoint. This overrides everything.
- The patient referral form (`refer.njk`) collects PHI (patient name, DOB,
  ZIP, ICD-10, clinical notes). It is **intentionally disconnected**
  (`action="#"`, warning comment in source) and must stay that way until John
  picks one of the referral options in §7.
- Only three NON-PHI forms integrate with GHL: payer inquiry (`payers.njk`),
  careers (`careers.njk`), contact (`contact.njk`).

## 3. What is already built (branch `forms/ghl-integration`, pushed, NOT merged)

Built and locally tested 2026-07-13 (commit `32f05ec`; branch tip `05fa472`):

- `functions/api/lead.js` — `POST /api/lead`. Server-side validation,
  honeypot (`website` field; filled ⇒ fake success), GHL contact upsert with
  standard fields + custom fields by `key` + per-form source/tag, JSON
  `{ok:true}` or graceful errors (no internals leaked), 303 → `/thanks.html`
  for no-JS url-encoded posts, **dry-run** (logs payload, returns
  `{ok:true,dryRun:true}`) when `GHL_TOKEN`/`GHL_LOCATION_ID` unset.
- The three `.njk` forms wired to `/api/lead`: hidden honeypot, hidden `form`
  field (`payer`/`careers`/`contact`), shared progressive-enhancement script
  `_includes/form-enhance.njk` (fetch JSON, inline success/error, accessible
  status, works without JS), native validation enabled, careers "do not
  include SSN" hint preserved. New `thanks.njk` fallback page.
- `scripts/ghl-setup-custom-fields.mjs` — idempotent: lists contact custom
  fields, creates only missing, prints id/fieldKey table, warns on key
  mismatches, `--dry-run`, manual list if no token.
- `docs/forms-field-map.md` — full field inventory, PHI classification, GHL
  mappings, custom-field table (**GHL field IDs still pending** first live
  script run).
- Secrets hygiene: `.dev.vars` git-ignored, `.dev.vars.example` committed,
  no token anywhere in git or client assets.
- All local tests passed under `wrangler pages dev`: valid submits ×3
  (payload shape verified), honeypot, 422 validation, 400 unknown form,
  303 no-JS redirect, 405 GET.

## 4. ⚠ Deployment changed since the branch was built — port required

The branch was built for **Cloudflare Pages** (Pages Functions). The site has
since migrated to a **Cloudflare Workers static-assets deploy** (see repo
`CLAUDE.md` + `wrangler.jsonc` on `main`): worker `coreflowrx`, account
**john@coreflowrx.com** (not the personal gmail), serves `_site/`, "Workers
Builds" auto-deploys every push to `main`, prod coreflowrx.com. Consequences:

- The assets-only Worker runs **no server code**: `functions/api/lead.js` is a
  Pages Function and **will NOT run** under this Worker. Before shipping, the
  handler must be **ported to a Worker `main` module** (export a `fetch`
  handler routing `POST /api/lead`, `run_worker_first` or equivalent for the
  API route, `assets` binding for everything else) — or a Pages project
  restored (not the current direction).
- Secrets become **Worker secrets**: `npx wrangler secret put GHL_TOKEN` /
  `GHL_LOCATION_ID` (as john@coreflowrx.com), not `pages secret put`.
- Local test harness becomes `wrangler dev` (not `wrangler pages dev`).
- `main` is ~20 commits ahead of the branch (Workers migration, CLAUDE.md,
  verify-coreflow skill, copy edits incl. `careers.njk`, `.gitignore`/
  `.eleventyignore`, `package.json`) ⇒ expect a rebase/merge with conflicts in
  at least `careers.njk`, `.gitignore`, `.eleventyignore`.
- Only `main` deploys; the branch is parked and not live. Publishing rules =
  repo `CLAUDE.md` "Publishing" section (build → verify-coreflow → preview →
  push to main → confirm live bytes + green Workers Builds check).

## 5. GHL API facts (verified against the official spec repo 2026-07-13 — re-verify if stale)

- Base `https://services.leadconnectorhq.com`; headers `Authorization: Bearer
  <Private Integration token>` + `Version: 2021-07-28` (required).
- `POST /contacts/upsert` — scope `contacts.write`; dedupes per location
  "Allow Duplicate Contact" setting; returns `contact.id` + `new` flag;
  custom values as `customFields: [{key, field_value}]` (key form:
  `contact.<snake_name>` — endpoint works by key, no IDs needed at runtime).
- `GET|POST /locations/{locationId}/customFields` — scopes
  `locations/customFields.readonly` / `locations/customFields.write`;
  create body `{name, dataType (TEXT|LARGE_TEXT|…), model:"contact"}`;
  response has `id` + `fieldKey`. Private Integration tokens use these same
  scope names.

## 6. GHL-side state: NOTHING configured yet

Not yet done (all still needed): Private Integration token (scopes above),
Location ID retrieval, the 11 contact custom fields (list in
`docs/forms-field-map.md`; created by the script), and all UI-side automation —
notifications, workflows keyed to tags `website-payer-inquiry` /
`website-careers` / `website-contact`, optional pipeline/opportunities,
optional workflow copying message fields to notes (upsert overwrites custom
field values on repeat submissions). Source tags set by the endpoint:
"Website – Payer Inquiry" / "Website – Careers" / "Website – Contact".

## 7. Open decision — referral form (John decides; option (b) was recommended)

(a) keep referrals fax/phone only (form stays gated; eventually remove or
relabel the "Submit Online" card); (b) convert `refer.njk` to a **non-PHI
prescriber lead** ("request a referral packet / callback": prescriber+office
contact only, no patient fields) wired to the same endpoint as a fourth form
config; (c) embed a BAA-covered HIPAA intake tool (Jotform/IntakeQ-class) for
full online referrals, optionally with a non-PHI ping to GHL.

## 8. Other known flags

- Custom-field IDs pending; fieldKeys assumed `contact.<snake_name>` until the
  setup script verifies (it flags mismatches).
- `thanks.html`: intentionally not in sitemap; no noindex meta (layout has no
  per-page meta slot) — cosmetic.
- Contact form free text could incidentally carry patient-typed health
  details; optional one-line "please don't include medical details" hint —
  not added without approval.
- `.git/stale-locks/` in the local clone = renamed stale lock files from a
  sandbox permissions quirk; safe to delete.
- Never commit: `.dev.vars`, tokens, `_site/`, `node_modules/`, business docs
  (SOW/invoices). Prefer `git add <specific files>`.
