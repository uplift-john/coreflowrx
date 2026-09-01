# Pass A — reviewer convergence log

Branch: `stage2/p0-hotfix` (from `main` @ `988e2ec`). Reviewers run read-only against the staged diff.

## Iteration 1 — all eight roles, in parallel

| Role | Verdict | Findings (all minor — none blocking) |
|---|---|---|
| 1 Marketing Copy | **PASS** | Contact facts all resolve via `site.*`; no accreditation claim in changed copy; testimonials remain but are noindexed + comment-gated; fax-cover-on-request flow internally consistent. |
| 2 Website & Graphic Design | **PASS** | (a) Footer grid: 5 children in a 4-col grid → "Legal" column wrapped lopsidedly. (b) `.form-phi-notice`/`.form-fallback` unstyled (render as plain paragraphs, not broken). |
| 3 Web Security & Best Practices | **PASS** | CSP frame-src covers both embed origins; sandbox minimal; no secrets; no inline handlers; noopener present; archive tag present, no live lead.js ref. Minors: inline Plausible script needs hash/nonce before CSP is enforced; HSTS max-age short (deliberate start). |
| 4 Compliance & Data Protection | **PASS** | PHI isolation verified (refer→Formstack only, zero GHL ref; contact/careers carry PHI notices); NPP has all required elements; accreditation exact; testimonial mitigation complete (noindex + out of sitemap + comments + no robots disallow); interim lines present. Minor: optional HHS OCR portal link. |
| 5 UX/UI | **PASS** | Referral path unambiguous end-to-end; 404/thanks useful; all iframes have min-height + visible fallback; no dead download buttons. Minors: unstyled `.form-fallback`/`.form-phi-notice`. |
| 6 Clinical / Pharmacy Accuracy | **PASS** | No drug/dosing/clinical-advice content added this pass. Physician-order notice clinically coherent. Drug-to-specialty map correctly deferred to Pass B. |
| 7 Accessibility (WCAG 2.1 AA) | **PASS** | Nav toggle refactor preserves button semantics + aria (improved to "true"/"false" strings); all 4 iframes have descriptive `title`; heading hierarchy clean; contrast passes. Minor: vendor iframe internals outside our control (recorded). |
| 8 Build & Deploy QA Verifier | **PASS** | Build clean; **all 11 verify-coreflow checks PASS**; link check PASS; zero `action="#"`; `_site` allowlist clean (34 files); contact facts correct; noindex/sitemap/robots correct; iframes have title+min-height; extensionless canonical/sitemap; `_site` untracked. |

**Result: convergence in iteration 1. Zero blockers, zero majors across all eight roles.**

## Orchestrator dispositions of minor findings
- **Fixed (introduced this pass, 3 roles flagged):**
  - Footer grid → responsive `repeat(3,1fr)` at ≥768px, `1.5fr repeat(4,1fr)` at ≥1024px (`styles.css:195-196`).
  - Added CSS for `.form-phi-notice` (amber caution callout), `.form-fallback` (muted helper), `.physician-order-notice` (spacing) (`styles.css`).
  - Re-ran QA after the CSS change: build clean, links PASS, no leaks, no stale numbers.
- **Deferred to John / Pass B (documented in blockers.md + access-runbook.md):**
  - CSP flip to enforcing + Plausible inline-script hash/nonce; HSTS max-age raise (Role 3).
  - Optional HHS OCR portal link (Role 4).
  - Vendor (Formstack/GHL) accessibility re-verification (Role 7).
  - Testimonial replacement before removing noindex (Roles 1, 4).

## Pass A.1 follow-up — legal pages (subset review, 2026-09-01)

Scope: `terms.njk` + `privacy.njk` published from John's carrier-review draft (`coreflow-terms-and-privacy.md`). Subset review per instruction (Design/UX/Clinical skipped — no layout or clinical content).

| Role | Verdict | Notes |
|---|---|---|
| Compliance & Data Protection | **PASS** | All A2P carrier elements present; HELP/STOP/START render bold; mobile non-sharing attestation verbatim; no contradiction (mobile-never-shared vs. HIPAA TPO-disclosure scoped to different data categories); no PHI-to-GHL; 3 docs cross-link. Minors → blockers.md (GHL/no-BAA boundary now a public commitment; off-repo form-consent + Access-bypass registration items). |
| Marketing Copy | **PASS** | Faithful to draft; contact facts correct; consistent with Formstack-BAA / Plausible-only / GHL-non-PHI; no implementation notes leaked. Minors (no change): "accreditation-as-obligation" wording is the approved draft text; on-page address blocks dropped the fax line (fax still renders in footer + JSON-LD). |
| Accessibility (WCAG 2.1 AA) | **PASS** | Heading hierarchy correct/unskipped (h1→h2→h3 SMS subsections); real lists; links have discernible text; emphasis via `<strong>` not color. Minors (optional): SMS pairs could be `<dl>`; patient callout could be a note div vs blockquote. |
| Build & Deploy QA Verifier | **PASS** | Clean build (15 pages); draft `.md` build-excluded (leak guard holds); all 11 verify-coreflow checks PASS; link check PASS; no unsubstituted placeholders; both pages render full; `_site` untracked. |

**Result: 4/4 PASS, zero blockers.** No fixes required.
