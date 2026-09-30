# Post-review pass — what changed and why

**Branch:** `feature/post-review-2026-09` · **Date:** 2026-09-29
**Not pushed, not deployed.** Nothing is live until this is merged to `main`.

Read `blockers.md` first if you only read one file — it carries every decision waiting
on you or on Greg.

---

## Part 1 — Invariants (global removals)

These are properties the whole site now has, each backed by a new `verify-coreflow`
check so it cannot silently regress.

### Invariant 1 — No specific time commitments

Every named turnaround is gone. The site now speaks to responsiveness, never to a clock.

| Where | Was | Now |
|---|---|---|
| `index` hero | "start care within 24 hours of approval" | "deliver infusion care in the home" |
| `index` proof bar | "1-Business-Day Referral Confirmation" | *(bar deleted — see Part 3)* |
| `index` ×3 | "within one business day", "within 24 hours of insurance approval" ×2 | "we confirm we have it", "we move fast on authorizations", "as early as coverage allows" |
| `providers` | headings "Day 1 –", "Days 1–3 –", "Days 2–5 –" | "Acknowledgment", "Insurance & Authorization", "Medication & Scheduling" |
| `providers` ×4 | "within one business day" ×2, "within 24 hours of each visit", "within 24 hours of insurance approval" | "promptly", "we don't sit on referrals" |
| `refer` | "We confirm receipt within one business day" (page + meta) | "We acknowledge every referral promptly" |
| `thanks` | "we confirm receipt within one business day" (page + meta) | "we acknowledge receipt promptly — you won't be left wondering" |
| `payers`, `contact`, `accessibility` | "within two business days" ×3 | "promptly" |
| `patients` | "Usually within a day or two", "within a day of your insurance being approved" | removed; "as soon as your insurance is approved" |
| `patients` FAQ | "Some infusions take 30 minutes. Others take a few hours." | "Some are short and some are longer. Your nurse will tell you what to expect." |

Also caught by review, because a regex cannot: **"without delay"** on `providers` (a term
of art meaning *immediately* — harder than the "promptly" used everywhere else),
**"confirm on the spot"** on the new conditions page, and **"We call you quickly"** on
`patients`. All three are gone.

⚠ **This promise very likely still lives outside the repo** — the Formstack confirmation
screen and any auto-reply email. Only John can fix that. See `blockers.md` §6.

### Invariant 2 — MUSC only in individual employment history

**Zero MUSC references remain anywhere** — not in any `.njk`, not in `_data/`, not in the
build, not in an HTML comment. Removed from five places: the homepage proof bar, the
`providers` callout section, the `payers` "Health system selection" card, the `about`
narrative sentence, and the `about` callout — plus the two `<!-- TODO: replace token with
final approved MUSC wording -->` comments.

**The old check was inverted and must not be restored.** It whitelisted four approved
*relationship* sentences plus a `[MUSC_RELATIONSHIP_LANGUAGE]` token. Both are gone from
`SKILL.md`. MUSC is now permitted **only** inside an element whose class list contains
`bio`, describing where a named person previously worked.

### Invariant 3 — No fabricated testimonials

Two invented quotes deleted entirely — copy, markup and the flagging comments:

- `providers` — "Dr. James W., Rheumatology, Charleston, SC"
- `patients` — "Margaret R., Summerville, SC"

No "testimonials coming soon" placeholder replaced them; the sections are gone.

Two **legitimate non-quotes** that happened to use `<blockquote>` were moved to a new
`.note-box` so the check can stay absolute with no allowlist: the Privacy Policy's patient
notice, and the patients-page "one way to ask your doctor" script (its quote marks were
also removed so no long-quote pattern survives). A third — a paraphrase of what a nursing
note says, in quotes on `providers` — was unquoted.

→ **The `noindex` that contained this risk is now removed** (John, 2026-09-29). Both pages are indexed and in `sitemap.xml`; Check 15 is what holds the line instead.

### Invariant 4 — Nursing language

**4a — `CRNI` is gone sitewide**, including from the two Director of Nursing listings
(`[NAME], BSN, RN, CRNI` → `[NAME], BSN, RN`). `SKILL.md` Check 6 used to list CRNI as
permitted clinical terminology; that was stale and is corrected.

**4b — no phrasing implying the nurses are CoreFlow employees.** Each instance was read
and rewritten in context rather than find-and-replaced:

