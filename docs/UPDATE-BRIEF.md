# CoreFlow site update — run brief

This brief tells Claude Code how to update the CoreFlow Specialty Infusion site. The `/goal` command references this file for the full workflow; the goal itself only carries the stop condition.

## Repo facts (IMPORTANT — this is an Eleventy site)
- The repo is an **Eleventy static-site generator**. Source lives in `.njk` templates + `_data/` + `_includes/`; running `npx @11ty/eleventy` builds the compiled site into `_site/`.
- **Edit the source, never the compiled output.** Do NOT hand-edit any generated `.html`. Any `.html` sitting in the working tree from an old checkout is stale — ignore it. Everything flows from `.njk` / `_data` / `_includes`.
- **Shared layout/nav/footer/head** live in `_includes/layout.njk`. **Shared values** (business name, phone, fax, address, legal line, logo) live in `_data/site.json` and are referenced as `{{ site.phone }}`, `{{ site.fax }}`, etc. Change a shared value ONCE in `site.json` or `layout.njk` — do not duplicate it per page, and never hard-code a phone number in body copy.
- The remote `main` recently received a "design refresh from Claude Design," so the live files may differ from any older copy. **Always read the current `.njk` file before editing** and match by the actual current copy text.
- **Core pages (8):** `index.njk`, `providers.njk`, `patients.njk`, `payers.njk`, `refer.njk`, `about.njk`, `careers.njk`, `contact.njk`.
- **Also present:** `accessibility.njk`, `non-discrimination.njk`, `privacy.njk` — don't break them.
- **Never edit or delete:** `CoreFlow_SOW-1_*.docx/.pdf`, logo assets, `favicon.svg`, `robots.txt`, `.eleventy.js`, `package.json`, `package-lock.json`. Update `sitemap.xml` only if a page is added/removed.

## Source of truth (read first, in order)
1. `docs/CoreFlow-Copy-Review.md` — the copywriter review. Apply its Section 3 "Rewrite Recommendations" as drop-in copy. It was written against the `.njk` source, so its file names match this repo; its **line numbers are approximate** (the design refresh may have shifted them) — match by the actual current copy text, not by line number. Section 1 CEO Direction Points and Strategic Notes explain intent; use them to resolve ambiguity.
2. `docs/transcript.*` if present — the primary record of what Jason said; it wins over the review on any conflict (note discrepancies). (If absent, the review is the standing source of truth.)
3. You may consult `DESIGN-ENHANCEMENT-PROMPT.md` for design intent, but do not follow it over the review.

## Workflow
1. Work on branch `copy/ceo-direction-update`. Never commit to main.
2. Run `npm install` if needed, then apply every rewrite from the review across the 8 core `.njk` pages (and `_data/site.json` / `_includes/layout.njk` where a shared value or shared element is involved). Match real current copy strings. Preserve existing structure, classes, and styling — copy + compliance pass, not a redesign. Do not reintroduce old phone numbers or the old logo; leave `site.json` values as they are on current `main` unless the review explicitly calls for a copy change.
3. Center on Jason's **three buckets** — Easy to refer / Speed to service (offer an in-home appointment within 24 hrs of insurance approval) / Close the loop (nursing note back 100% of the time) — framed on top of assumed quality ("we assume you trust the medicine; here's what makes us different"). Weave in "neighbors taking care of neighbors", the local community nurse ("might run into them at the grocery store"), the not-mail-order / not-PBM contrast, and lead the providers conditions with neuro/immunology IVIG + moving patients out of infusion-center settings into the home.
4. Apply guardrails via the **verify-coreflow** skill: accreditation = "pursuing / anticipated Q4 2026" + the exact disclaimer "Accreditation has been initiated and has not yet been awarded." everywhere it's mentioned; all specific MUSC claims replaced with the literal token `[MUSC_RELATIONSHIP_LANGUAGE]`; sample testimonials flagged on every page that has one; no live placeholder credentialing data (dummy NPI/NCPDP, incomplete permit #, garbled payer names); no specific out-of-state geographies named. Because shared elements are centralized, fixing them once in `layout.njk`/`site.json` propagates — but still confirm zero stragglers in the built `_site/` output.
5. Build with `npx @11ty/eleventy` and run the **verify-coreflow** skill against `_site/`. Fix and rerun until the build is clean and every check is PASS. Open each built page in a browser and screenshot it.
6. Spawn a SEPARATE code-review agent with fresh context (`/code-review`) to adversarially review the diff against `docs/CoreFlow-Copy-Review.md` and the guardrails. Address findings, then rebuild + rerun verify-coreflow.
7. Commit clearly, push the branch, open a PR titled **"Copy + compliance update from CEO direction (Jason transcript)"** with a body summarizing changes per page and calling out the accreditation / MUSC / legal fixes. Retrieve and report the Cloudflare Pages **preview URL** for the branch/PR.
8. **Design handoff:** build the site and copy the compiled HTML for the 8 core pages (+ CSS) from `_site/` into a top-level `design-export/` folder as a clean bundle; report the exact paths. This is what gets imported into Claude Design. If a Claude Design / design connector or MCP is available, push the latest version directly and report what you did; otherwise confirm the files are ready to import.

## Guardrails
- Do not invent facts. Anything not in the review or transcript that you're unsure about → leave a clearly-marked TODO and list it in the final report. Never guess MUSC wording, credentialing values, or testimonials.
- Match existing repo conventions. If you fix the same class of issue twice, add a new check to the verify-coreflow skill so future runs catch it automatically.

## Final report must include
PR link · preview URL · the verify-coreflow PASS table · one line per page on what changed · design-export paths · any TODOs the human must supply (real MUSC wording, real credentialing values, real testimonials).
