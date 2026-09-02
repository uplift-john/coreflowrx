# Pass A — blockers & open items

Everything here is either awaiting your input, an off-repo action only you can perform, or a deliberate placeholder. None of it blocked the rest of Pass A from completing.

## 1. Legal pages — DONE (Pass A.1 follow-up, 2026-09-01)
- **`/privacy` (Privacy Policy) and `/terms` (Terms & Conditions)** are published from your drafted carrier-review text (`coreflow-terms-and-privacy.md`, now build-excluded via `.eleventyignore`). `[MAIN_PHONE]`/`[SUPPORT_EMAIL]`/`[BUSINESS_ADDRESS]` substituted from `site.json`; hours stated in the SMS support section; Sept 1 2026 date + interim line kept; HELP/STOP/START render bold; all A2P elements present (program name/description, frequency, rates, HELP, STOP, non-marketing, mobile non-sharing attestation). The three legal docs cross-link and are scope-consistent (mobile non-sharing vs. HIPAA TPO disclosure are different data categories).

### Carrier-registration follow-ups from the draft's implementation notes (YOU / off-repo — registration fails without these)
- **Consent language on every form that captures a mobile number** (draft note #2) — this is a **Formstack build item, not a website item**. Add to the Formstack referral workflow (and any intake/contact form) a non-pre-checked consent line: *"By providing a mobile number, you agree to receive text messages from CoreFlow Rx about appointments and referral status. Message and data rates may apply. Message frequency varies. Reply STOP to opt out or HELP for help. See our Terms and Privacy Policy."* Carrier reviewers check the **form**, not just the policy page.
- **`/terms` + `/privacy` must return 200 to anonymous requests at registration time** (draft note #3) — if Access is on, add Access **Bypass** policies for both, or register before enabling Access. Already tracked in `access-runbook.md`.
- **Publish order** (draft note #4): pages live → consent language on the forms → submit the campaign.
- **Counsel review** (draft note #5): have counsel confirm (a) whether appointment reminders implicate TCPA prior-express-consent beyond the HIPAA treatment exemption; (b) retention periods vs. SC Board of Pharmacy requirements; (c) that the §4 service-provider carve-out matches your actual vendor set (Formstack, WeInfuse, GoHighLevel, BrightStar Care); (d) specifically — **GoHighLevel has no BAA; Privacy §4 is written to be true only if no PHI reaches it.** That boundary is a `CLAUDE.md` rule and is now a **public representation** — the no-PHI-to-GHL guardrail must hold.
- **Live-verify `/terms` after deploy** resolves at exactly `coreflowrx.com/terms` (built as `terms.html`; serves extensionless via the confirmed redirect pattern).

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
- **Fax cover sheet PDF — SHIPPED (corrected version, Pass A.1).** The first vendor PDF printed the wrong fax `(854) 209-2494` and was withheld; a second one printed the correct fax but had a **layout defect** (physician-order box overlapping the confidentiality notice — invisible to text extraction). The corrected file, pinned by SHA-256 `f3ac2e3e44d83459887253f354255f0430e43787ab3f1b3610fe57674599bc3b`, is now shipped and wired to all four download buttons. Guarded by verify-coreflow **Check 12** (hash pin primary + geometry secondary).
- **⚠ UNIDENTIFIED document in the pipeline: `~/Downloads/Coreflow fax cover sheet update.pdf`** (SHA-256 `eb27f6efd971f80bed97da6ed826f0e699917e463626f8cbebb876a312ed1b93`, ~369 KB, timestamped newest at 14:31). Its hash matches **neither** the defective nor the corrected cover sheet, and John confirmed he produced **only two** cover sheets. **Do not ship it; do not treat newest-by-timestamp as newest-by-intent.** Someone should identify what this file is before any future cover-sheet swap picks it up by mistake.

## 5. Security-headers follow-ups (from Role 3 review)
- CSP ships **Report-Only**. Before flipping to enforcing: verify embeds load with no console CSP violations, and give the inline Plausible snippet a hash/nonce (or move it into `site.js`) — else enforcing will silently disable analytics. HSTS max-age is a conservative 1 day to start; raise to 1 year once HTTPS is confirmed stable. Details in `access-runbook.md`.

## 6. Decisions I made (flag if you disagree)
- **Hours string:** set to `Mon–Fri, 8:30 AM – 4:30 PM ET` — I kept the already-published "Mon–Fri" day range and applied your authoritative time. If you want the time only (no day range), say so.
- **Non-discrimination taglines:** English + Spanish taglines are live; the remaining Section 1557 top-15-language taglines are marked as a comment placeholder pending the **counsel-confirmed SC top-15 list** and the official HHS OCR translations (not machine-translated).