| Where | Was | Now |
|---|---|---|
| `index` hero alt | "A CoreFlow nurse starts a home infusion" | "An infusion nurse starts a home infusion" |
| `providers` | "Our CRNI-eligible registered nurses administer therapy" | "Experienced infusion nurses administer therapy" |
| `providers` | "A CoreFlow RN administers therapy" | "The infusion nurse assigned to your patient administers therapy" |
| `providers` | "Every nurse meets CoreFlow's clinical standards (CRNI-eligible…)" | "Every nurse must clear CoreFlow's credentialing and competency requirements" |
| `payers` | "delivered by CoreFlow-credentialed RNs" | "administered by credentialed registered nurses contracted as nursing partners" |
| `patients` | "Every CoreFlow nurse is credentialed" / "Our nurses are trained" | "Every nurse who cares for you is credentialed" / "The nursing team caring for you" |
| `patients` | "Your CoreFlow nurse arrives at your home" | "Your infusion nurse arrives at your home" |
| `about` | "dispatch credentialed registered nurses" | "coordinate credentialed nursing partners who administer therapy" |
| `about` | "Credentialed, supervised nurses." | "Credentialed nursing partners working under our clinical protocols." |
| `about` | "a named clinical team, credentialed nurses who live and work…" | "…credentialed nursing partners who live and work…" |
| `careers` | title "RN & Pharmacist **Jobs** in SC"; "Join the CoreFlow team" | "Careers & Nursing Partnerships"; "contract opportunities for infusion nursing partners" |
| `careers` | "Whether you're full-time or contract… competitive pay" | "Contract assignments that fit your schedule, competitive rates" |
| `index`/`patients` | "CoreFlow **sends** a registered nurse" | "CoreFlow **arranges for** a registered nurse to come" |

Deliberately kept: "CoreFlow nursing partner", "our nursing partners", "your nurse",
"CoreFlow's clinical standards" — standards do belong to CoreFlow; nurses do not.

---

## Part 2 — Navigation and header

**Nav is now:** For Prescribers · Diseases We Treat · Drugs We Provide · For Patients ·
About · Contact · **Refer a Patient** (CTA).

"For Payers" and "Careers" left the primary nav. **Neither page is orphaned:** Payers is
linked in the footer under Prescribers (relabelled "For Payers & Health Plans") and stays
in `sitemap.xml`; Careers is in the footer and now has a dedicated "Work with us" block
on the About page, not just a bare button.

### Header contact block

Phone (`tel:`), fax (**plain text — a fax must never be dialled as a voice call**) and
email (`mailto:`), all from `_data/site.json`. Nothing is hardcoded. The logo went from
40px to 46–52px depending on viewport, with `width`/`height` attributes for CLS.

**Measured in a real browser at each breakpoint** (not reasoned about):

| Width | Header | Layout | Overflow |
|---|---|---|---|
| **320px** | 69px, single row | logo 38px, "Call" pill, toggle | none |
| **375px** | 71px, single row | logo 46px (168px wide), Call pill, 44px toggle — 16px gutters, nothing overlaps | none |
| **768px** | 79px, single row | all three contact items, icon + value | none |
| **1440px** | 118px, two rows | row 1 brand + three labelled contact items; row 2 nav + Refer CTA | none |

**The 375px decision, and why:** phone only, as a tap-to-call pill showing a phone icon
and the word "Call". The number is `position:absolute` visually-hidden but **in the
accessible name** — the link announces "Call (854) 888-9070" and the `tel:` href carries
it, so one tap dials. Fax and email are `display:none` below 768px and remain in the
footer and on `/contact`, so no information is lost at any viewport.

Showing all three at 375px costs about 117px the row does not have. The header wraps
(`flex-wrap` + `order:3` on the nav), so the toggle would drop to a second row and double
the sticky header — it would not vanish. A first attempt at a comment in `styles.css`
stated this incorrectly as "pushes the nav toggle off-screen"; review caught it and the
comment now records the real behaviour, because the next editor will reason from it.

**Two rows at ≥1024px** is forced, not chosen: row 1 needs ~830px and row 2 ~868px, so
1698px of content cannot fit one 1148px row. Review flagged the resulting 142px sticky
header as too tall; dropping the CTA padding and stepping the desktop logo to 52px
brought it to **118px**.

A pre-existing bug surfaced while measuring: `.site-header__inner` set
`padding: var(--space-3) 0`, which overrode `.container`'s horizontal padding (same
specificity, declared later). **The header had no side gutter at all** — the logo sat at
x=0 and the toggle touched the right edge. Fixed.

### ⚠ Email — resolved by John, 2026-09-29

`site.email` = **info@** (public) and a new `site.emailLegal` = **help@** (Terms §3,
Privacy, Notice of Privacy Practices), so the **A2P/10DLC registered text does not move**.
Check 10 enforces the split by route, scoped to `<main>` — the site-wide footer carries
the public address on every page including the legal ones, which is intended.

