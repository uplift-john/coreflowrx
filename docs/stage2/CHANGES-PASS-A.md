# Pass A — changes (P0 hotfix)

Branch `stage2/p0-hotfix` from `main` @ `988e2ec`. Not pushed. All 11 verify-coreflow checks PASS; 8/8 reviewers PASS.

| Item | What changed | Files |
|---|---|---|
| **A2** | Fax → **(843) 279-3185**; added `email: help@coreflowrx.com`; hours → **Mon–Fri, 8:30 AM – 4:30 PM ET**. Fixed hardcoded fax in `refer.njk` meta description. Replaced 7 hardcoded hours strings with `{{ site.hours }}`. Cleaned stale fax from `design-export/` + `docs/GHL-BUILD-CONTEXT.md`. New verify **Check 10** asserts rendered numbers match `site.json`. | `_data/site.json`, `_includes/layout.njk`, `contact/index/patients/providers/refer.njk`, `design-export/*`, `docs/GHL-BUILD-CONTEXT.md`, SKILL.md |
| **A1** | Deleted `_config.yml` (vestigial Jekyll) and `DESIGN-ENHANCEMENT-PROMPT.md` (stale). Removed its now-dead `.eleventy.js` ignore. | (deletions) |
| **A3** | `refer.njk` dead PHI form → **Formstack** Copilot iframe (title, sandbox+allow-popups, `min-height:1400px`, no lazy-load) + permanently visible fallback link. | `refer.njk` |
| **A4** | `contact`/`careers`/`payers` dead forms → **GoHighLevel** hosted iframes + visible fallback links; do-not-submit-PHI notice on contact & careers. | `contact/careers/payers.njk` |
| **A5** | Annotated tag `archive/ghl-integration-fn` at `forms/ghl-integration` tip (local); documented retirement + Formstack/GHL replacement in CLAUDE.md. Branch left intact. Verified nothing on main references `functions/api/lead.js`. | `CLAUDE.md`, git tag |
| **A6** | Split into three routes: authored **`/notice-of-privacy-practices`** (full HIPAA NPP, all 5 areas); scaffolded **`/privacy`** (Privacy Policy) and **`/terms`** (Terms + SMS) pending your drafted text. Effective Sept 1 2026; generic Privacy Officer; interim "under legal review" line; cross-linked. Counsel memo written. | `notice-of-privacy-practices.njk`, `privacy.njk`, `terms.njk`, `docs/stage2/npp-counsel-review.md` |
| **A7** | Non-discrimination: removed internal "Spanish is the minimum" note; filled Statement + Grievance procedure; English+Spanish 1557 taglines (rest pending SC top-15); interim line + Sept 1 2026. | `non-discrimination.njk` |
| **A8** | Reported all `[NAME]`/TODO placeholders (about, providers, payers) — not filled. | `docs/stage2/blockers.md` |
| **A9** | New `/thanks` — branded, one-business-day promise, urgent phone. | `thanks.njk` |
| **A10** | Referral copy rewritten to describe the real Formstack BAA flow (Option cards, HIPAA claim, PHI footnote). | `refer.njk`, `providers.njk` |
| **A11** | `_includes/physician-order-notice.njk`, included on `refer` and `providers`. | new include |
| **A12** | Vendor fax-cover PDF **NOT shipped** — it printed the wrong fax. Four dead `#fax-cover` buttons replaced with "Call for a cover sheet". Flagged for regeneration. | `refer.njk`, `providers.njk` |
| **A13** | New `_headers`: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, `X-Frame-Options`, and a CSP (Report-Only) allowlisting Formstack + GHL frames, Plausible, Google Fonts. Refactored inline nav `onclick` → external `site.js`. | `_headers`, `site.js`, `layout.njk`, `.eleventy.js` |
| **A14** | Enabled Plausible (exact tag). Added `faxNumber`/`email` + corrected hours to JSON-LD. | `layout.njk` |
| **A15** | New `/404` — branding, phone, refer CTA, nav. | `404.njk` |
| **A16** | `noindex,nofollow` on `providers` + `patients` (via new `robots` front-matter slot in layout); removed both from sitemap; PLACEHOLDER comments at testimonials; **no** robots.txt disallow. | `providers/patients.njk`, `layout.njk`, `sitemap.xml` |
| **A17** | Canonical + og:url + JSON-LD url now **extensionless**; sitemap rewritten to extensionless URLs; added `/terms`, `/notice-of-privacy-practices`, `/thanks`; removed `/providers`, `/patients`. | `layout.njk`, `sitemap.xml` |
| **A18** | `scripts/check-links.mjs` (fails on dead internal links / empty anchors); `npm run check-links` + `verify`. New verify **Check 11**. `scripts/` added to `.eleventyignore`. | `scripts/check-links.mjs`, `package.json`, `.eleventyignore`, SKILL.md |
| **A19** | Footer now carries a **Legal** nav (Privacy, Terms, NPP, Non-Discrimination, Accessibility) on every page; wrote `access-runbook.md`. No Access headers/redirects in repo. | `layout.njk`, `docs/stage2/access-runbook.md` |

**verify-coreflow is now 11 checks** (added Check 10 contact-facts, Check 11 link-integrity; refined Check 7 to precise Nunjucks detection; widened Check 8 allowlist for `js`/`_headers` + new routes).

Post-review CSS polish (3 reviewers): responsive footer grid; styled `.form-phi-notice` (amber caution), `.form-fallback` (muted), `.physician-order-notice`.
