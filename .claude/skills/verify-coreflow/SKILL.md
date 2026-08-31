---
name: verify-coreflow
description: Verify CoreFlow Specialty Infusion site copy and compliance end-to-end before declaring any change done. Use after any edit to .njk pages, _data, or layout. Encodes build, accreditation, MUSC, legal, geography, voice, and render checks.
---

# Verifying CoreFlow changes

Never report a change complete based on a successful edit alone. Run **every** check below against the freshly built `_site/` output (not just the `.njk` source). If any check fails, fix the issue and rerun from Check 1 — do not hand back partially verified work.

Produce a **PASS/FAIL table by check and by page** at the end. Do not declare done until every row is PASS. The 8 pages are: `index`, `providers`, `patients`, `payers`, `refer`, `about`, `careers`, `contact`.

## Check 1 — Build
Run `npx @11ty/eleventy`. Requires zero errors and zero broken templates. The site must build to `_site/`. If the build fails, nothing else can pass — fix first.

## Check 2 — Accreditation compliance (grep built `_site/` HTML)
CoreFlow is **pre-launch and pursuing** URAC Specialty Pharmacy v5.0 and ACHC IRX-NO797 — it does **not** hold them.

- **FAIL** if any present-tense accreditation claim appears, e.g.: `dual-accredited`, `Accreditation awarded`, `Dual accreditation awarded`, `Accredited under URAC`, `URAC & ACHC Accredited` (when not qualified by "pursuing").
  - Suggested: `grep -rniE "dual-accredited|accreditation awarded|accredited under (urac|achc)|urac (&|&amp;) achc accredited" _site/` (built HTML encodes `&` as `&amp;` — always grep both forms)
- **PASS** requires, on every page that mentions accreditation:
  1. The claim is phrased as **pursuing** URAC/ACHC, **and**
  2. an anticipated timeframe of **Q4 2026** is present, **and**
  3. the exact disclaimer appears verbatim: **`Accreditation has been initiated and has not yet been awarded.`**
  - Suggested: confirm every file under `_site/` that matches `URAC|ACHC` also contains the disclaimer string.

## Check 3 — MUSC placeholder
MUSC has authorized the relationship. User-approved wording:

1. Homepage proof bar: "**Trusted by MUSC Health** — Selected as a home infusion partner by South Carolina's academic medical center." (Also approved reused as the providers callout, split as heading + text, John 2026-07-20.)
2. About narrative: "That commitment is part of why MUSC Health trusts CoreFlow as a home infusion partner and why we hold ourselves to the standards a health system of that caliber expects."
3. About callout: "A trusted MUSC Health home infusion partner" + "CoreFlow works with MUSC Health as a trusted home infusion partner. That trust reflects the clinical standards, communication, and reliability we bring to every referral." (1–3 confirmed final by John, 2026-07-13.)
4. Payers card: "MUSC Health selected CoreFlow as a home infusion partner. When an academic health system extends that trust, it sets the bar for how we handle every referral and we build to meet it." (Authored by John in Claude Design and explicitly approved for publication, 2026-07-20.)

- **FAIL** if any other specific MUSC claim ships, e.g.: `chose CoreFlow`, `Chosen by MUSC Health`, `preferred home infusion partner for MUSC Health`, or any concrete MUSC phrasing beyond the sentences above.
  - Suggested: `grep -rniE "musc" _site/` and inspect every hit.
- **PASS** requires every MUSC mention to be either (a) one of the approved sentences verbatim, or (b) the literal token **`[MUSC_RELATIONSHIP_LANGUAGE]`** where wording is still pending. As of 2026-07-20 no page uses the token (providers intro dropped it; providers callout uses sentence 1; payers card uses sentence 4) — its reappearance is fine only as a deliberate placeholder, never as a regression.

## Check 4 — Legal flags
- Every fictional/sample testimonial — on **both** the patients and providers pages — must carry a visible HTML-comment flag marking it as SAMPLE / NOT a real quote / replace before launch. FAIL if any attributed quote lacks the flag.
- No placeholder credentialing data may go live. **FAIL** on: dummy `1234567890` NPI/NCPDP values, an incomplete permit number (e.g. `Permit Add #`), or garbled/placeholder payer names (e.g. `HITS, IRN, MHITS`). These must be replaced with real, confirmed values or withheld behind "available upon request".
  - Suggested: `grep -rniE "1234567890|permit add #|HITS, IRN, MHITS" _site/`
- Staff names are withheld until CoreFlow is ready to publish them (John, 2026-07-13): every clinician/officer listing must use the `[NAME]` placeholder, keeping real credentials/titles. The CEO (Jason Clapsaddle) is the only publishable name. **FAIL** if the old fictional names appear anywhere — they were on providers, about, AND privacy (Privacy Officer), so sweep every page, not just team sections.
  - Suggested: `grep -rniE "Sarah Mitchell|Rachel Simmons" _site/`

## Check 5 — Geography guardrail
CoreFlow is filing additional state licenses; do not lock the brand to one state or name out-of-state markets publicly.