**Two mailboxes now need staffing, and the help@ one will receive PHI.** See
`blockers.md` §5.

---

## Part 3 — The homepage proof bar

Deleted outright — markup **and** its CSS, not hidden. It carried the MUSC claim and the
1-business-day promise anyway.

**What the removal exposed:** the hero then sat against a decorative full-bleed image
strip. Spacing was adjusted first, but two independent reviewers found the real problem:
`hero-home.jpg` is the same photo shoot as the hero image directly above it, cropped
5.14:1 so both faces are sliced through, under a hardcoded `rgba(70,126,154,…)` wash that
is not in the palette. It is `aria-hidden` with `alt=""` — zero information — while
pushing the first substantive content ~250px down the highest-traffic page.

**So the strip was deleted too**, and the hero now flows into the value-split cards
directly. `.image-strip` remains for `patients.njk`, where it separates two text zones.

---

## Part 4 — The two new pages

### Architecture

Everything renders from `_data/`. **No drug or condition name is hardcoded in a
template** — Check 17 enforces it, and caught exactly that on its first run (the
condition-search hint named two conditions).

- `_data/therapies.json` — 25 entries; **13 confirmed, 12 held back**.
- `_data/conditions.json` — 16 seed conditions, all `status: "seed"`.
- `finder.js` — dependency-free, no build step.
- `_includes/referral-checklist.njk` — shared referral-documentation checklist.

**Status is the publication switch.** `unconfirmed` renders nowhere and is absent from the
search index; flip it to `confirmed` and it publishes, with no template change.

**IVIG brand products drop in without a rebuild:** every therapy has an empty
`products: []` array that renders as sub-items when populated.

### Findability

Type-ahead over name, generic, aliases, drug class and specialty; plus specialty chips.
Progressive enhancement is real: the search field carries `hidden` in the markup and only
JS reveals it, so a no-JS visitor is never shown a dead control, and the chips are
ordinary anchors to real per-specialty sections until JS upgrades them to in-place
filters.

**Verified in a browser, in all four states:** unfiltered 29 cards; "remicade" → exactly
3 cards in 3 groups with the Clear button appearing; no-match → 0 cards plus the
call-to-confirm box; the Pulmonology chip → only that group, showing its "we're not
listing these yet" block, with the generic empty box correctly suppressed.

**A bug worth recording:** the filter did not actually filter. `[hidden]` is a
*normal author-origin-losing* UA rule, so `.therapy{display:flex}` beat it. Filtering
"remicade" left **21 of 35 cards on screen** under a status line reading "Showing 3 of
16". Three reviewers found it independently; one line (`[hidden]{display:none!important}`)
fixed all of it, including the permanently-visible Clear button and the no-JS search form.

### Clinical posture — what publishes and what doesn't

Where a drug was flagged and unresolved, the rule was: render the specialty, omit the
disputed drug, never guess. **Twelve entries are held back** — see `blockers.md` §3 for
each one and why.

Changes to the data were **only ever removals**: three drugs moved to `unconfirmed`
(Vyvgart Hytrulo, Soliris, Ultomiris), two wrong specialty tags dropped (Rituxan and IVIG
under gastroenterology), three seed conditions removed (Guillain-Barré on patient-safety
grounds, plus ITP and Alpha-1). **Nothing was added.**

Two specialties (Immunology, Pulmonology) consequently render with no therapies. They show
a neutral "We're not listing {specialty} therapies yet — tell us the drug and we'll answer
straight away" card with a call button, deliberately **not** amber, because amber is the
alert colour and these are real specialties. An earlier draft asserted "{Specialty} is one
of the specialties we serve" — withdrawn as an unverified affirmative claim.

**The single highest-value open question is `blockers.md` §1:** Immunology is empty
because IVIG carries no `immunology` tag. Two reviewers said to add it. It was not added —
adding a specialty tag asserts a clinical fact, and the standing instruction was to flag
this to Greg rather than fix it. **It is a one-word change when he confirms.**

### The conditions page is scaffolding, and says so

Three reviewers blocked an earlier draft for reading as settled. It now: carries the
"under clinical review" notice **inside the hero, above the list**; uses "conditions
prescribers ask us about" rather than "supports"; gives every condition a **"Call to
confirm →"** (`tel:`) action rather than a one-click referral; is `noindex` and absent
from `sitemap.xml`; and is grouped by specialty with real anchors.

The template comment records the exit criteria so the next person doesn't reconstruct them.

---

## Part 5 — Cross-site CTAs

Two entry points, both inline text rather than buttons, both at a natural decision point:

