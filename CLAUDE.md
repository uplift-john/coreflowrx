# CLAUDE.md — CoreFlow Rx website

Guidance for anyone (human or agent) editing this repo. Read this first.

## What this is
Marketing site for **CoreFlow Specialty Infusion ("CoreFlow Rx")** — a home / specialty
infusion pharmacy in Mount Pleasant, SC, serving South Carolina. Audiences: prescribers,
patients & caregivers, and payers. CEO: Jason Clapsaddle. Positioning: fast in-home infusion,
credentialed RNs, closed-loop clinical reporting, local (not mail-order).

Static site built with **Eleventy 3** (Nunjucks), hand-written CSS, hosted on **Cloudflare
Pages** with a Cloudflare Pages Function for form handling. No CSS/JS build pipeline.

## Commands
- Build: `npm run build` (or `npx @11ty/eleventy`) → outputs to `_site/`
- Local dev: `npm run serve` (or `eleventy --serve`)
- Forms/functions locally: `wrangler pages dev` (needs `.dev.vars`, see Forms below)

## Structure (input dir is the repo ROOT)
Eleventy's input dir is `.`, so **page templates live in the repo root** as `*.njk`:
`index, providers, patients, payers, refer, about, careers, contact` (primary 8) plus
`thanks`, and legal pages `privacy, accessibility, non-discrimination`.
- `_includes/layout.njk` — the only base layout (HTML shell, header/nav, footer, meta/OG, JSON-LD).
- `_includes/form-enhance.njk` — progressive-enhancement script; included at the bottom of the
  non-PHI form pages only.
- `_data/site.json` — the **single source of truth for contact & brand facts** (referenced as
  `site.*`): name, url, phone `(854) 888-9070`, fax, hours, address, CEO, logo, themeColor
  `#175868`, legalLine (SC BoP Permit #PH-042891). Edit facts here, not in page markup.
- Assets (hero JPGs, logos, `favicon.svg`, `styles.css`, `robots.txt`, `sitemap.xml`) live in the
  root and are passthrough-copied.
- `_site/` = build output — **never edit by hand**. `docs/`, `design-export/`, `functions/`,
  `scripts/`, `.claude/` are internal and excluded from the build via `.eleventyignore`.

### Page front-matter convention
```yaml
layout: layout.njk
title: "…"
description: "…"
activeNav: "providers"   # drives aria-current in the nav
permalink: "/providers.html"   # optional
```
Link between pages with `.html` paths (e.g. `href="refer.html"`). To add a page: create
`name.njk` in the root with this front-matter, build sections from the component classes below,
and add nav/footer links in `_includes/layout.njk` if it should appear in navigation.

## Design system
`styles.css` (single stylesheet, **v3.0 brand refresh, July 2026**) is the source of truth.
Fonts: **Playfair Display 700** (headings) + **Inter 400/600/700** (body), loaded via Google
Fonts `@import`. Mobile-first; breakpoints at 768px and 1024px.

Use the CSS custom properties in `:root` — don't hardcode colors/spacing. Palette (sampled from
the logo): Deep Teal `#175868`, Infusion Teal `#338F8D` (primary action), Spring Green `#4CA077`,
Sage `#A3CFB7`, Aqua Mist `#5BA0A6`, Warm Gold `#E8B22B` (focus/accent), Canvas `#F6F8F4`, Ink
`#1F2A2E`. **The Spring-Green→Deep-Teal gradient (`--brand-gradient`) is RESERVED for the logo —
never use it as a UI background.**