- **FAIL** if any specific out-of-state city/market is named publicly: `Charlotte`, `Chapel Hill`, `Durham`, `Augusta`, `Savannah`, `Atlanta`, etc.
- **FAIL** if the hard single-state lock language remains (e.g. `we serve one state`, `patients in 49 others`).
- **PASS**: "local", "your community", "neighbors taking care of neighbors", and factual references to serving South Carolina today are allowed.
  - Suggested: `grep -rniE "charlotte|chapel hill|durham|augusta|savannah|atlanta|49 others|serve one state" _site/`

## Check 6 — Voice
- Prescriber and payer pages **may** use clinical terminology (CRNI, URAC, ACHC IRX-NO797, USP 659/1079, cold chain).
- Patient pages must stay ~8th-grade reading level, short sentences, and keep a **human phone number visible**. FAIL if a patient page drops the phone number or drifts into jargon/bureaucratic tone.
- Overall tone across the site: expert, modern, trustworthy — never salesy, buzzword-heavy, or bureaucratic.

## Check 7 — Render integrity
For each of the 8 pages, open the built HTML and confirm:
- No leaked Nunjucks artifacts — no raw `{{` or `}}` in the output.
  - Suggested: `grep -rnE "\{\{|\}\}" _site/*.html`
- No empty required sections (hero, CTA, primary body).
- All internal links resolve to a built page (no 404 targets).
- The primary conversion action — a prescriber referral CTA — is present and links correctly on Home and Providers.

## Check 8 — No internal content published (ALLOWLIST)
Eleventy's input dir is the repo root, so **every** markdown/template file renders into `_site/` unless ignored, and internal docs must never ship. Do **not** rely on a denylist of known-bad paths — a denylist only catches leaks someone already thought of, and the next internal file postdates the list (this is exactly how `AGENTS.md` and `.agents/` leaked: they were added after the old denylist was written). Instead, **allowlist** the legitimate output and FAIL on anything else, named or not.

- **Known-good routes** (the only pages that may ship — add one here *only* when you deliberately add a page): `index about accessibility careers contact non-discrimination patients payers privacy providers refer`.
- **Allowed file types** (assets, governed by the passthrough globs in `.eleventy.js` — no per-file maintenance): `html css jpg jpeg png svg ico webp gif txt xml`.
- **FAIL** if any built `*.html` maps to a route not in the allowlist, or any file has an extension outside the allowed set. Past incident: `docs/CoreFlow-Copy-Review.md` shipped live at coreflowrx.com/docs/CoreFlow-Copy-Review/; the 2026-08-20 preflight caught `AGENTS.md` → `_site/AGENTS/` and `.agents/…/SKILL.md` → `_site/.agents/…/` one commit before first publish.
  - Suggested:
    ```sh
    PAGES="index about accessibility careers contact non-discrimination patients payers privacy providers refer"
    bad=""
    for f in $(find _site -name '*.html'); do
      route=${f#_site/}; route=${route%/index.html}; route=${route%.html}
      case " $PAGES " in *" $route "*) ;; *) bad="$bad $f" ;; esac
    done
    for f in $(find _site -type f ! -name '*.html' ! -name '*.css' ! -name '*.jpg' ! -name '*.jpeg' ! -name '*.png' ! -name '*.svg' ! -name '*.ico' ! -name '*.webp' ! -name '*.gif' ! -name '*.txt' ! -name '*.xml'); do
      bad="$bad $f"
    done
    [ -z "$bad" ] && echo PASS || echo "FAIL — unexpected:$bad"
    ```
- When a leak IS found, protect the source in **whichever** of the repo's **two** ignore mechanisms fits, and — if it's a genuinely new page — add its route to `PAGES` above, in the same commit:
  - `.eleventyignore` — for directories and some root files (currently `docs/`, `.claude/`, `.agents/`, `AGENTS.md`, `design-export/`, `CLAUDE.md`).
  - `.eleventy.js` `ignores.add(...)` — for root files (currently `DESIGN-ENHANCEMENT-PROMPT.md`, `README.md`).
  There are two lists; a file is unprotected unless it is in one of them. This split is a trap — check both.

## Check 9 — Skill copies in sync
`verify-coreflow` lives at two paths so both harnesses load it: `.claude/skills/verify-coreflow/SKILL.md` (Claude Code) and `.agents/skills/verify-coreflow/SKILL.md` (Codex / AGENTS.md convention). The `.agents/` copy MUST be a symlink to the `.claude/` canonical file, or byte-identical to it. They must never diverge silently — a stale copy means one harness enforces rules the other doesn't (this happened: the copies drifted for three weeks over a Codex→Claude rebrand before the 2026-08-20 preflight caught it).

- **FAIL** if the two files differ.
  - Suggested: `diff -q .claude/skills/verify-coreflow/SKILL.md .agents/skills/verify-coreflow/SKILL.md && echo PASS || echo FAIL`

## Output format
Print a table: rows = the 8 pages, columns = Checks 1–7, cells = PASS/FAIL (with a one-line note on any FAIL). Checks 8 and 9 are build-level, not per-page — report each as a single PASS/FAIL line beneath the table. Add a final summary line: overall PASS only if every cell **and** both build-level checks are PASS.

## When you find a recurring issue
If the same class of problem appears twice across runs, add a new grep-able check to this file so future runs catch it automatically — improve the system, not just the instance.