- **`index`** — inside the "For Prescribers" value-split card, phrased as the question
  the reader is actually asking: *"Checking whether we can take a patient? Search the
  drugs we provide for a straight answer, or browse the conditions we're confirming."*
- **`providers`** — folded into the lead of "Conditions and therapies we support".

A first attempt put a two-button `.cta-row` on `providers`, taking that page to **nine
buttons in `<main>>`** with the row landing 12 lines above the closing CTA. Review called
it a wall; it became one sentence. The wording deliberately distinguishes the two pages —
drugs gives "a straight answer", conditions is "what we're confirming" — so the conditions
page does not over-promise before a prescriber clicks.

---

## Part 6 — Checks added

`verify-coreflow` goes from **12 to 17 checks**. `npm run verify` runs the build plus
every scripted check and exits non-zero on the first failure. One script per check; none
merged.

| # | Check | Script |
|---|---|---|
| 13 | No specific time commitments | `check-no-time-commitments.mjs` |
| 14 | No MUSC outside bio blocks *(replaces the approved-sentence check)* | `check-musc-bio-only.mjs` |
| 15 | No fabricated testimonials / attributed quotes | `check-no-testimonials.mjs` |
| 16 | No CRNI; no CoreFlow-possessive nursing language | `check-nursing-language.mjs` |
| 17 | Conditions and drugs come only from `_data/` | `check-data-driven.mjs` |

Existing checks 8 and 10 were mechanised (`check-leak-allowlist.mjs`,
`check-contact-facts.mjs`) and strengthened: Check 10 now enforces the info@/help@ split
and validates every `tel:` target; Check 8 now allowlists **images by exact filename**,
closing the same hole the PDF rule closes — `.eleventy.js` globs `*.png`/`*.jpg`, so a
screenshot of an insurance card left at the repo root would have shipped silently.

Every check records **what it does not cover**, in the script and in `SKILL.md`. The most
important: Check 13 cannot see the Formstack confirmation screen, and cannot catch prose
that *means* a business day without the words.

### Guard hardening after adversarial review

The checks were attacked, and several had holes:

- **`stripBlocks()` could be silently disabled.** A void element matching the class
  (`<img class="bio-photo">`) sent the depth scan hunting a `</img>` that can never exist;
  it fell through and returned everything *before* the tag, discarding the rest of the
  document. One such tag in a header would have made **both** the MUSC and testimonial
  guards pass on a page carrying an explicit MUSC claim and a fabricated quote. Void
  elements are now handled, and genuinely unbalanced markup **throws** rather than
  scanning a truncated document.
- `same-day` and `24-hour` tokenised as single words matching nothing → hyphens are now
  split on.
- `&#8220;`-encoded curly quotes evaded the long-quote check → all numeric entities are
  decoded, `&amp;` last.
- "— Margaret Rodriguez, Summerville SC" (no trailing initial) passed → the attribution
  pattern was widened, then narrowed to model a *testimonial* specifically so a role
  title in the Section 1557 notice isn't a false positive.
- "our credentialed infusion nurses" and "our RNs" passed → intervening words allowed,
  and `alt`/`aria-label`/`title` text is now scanned.
- Check 17 scanned a hardcoded 10-page list → iterates every built page.
- Check 10 matched only `(8xx) xxx-xxxx` → any phone shape, plus `tel:` target validation
  and a rule that the fax must never be a `tel:` link.

**All verified by injecting six violations into a copy of the build and confirming each
is caught.** Two documented carve-outs exist, both legal and both scoped to exact
strings: the 45 CFR §92 grievance period, and the two HHS OCR complaint numbers.

---

## Also fixed, found by review

**Compliance:** `payers.njk`'s GoHighLevel form was the **only** one with no PHI notice —
on a page inviting utilization reviewers to write in about a specific member, into a
vendor with **no BAA**. Added. And `refer.njk` — the PHI page — offered a plain `mailto:`
in its Clinical Intake card with no caveat; the address was removed and replaced with an
explicit "don't send patient information by email" notice.

**Security:** the inline Plausible bootstrap moved into `site.js`. Built pages now carry
**zero inline `<script>` blocks**, so the planned enforcing CSP no longer needs
`'unsafe-inline'` — the last blocker to flipping it is cleared. Wildcard vendor
subdomains and unused `form-action` origins dropped.

