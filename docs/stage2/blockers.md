# Pass A — blockers & open items

Everything here is either awaiting your input, an off-repo action only you can perform, or a deliberate placeholder. None of it blocked the rest of Pass A from completing.

## 1. Blocked on your text (repo can't proceed without it)
- **`/privacy` (Privacy Policy) and `/terms` (Terms & Conditions) bodies.** Both pages are scaffolded, build, resolve, carry the Sept 1 2026 date and the "under legal review" interim line, and cross-link — but the actual carrier-review copy is yours to supply (A6 says do not re-author). Each file has an HTML/Nunjucks comment listing the required A2P/10DLC carrier elements (program name, message frequency, "message & data rates may apply", bold HELP/STOP, no-mobile-data-sharing attestation, support contact + hours). **Paste your drafted text into `privacy.njk` and `terms.njk`; `site.*` values are already wired.**

## 2. Off-repo actions only you can do
- **Formstack:** set the referral workflow's **post-submit redirect to `/thanks`** (the page exists at `thanks.njk`). Confirm the **BAA** is active. Confirm SMS/consent language on the Formstack form.
- **GoHighLevel:** the three widget IDs in `contact/careers/payers` are taken from the exec prompt — confirm they're the current live forms.
- **Cloudflare 404:** wire the built `/404.html` as the custom error page (Workers/Pages error handling) — see A15.
- **Cloudflare Access:** if/when you enable it, add **bypass policies for `/terms` and `/privacy`** (carrier reviewers fetch these anonymously) and a **service token** for the uptime monitor. See `access-runbook.md`.
- **workers.dev alias — was ENABLED, now DISABLED (2026-09-01); real exposure, not a duplicate-URL nit.** The custom domain had been removed specifically to take the site **down**, but `coreflowrx.john-057.workers.dev` kept serving the **full pre-Pass-A site the entire intended-down period** — including the wrong fax **(854) 209-2494**. State change: 2026-09-01 earlier it returned HTTP 200; 2026-09-01 later it returns HTTP 404 (route disabled). This is a **permanent pre-Access checklist item, not a resolved ticket** — a `wrangler deploy`, a recreated Worker, or dashboard clicks can re-enable it silently and the repo has no visibility. **Re-verify disabled before every Access enablement:** `curl -sI https://coreflowrx.john-057.workers.dev | head -1` (expect 404). See `access-runbook.md` item 3 + post-Access verification.
- **Push the archive tag:** `git push origin archive/ghl-integration-fn` (created locally; preserves the retired Pages Function branch tip).

## 3. Placeholders reported, NOT filled (per A8 — staff names withheld)
- `about.njk:43-44` — `Dr. [NAME], PharmD, RPh` (Pharmacist-in-Charge); `[NAME], BSN, RN, CRNI` (Director of Nursing).
- `providers.njk:96-97` — same two staff cards.
- These are deliberate `[NAME]` withholdings (verify-coreflow Check 4 *requires* them). Supply real names when ready to publish.
- HTML-comment TODOs (not publicly visible), left in place: `payers.njk:22` & `providers.njk:71` (MUSC wording confirmation); `payers.njk:46` (credentialing data — NPI/NCPDP/permit confirmation before launch); `providers.njk:95` (clinician names).

## 4. Contact-fact cleanups you should know about
- Fax corrected to **(843) 279-3185** everywhere (site + build + `docs/GHL-BUILD-CONTEXT.md`). Zero occurrences of the old numbers remain.
- **`design-export/` — DELETED (Pass A.1, 2026-09-01).** The stale, unreferenced, build-excluded HTML snapshot (9 files) was removed and its `.eleventyignore` line dropped in the same commit. (An old process doc, `docs/UPDATE-BRIEF.md`, still describes regenerating a `design-export/` bundle as a Claude Design handoff step — historical; ignore unless you resume that workflow.)
- **Fax cover sheet PDF: NOT shipped.** The vendor PDF at the provided URL prints the **wrong** fax `(854) 209-2494` (and wrong hours). Per A12 I did not distribute it; the "Download Cover Sheet" buttons were replaced with "Call for a cover sheet". **Regenerate the PDF with `(843) 279-3185` and `8:30 AM–4:30 PM ET`**, then the download buttons can be restored.

## 5. Security-headers follow-ups (from Role 3 review)
- CSP ships **Report-Only**. Before flipping to enforcing: verify embeds load with no console CSP violations, and give the inline Plausible snippet a hash/nonce (or move it into `site.js`) — else enforcing will silently disable analytics. HSTS max-age is a conservative 1 day to start; raise to 1 year once HTTPS is confirmed stable. Details in `access-runbook.md`.

## 6. Decisions I made (flag if you disagree)
- **Hours string:** set to `Mon–Fri, 8:30 AM – 4:30 PM ET` — I kept the already-published "Mon–Fri" day range and applied your authoritative time. If you want the time only (no day range), say so.
- **Non-discrimination taglines:** English + Spanish taglines are live; the remaining Section 1557 top-15-language taglines are marked as a comment placeholder pending the **counsel-confirmed SC top-15 list** and the official HHS OCR translations (not machine-translated).
