# Cloudflare Access — runbook (John performs; agent has no credentials)

Cloudflare Access is a **dashboard task**. The agent did not and will not touch the Access API. This runbook makes the repo compatible and hands you the exact steps.

## Current state (verified from repo, 2026-08-31)
- Access is **OFF** — coreflowrx.com returns HTTP 200 with no login redirect (Session 0).
- `wrangler.jsonc` declares **no** `workers.dev` route, but `CLAUDE.md`/`AGENTS.md` reference an alias `coreflowrx.john-057.workers.dev`.
- Footer now links `/privacy` and `/terms` (and the NPP + non-discrimination) on **every** page via the layout — carrier reviewers look for these.

## Before you turn Access on — required carve-outs
1. **Anonymous access to legal pages.** Carrier / A2P reviewers must fetch `/terms` and `/privacy` **without logging in**. If Access gates the whole site, add **Bypass policies** for these paths (and ideally `/notice-of-privacy-practices` and `/non-discrimination`), or SMS registration review fails.
   - Access → your application → Policies → add a **Bypass** policy with an Include rule matching `Everyone` scoped to those paths (or a path-based app).
2. **Uptime monitor service token.** The Pass B deploy/uptime monitor (B10) hits `/` and `/refer`. With Access on, those redirect to a login and the monitor reports a false outage. Create an Access **service token** and store `CF-Access-Client-Id` / `CF-Access-Client-Secret` as repo/CI secrets; add a service-token policy to the app so the monitor authenticates.
3. **workers.dev alias — CONFIRMED ENABLED (2026-09-01).** `curl -sI https://coreflowrx.john-057.workers.dev` returns **HTTP 200 and serves the full site** (same `<title>`). Access on the custom domain does **not** protect this `*.workers.dev` URL, so once Access is on it is an **unprotected bypass of the gate**. **Disable it before/when you enable Access** (Workers & Pages → coreflowrx → Settings → Domains & Routes → disable the workers.dev route). While Access is off it's only a duplicate public URL; canonical tags point to coreflowrx.com so SEO impact is minimal.

## Do NOT do in the repo
- No Access-related headers or redirects were added to the repo (Access is enforced at the edge, not in markup). Keep it that way.

## Security-headers note (related, from the CSP work in A13)
- `_site/_headers` ships security headers. The **CSP is currently `Content-Security-Policy-Report-Only`** — it reports violations but does not enforce. This is deliberate: the Formstack and GoHighLevel embeds could not be browser-verified under enforcement from the build environment.
- **To flip CSP to enforcing** (recommended after you confirm the embeds load with no console CSP violations):
  1. In a browser, load `/refer`, `/contact`, `/careers`, `/payers` and confirm each iframe renders and there are **no CSP violations** in the console.
  2. The Plausible analytics **inline** `<script>` in `layout.njk` has no `'unsafe-inline'`/hash/nonce in `script-src`. Before enforcing, either add a CSP hash for that inline block, add a nonce, or move the init into `site.js` — otherwise enforcing will silently disable analytics.
  3. Rename the header key from `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `_headers`.
- `Strict-Transport-Security` is intentionally a short `max-age=86400` to start. Once HTTPS is confirmed stable across all subdomains, raise to `31536000; includeSubDomains` (and consider preload).