**Accessibility:** `--color-gray-500` darkened (#6d7a72 → #5A6660) because it failed AA at
4.49:1 on white and 4.20:1 on Canvas; `.btn--primary` re-filled to Teal-600 (white on
#338F8D was 3.85:1); the amber focus ring gained a navy outer ring (1.94:1 on white);
note-box links darkened to navy; the footer legal line was 1.78:1 and is now readable.
Card titles became `<h3>`, the homepage `h1 → h3` skip was fixed, chips became real
toggle buttons with `aria-pressed` and Space support, card actions became 44px tap
targets (were 206×17), and results announcements now name the active specialty.

**Marketing:** unsupported claims removed — "better than anyone else in the space",
"100% of the time", "choose us again and again", "Better outcomes at home" (in the
homepage meta description), "Unlike national pharmacy networks…", "Referrals arrive
complete more often than not", "You will never be alone during your treatment", and
"names you can look up" (which sat directly above two literal `[NAME]` placeholders).
`refer.njk` claimed an after-hours triage path that the published hours contradict —
now routes to business hours and 911.

---

## John's answers, applied 2026-09-29

Six items came back after the review rounds. All applied and verified.

| Answer | What changed |
|---|---|
| **Add immunology to IVIG — yes** | `_data/therapies.json`. Immunology now renders IVIG instead of "we're not listing these yet". Only Pulmonology remains pending. |
| **Both mailboxes are live and monitored** | §5 closed. The BAA on help@ — which receives PHI via the NPP — is the one sub-item left. |
| **There is an on-call phone** | `refer.njk` restored an accurate after-hours path: "call … to reach our on-call line. For a medical emergency, call 911." No clock, no claim about who answers. |
| **Drop the noindex — yes** | `robots` removed from `providers.njk` and `patients.njk`; both added to `sitemap.xml`; the obsolete explanatory comments deleted. |
| **No permit yet — say we've applied** | Six locations, plus a new check. See below. |
| **Remove hydration & supportive care, and hematology** | Both cards deleted from `providers.njk`. This also removed the hyperemesis gravidarum claim the clinical reviewer had escalated by name. |

### The permit answer was bigger than the number

Asking for "applied for" surfaced that the site claimed the licence in **four affirmative
forms at once**, not just via the number:

- `index.njk` — "**We hold** a South Carolina Board of Pharmacy Resident Pharmacy Permit"
- `about.njk` — "Resident Pharmacy Permit **issued** under Reg 99-43(B)"
- `payers.njk` — "**issued by** the SC Board of Pharmacy", plus a hero calling CoreFlow
  "a **South Carolina-licensed** specialty infusion pharmacy"
- the site-wide footer — "**Licensed by** the South Carolina Board of Pharmacy · Permit
  **#PH-042891**"

All six locations now state that the application is submitted and the permit is not yet
issued. **New Check 18** guards it: no claim of holding a permit or pharmacy licence, no
permit number, no `#PH-042891`, and any page whose `<main>` raises the Resident Pharmacy
Permit must say it is not yet issued. Individual licences — the Pharmacist-in-Charge,
nurses, prescribers — are deliberately allowed, since a person can be licensed while the
pharmacy's permit is pending. Checks go from 17 to **18**.

### Placeholders, per "build the skeleton"

Everything needing Greg is now a marked placeholder rather than a blocker:

- **IVIG products** — renders the generic entry the intake map supplied, plus a visible
  note: *"Specific immunoglobulin products are still being confirmed. If you need a
  particular brand, call us and we'll check availability before you refer."* It comes from
  a `note` field in `_data/therapies.json`, so nothing is invented and a staffer searching
  for a brand gets an answer instead of silence. Delete the note when `products` is filled.
- **The condition list** — 16 seed conditions behind an "under clinical review" notice,
  `noindex`, off the sitemap, with "Call to confirm" instead of a referral CTA.
- **12 held-back drugs** — render nowhere; flipping one `status` to `"confirmed"` publishes
  it with no template change.
- **Pulmonology** — the neutral "we're not listing these yet" card with a call button.

Each carries its exit criteria next to it, so Greg's input lands as data edits rather than
a rebuild.

---

## What was deliberately NOT changed

Three of the original five were resolved by John's answers above — the IVIG tag, the
noindex, and the permit. What remains:

1. **`providers.njk`'s "Infectious disease" card.** Hydration and hematology came down;
   this one stayed. There is no ID specialty, no anti-infective in the drug data and no ID
   condition — and it is the most operationally demanding line on the page (OPAT,
   PICC/midline management). Either it is real and needs a specialty row with Greg's
   sign-off, or it should come down with the other two.
2. **"Council Capital joint venture" and the CEO's "over 15 years".** Unverifiable
   third-party and biographical claims, already published on `main`. Removing a true
   statement about company ownership is as wrong as keeping a false one, so both are
   escalated rather than cut.
3. **Greg's four sections** (`blockers.md` §0–§3) are placeholders by instruction, not
   oversights.
