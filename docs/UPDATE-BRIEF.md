# CoreFlow site update — run brief

This brief tells Claude Code how to update the CoreFlow Specialty Infusion site. The `/goal` command references this file for the full workflow; the goal itself only carries the stop condition.

## Repo facts
- Plain **static HTML** site. NO build system, NO Eleventy, NO `.njk`. Edit `.html` files directly and commit; Cloudflare Pages serves them as-is.
- Nav/header/footer are **duplicated inline in every `.html` file**. Any shared-element change (footer accreditation line, MUSC mention, phone number) MUST be applied identically across ALL `.html` files — not just one.
- **Core pages (8):** `index.html`, `providers.html`, `patients.html`, `payers.html`, `refer.html`, `about.html`, `careers.html`, `contact.html`.
- **Also present:** `accessibility.html`, `non-discrimination.html`, `privacy.html` — don't break them; include them in compliance greps.
- **Never edit or delete:** `CoreFlow_SOW-1_*.docx/.pdf`, the logo PNGs, `favicon.svg`, `robots.txt`. Update `sitemap.xml` only if a page is added/removed.

## Source of truth (read first, in order)
1. `docs/CoreFlow-Copy-Review.md` — the copywriter review. Apply its Section 3 "Rewrite Recommendations" as drop-in copy. **NOTE:** it was written against an earlier Eleventy (`.njk`) version, so its file names and line numbers do NOT match this repo — match changes by the actual current copy text in the `.html` files (find the existing sentence, replace it). Its Section 1 CEO Direction Points and Strategic Notes explain intent; use them to resolve ambiguity.
2. `docs/transcript.*` if present — the primary record of what Jason said; it wins over the review on any conflict (note discrepancies).
3. You may consult `DESIGN-ENHANCEMENT-PROMPT.md` for design intent, but do not follow it over the review.

## Workflow
1. Work on branch `copy/ceo-direction-update`. Never commit to main.
2. Apply every rewrite from the review across all 8 core `.html` pages, matching real copy strings. Preserve existing HTML structure, classes, and styling — copy + compliance pass, not a redesign.
3. Center on Jason's **three buckets** — Easy to refer / Speed to service (offer an in-home appointment within 24 hrs of insurance approval) / Close the loop (nursing note back 100% of the time) — framed on top of assumed quality ("we assume you trust the medicine; here's what makes us different"). Weave in "neighbors taking care of neighbors", the local community nurse ("might run into them at the grocery store"), the not-mail-order / not-PBM contrast, and lead the providers conditions with neuro/immunology IVIG + moving patients out of infusion-center settings into the home.
4. Apply guardrails via the **verify-coreflow** skill, sweeping EVERY `.html` file (footers repeat): accreditation = "pursuing / anticipated Q4 2026" + the exact disclaimer "Accreditation has been initiated and has not yet been awarded." everywhere it's mentioned; all specific MUSC claims replaced with the literal token `[MUSC_RELATIONSHIP_LANGUAGE]`; sample testimonials flagged on every page that has one; no live placeholder credentialing data (dummy NPI/NCPDP, incomplete permit #, garbled payer names); no specific out-of-state geographies named.
5. Run the **verify-coreflow** skill. Fix and rerun until every row is PASS. (No build — verification is grep checks plus opening each page in a browser and screenshotting it.)
6. Spawn a SEPARATE code-review agent with fresh context (`/code-review`) to adversarially review the diff against `docs/CoreFlow-Copy-Review.md` and the guardrails. Address findings, then rerun verify-coreflow.
7. Commit clearly, push the branch, open a PR titled **"Copy + compliance update from CEO direction (Jason transcript)"** with a body summarizing changes per page and calling out the accreditation / MUSC / legal fixes. Retrieve and report the Cloudflare Pages **preview URL** for the branch/PR.
8. **Design handoff:** the updated `.html` files on this branch ARE the latest version to import into Claude Design. Also copy the 8 updated core pages (+ `styles.css`) into a top-level `design-export/` folder as a clean bundle and report the exact paths. If a Claude Design / design connector or MCP is available, push the latest version directly and report what you did; otherwise leave the files in `design-export/` and confirm they're ready to import.

## Guardrails
- Do not invent facts. Anything not in the review or transcript that you're unsure about → leave a clearly-marked TODO comment and list it in the final report. Never guess MUSC wording, credentialing values, or testimonials.
- Match existing repo conventions. If you fix the same class of issue twice, add a new check to the verify-coreflow skill so future runs catch it automatically.

## Final report must include
PR link · preview URL · the verify-coreflow PASS table · one line per page on what changed · design-export paths · any TODOs the human must supply (real MUSC wording, real credentialing values, real testimonials).
