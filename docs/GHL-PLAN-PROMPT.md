# PROMPT — paste into a new thread (attach docs/GHL-BUILD-CONTEXT.md, work in ~/Desktop/coreflow-rx)

> SUPERSEDED 2026-08-20 — the Cloudflare Pages Function path described below has been
> retired. All forms are now third-party hosted (Formstack for referrals, GoHighLevel for
> contact/careers/payers). See docs/stage2/ for current state. Do not use this document as
> build instructions.

---

Build my detailed, step-by-step project plan to take the CoreFlow Rx ×
GoHighLevel integration from its current state to live on coreflowrx.com.

Read first, in order: (1) the attached `GHL-BUILD-CONTEXT.md`, (2) the repo's
`CLAUDE.md`, (3) `docs/forms-field-map.md`, (4) the code on branch
`forms/ghl-integration` (`functions/api/lead.js`,
`scripts/ghl-setup-custom-fields.mjs`, `_includes/form-enhance.njk`, the three
wired `.njk` forms, `refer.njk`). Verify current repo state yourself (branches,
divergence from `main`, `wrangler.jsonc`) — don't trust the context file over
the repo where they disagree, and re-verify GHL API details against current
docs before any step depends on them.

Non-negotiable guardrails: no PHI to GoHighLevel (no BAA) — the referral form
stays disconnected unless I've picked a compliant option; no tokens in git or
client code; nothing ships except via `main` per CLAUDE.md's Publishing
section; verify-coreflow must pass after any copy change; flag unknowns as
TODOs — never guess.

Before writing the plan, ask me your clarifying questions in one batch (use
the question tool). At minimum I expect you'll need: which referral option
(a/b/c) I'm choosing; what should happen in GHL when each form type comes in
(who gets notified, email/SMS/task, should leads become pipeline
opportunities, auto-reply to the submitter or not); whether preview
deployments should post real leads or stay dry-run; who executes which steps
(me vs. Claude in a session vs. Jason/GHL admin); and my target go-live date.

Then produce the plan as `docs/GHL-GOLIVE-PLAN.md`, organized in phases with
ordered steps. For every step: owner, prerequisites, exact commands or
click-paths (GHL UI and Cloudflare UI/CLI as john@coreflowrx.com),
acceptance criteria ("done means…"), and rollback where it applies. Cover at
least:

1. **GHL foundation** — Private Integration token (exact scopes), Location
   ID, running `scripts/ghl-setup-custom-fields.mjs`, writing the returned
   field IDs into `docs/forms-field-map.md`, fixing any fieldKey mismatches.
2. **Code port** — Pages Function → Worker `main` module under the existing
   `wrangler.jsonc` (fetch handler for `POST /api/lead`, static assets for
   everything else), rebase/merge of `forms/ghl-integration` onto `main`
   (expect conflicts in `careers.njk`, `.gitignore`, `.eleventyignore`),
   local test matrix under `wrangler dev` matching the one already passed
   under `wrangler pages dev`.
3. **GHL automation build (UI)** — tag-triggered workflows/notifications per
   form, optional pipeline/opportunity creation, message-to-note copy (upsert
   overwrites custom fields), test contacts and how we clean them up.
4. **Referral form** — implement whichever option I choose, including any
   copy changes (which then require verify-coreflow) — or explicitly park it.
5. **Secrets & deploy** — Worker secrets via wrangler, merge to `main`,
   Workers Builds check-run, confirming live bytes on coreflowrx.com.
6. **Go-live verification & day-2** — real submission per form verified in
   GHL (tags, custom fields, notifications fire), spam/honeypot behavior in
   prod, what to monitor the first week, failure signatures (e.g. push with
   no Workers Builds check-run) and what to do about each.

End the plan with: a risk register (top 5, each with mitigation), the open
TODO list, and a one-page go-live-day checklist I can print.