Key component classes (reuse these; don't invent parallel ones):
- Layout: `.container`/`.container--narrow`, `.section`/`.section--soft`, `.grid`/`.grid--2`/`.grid--3`, `.split`.
- Header/nav: `.site-header`, `.brand`, `.header-phone`, `.nav-toggle` (mobile), `.primary-nav`.
- Buttons: `.btn` + `.btn--primary`/`.btn--secondary`/`.btn--onDark`/`.btn--ghost`; `.cta-row`.
- Heroes: `.hero`, `.hero--split`, `.hero--photo` (+ `.hero__eyebrow/__title/__lead/__cta/__image`).
- Blocks: `.proof-bar`, `.card`/`.card--soft`, `.callout-dark`, `.value-split`, `.guarantee`, `.flow` (3-step process), `.data` tables, styled `<details>` accordions.
- Forms: `.form`, `.form__row`/`--half`, `.required`, `.hint`, `.form-status`.
- A11y: `.skip-link`, `.visually-hidden`, `:focus-visible` amber outline.

Accessibility target is **WCAG 2.1 AA** — keep the existing patterns (skip link, landmarks,
`aria-current`, accessible hamburger with `aria-expanded`, visible focus, live-region form status,
reduced-motion + print styles, descriptive alt text; decorative images get `alt=""`).

## Forms & the HIPAA guardrail (critical)
`functions/api/lead.js` is a Cloudflare Pages Function (`POST /api/lead`) that upserts contacts
into **GoHighLevel / LeadConnector**. It handles **only three NON-PHI forms**: `payer`, `careers`,
`contact` (chosen by a hidden `form` field). Secrets `GHL_TOKEN` and `GHL_LOCATION_ID` come from
`.dev.vars` locally (git-ignored) or Cloudflare Pages secrets in prod; without them it dry-runs.

**Never wire the patient referral form (`refer.njk`) to `/api/lead` or any GoHighLevel endpoint.**
GoHighLevel has **no signed BAA**, and `refer.njk` collects PHI. Referral intake must stay
phone/fax or a BAA-covered path only. This is a hard rule.

## Content & compliance rules
Copy is legally constrained. **After any content/copy change, run the `verify-coreflow` skill**
(`.claude/skills/verify-coreflow/`) — it builds and runs 8 checks against `_site/` and outputs a
PASS/FAIL table. Do not declare a copy change done on a successful edit alone. Key rules it enforces:
- **Accreditation:** URAC/ACHC must be phrased as *pursuing*, anticipated **Q4 2026**, with the exact
  disclaimer "Accreditation has been initiated and has not yet been awarded." Never claim it's held.
- **MUSC:** only approved wording about the MUSC Health home-infusion relationship; otherwise use the
  `[MUSC_RELATIONSHIP_LANGUAGE]` placeholder.
- **No dummy regulated data:** no fake NPI, permit numbers, payer names, or testimonials (sample
  testimonials must be flagged). Staff names withheld as `[NAME]` except CEO Jason Clapsaddle.
- **Geography:** South Carolina focus — no out-of-state city names, and don't hard-lock to a single
  state in a way that contradicts expansion.
- **Reading level / voice:** patient-facing pages ~8th-grade with a visible phone number; clinical
  language is fine on provider/payer pages.

## Deploy
Hosting is **Cloudflare Workers** (worker `coreflowrx`, account john@coreflowrx.com — NOT the
johnmoye82@gmail.com personal account): a static-assets Worker serving `_site/` per `wrangler.jsonc`.
Production is coreflowrx.com (alias coreflowrx.john-057.workers.dev). No GitHub Actions workflow.

**Workers Builds** builds and deploys automatically on every push to `main` (repo reconnected
2026-07-17 after a 4-day silent outage — if a push ever stops producing a "Workers Builds"
check-run on the commit, that's the failure signature; reconnect the repo in the dashboard).
Manual fallback: `npm run deploy` (builds then `npx wrangler deploy`; needs `npx wrangler login`
as john@coreflowrx.com). Feature branches are **not live** until merged to `main`.

The assets-only Worker runs no server code: `functions/api/lead.js` on the parked forms branch is a
Cloudflare *Pages* Function and will NOT run under this Worker — port it to a Worker `main` module
(or restore a Pages project) before shipping the forms work.

## Gotchas
- Input dir is the repo root, so **any stray `.md`/template renders into `_site/` unless ignored**
  — when you add a new non-site folder, add it to `.eleventyignore` in the same commit. (A past
  incident shipped an internal doc live.)
- `DESIGN-ENHANCEMENT-PROMPT.md` is **stale/historical** (old palette, wrong phone number, Unsplash
  images). Ignore it — trust `styles.css` v3.0 + `_data/site.json`.
- `_config.yml` is a vestigial Jekyll/GitHub Pages file; the real build is Eleventy. Don't rely on it.

## Publishing — how a change goes live (do this EVERY time)
This site deploys from the **`main`** branch: a change is **not live until it is committed and
pushed to `main`**, which triggers the Cloudflare build. Editing files locally does nothing on its
own, and work left on a side branch never ships. So every change runs start-to-finish:

1. Be on `main` and current: `git checkout main && git pull`.
2. Make the edit.
3. Build: `npx @11ty/eleventy` (zero errors).
4. Run the `verify-coreflow` skill — all checks PASS (mandatory for any copy touching
   accreditation, MUSC, staffing, or geography).
5. Preview the affected page.
6. Commit and push: `git add <the files you changed>` → `git commit -m "clear message"` →
   `git push origin main`.
7. Confirm the change is live on coreflowrx.com (fetch the page and check the actual bytes —
   "site is up" is not "deploy happened"; the commit should also get a green "Workers Builds"
   check-run). If the build never triggers, see the Deploy section for the manual fallback.

**Never leave a finished change uncommitted, and never do site work on a side branch expecting it
to go live — only `main` deploys.** This is what keeps the local repo, GitHub, and the live site
identical. Keep the working tree clean: do not commit business docs (SOW/invoices), secrets
(`.dev.vars`), `node_modules/`, or `_site/`. Prefer `git add <specific files>` over `git add -A`
so stray files never slip into a commit.
