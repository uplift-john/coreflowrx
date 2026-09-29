# Post-review pass — review log

Branch `feature/post-review-2026-09` · 2026-09-29. Two rounds of eight parallel
reviewer roles. Every BLOCK is listed with what was done about it, including the four
that were deliberately **not** actioned and why.

---

## Verdict matrix

| Role | Round 1 | Round 2 | Notes |
|---|---|---|---|
| Marketing Copy | BLOCK (14) | BLOCK (6 + 11 minor) | All actioned or escalated; see "declined" below |
| Compliance | BLOCK (6) | BLOCK (2 + 6 minor) | Both round-2 blocks actioned |
| Clinical / Pharmacy | BLOCK | BLOCK (10 + 11 minor) | 3 conditions removed, 3 drugs held back, rest escalated |
| Design | BLOCK (4) | BLOCK (2 + 12 minor) | Both round-2 blocks were regressions I introduced; fixed |
| Security / Code | BLOCK (3 + 12 minor) | BLOCK (1 + 9 minor) | `stripBlocks` comment hole closed |
| Accessibility | BLOCK (6 + 9 minor) | BLOCK (1 + 5 minor) | Same regression Design found; fixed |
| UX / UI | BLOCK (5 + 3 minor) | BLOCK (3 + 3 minor) | Round-2 blocks actioned; one criterion still partial |
| Build / QA | BLOCK (1 + 2 minor) | **PASS** | 17/17 checks green |

Round 2 found **three** genuinely new defects, two of which were regressions introduced
by round-1 fixes. That is the round earning its keep.

---

## The three findings that mattered most

### 1. The filter did not filter

Found independently by Accessibility, Security and Design. `finder.js` set
`item.hidden = true`, but `[hidden]` is a *normal author-origin-losing* UA rule, so
`.therapy{display:flex}` beat it. **Verified in a browser before the fix: searching
"remicade" left 21 of 35 cards on screen** under a status line reading "Showing 3 of 16",
with whole group headings vanishing (those had no `display` declaration) while their
cards stayed. The no-JS contract was broken the same way — the search form and Clear
button rendered despite carrying `hidden`.

One line fixed all of it. Re-verified after: "remicade" → exactly 3 cards in 3 groups.

Firefox's UA sheet *does* use `!important` here, so this half-worked in one browser and
not others — the kind of split that is very hard to diagnose later.

### 2. Two compliance guards were one CSS class from being disabled

`stripBlocks()` in `scripts/lib-html-text.mjs` feeds both the MUSC and testimonial checks.
Security found two silent-pass paths, in two separate rounds:

- **Round 1 — void elements.** `<img class="bio-photo">` sent the depth scan hunting a
  `</img>` that can never exist; it fell through and returned everything *before* the tag.
  One such tag in a page header would have made both checks print PASS on a page carrying
  an explicit MUSC partnership claim **and** a fabricated testimonial.
- **Round 2 — comments.** A commented-out tag inside a bio card
  (`<!-- <div class="card__photo"> headshot pending -->`) pushed the depth counter to 2,
  so the scan ran past the bio's real `</div>` and swallowed the rest of the wrapper —
  again without throwing.

Both closed. Unbalanced markup now **throws** rather than scanning a truncated document,
and both repros are checked into the reasoning comments so the next person doesn't
reintroduce them.

### 3. A round-1 accessibility fix broke the empty-state CTA

Design and Accessibility both caught it. Adding `.note-box a{color:navy}` for link
contrast on the amber panels created a selector at specificity (0,1,1), which outranks
`.btn--primary` (0,1,0) **regardless of source order**. The only call-to-action in the
no-results state rendered navy-on-teal at **1.50:1**, and disappeared entirely on hover
(1.00:1). Fixed with `:not(.btn)`.

---

## Checks were attacked, not just written

Security constructed inputs that violate each invariant and asked whether the check
catches them. Several did not:

| Evasion | Status |
|---|---|
| `same-day`, `24-hour` (hyphens tokenised as one word) | fixed — split on hyphens |
| `within a single business day` | fixed — added `single/whole/full` |
| `&#8220;`-encoded curly quotes | fixed — all numeric entities decoded, `&amp;` last |
| `— Margaret Rodriguez, Summerville SC` (no trailing initial) | fixed |
| `"Great." (Margaret R., Summerville, SC)` — paren, not dash | fixed |
| `<q>` instead of `<blockquote>` | fixed |
| `our credentialed infusion nurses`, `Our RNs` | fixed — intervening words, case-insensitive |
| `title="… within one business day"` (attribute text) | fixed — attributes now harvested |
| A flagged drug named on a page outside the hardcoded 10 | fixed — iterates every built page |
| `854.888.9071` (non-house phone format) | fixed — any phone shape, plus `tel:` validation |
| A confidential image left at the repo root | fixed — images allowlisted by exact filename |

**Verified by injecting six violations into a copy of the build** and confirming each one
is caught. Two carve-outs remain, both legal, both scoped to exact strings: the 45 CFR §92
grievance period and the two HHS OCR complaint numbers.

---

## Measured, not reasoned about

The header and the finder were checked in a real browser rather than argued from CSS.

| | Before | After |
|---|---|---|
| Header at 320px | **wrapped to 2 rows, 127px** | single row, 69px |
| Header at 375px | flush to viewport edge (no gutter) | 16px gutters, 71px, nothing overlaps |
| Header at 1440px | 142px sticky (~18% of viewport) | 118px |
| Diseases search field at 375px | 1.89 screenfuls down | **0.89** |
| Card referral action tap target | 206×17 | 168×44 / 233×44 |
| Filter "remicade" | 21 of 35 cards visible | exactly 3 |

The **no side gutter** finding was a pre-existing bug the enlarged logo exposed:
`.site-header__inner` set `padding: var(--space-3) 0`, which overrode `.container`'s
horizontal padding at equal specificity.

### UX round 2 — three more, all measured

| | Before | After |
|---|---|---|
| Chrome between search field and first result (375px) | 330px — **no result visible while typing** | **158px**, result visible with the keyboard up |
| Specialty chip row (375px) | 148px, wrapped to 3 rows | 52px, one scrolling row |
| In-page anchors | landed **under** the sticky header | clear of it at both 71px and 118px |
| Text search for a multi-specialty drug | announced "1", painted **3 identical cards** | 1 card, deduplicated |
| Diseases page empty specialties | chips suppressed — Oncology silently ceased to exist | same "not listing these yet" block the drugs page uses; 7 chips / 7 anchors on both |

The anchor offset mattered more than it sounds: the specialty chips are ordinary
in-page anchors without JS, so every one of them landed its target underneath the sticky
header — the no-JS fallback was decorative.

**One criterion is still only partial.** At 375px with the soft keyboard up, the matching
card is now visible but its "Refer a patient on X →" link sits ~30px below the fold.
Closing that last gap means shortening the card itself (dropping the generic name or the
specialty tags), which costs more than it buys. Recorded rather than papered over.

---

## Declined, with reasons

Four BLOCKs were not actioned. Each is on `blockers.md` for John.

**1. Add `"immunology"` to IVIG's specialties.** Two reviewers asked for it; Clinical
called the omission the reason the Immunology row renders empty. Not done: adding a
specialty tag asserts a clinical fact about which indications CoreFlow services, the
standing rule is to flag rather than guess, and the brief said explicitly to raise this
with Greg rather than fix it. It is a one-word change when he confirms.

Clinical's alternative — drop IVIG to `unconfirmed` — was also declined: the brief says
*"Until he answers, render 'IVIG' as written and do not invent product names."* What
**was** done is the copy half nobody had to guess at: `providers.njk` no longer claims
"built for high-volume immunology prescribers" or SCIG, so the site no longer contradicts
itself across three surfaces.

**2. Delete `providers.njk`'s unbacked service lines** (infectious disease, hematology,
hydration). These are pre-existing published business claims, and a specialty-**biologic**
intake map is not evidence CoreFlow can't run OPAT. Deleting a live service line is a
business decision. A scoping note-box was added and the reconciliation escalated —
including hyperemesis gravidarum home hydration, escalated **by name** as Clinical asked.

**3. Remove `noindex` from `/providers` and `/patients`.** The brief was explicit that
this is John's call. Recommended in `blockers.md` §7 with reasoning, and an explanatory
comment added to both files — the only in-repo record of *why* the noindex existed was
the HTML comment deleted along with the testimonial that caused it.

**4. Cut "Council Capital joint venture" and the CEO's "over 15 years".** Unverifiable
third-party and biographical claims, already live on `main`. Removing a true statement
about company ownership is as wrong as keeping a false one. Escalated.

Marketing also asked to soften "nurses who live and work in your patient's community".
Declined on a sourced basis: `verify-coreflow` Check 5 explicitly blesses local-community
and "neighbors taking care of neighbors" language as approved brand copy. The separate
claim that the network already exists everywhere *was* softened on `patients.njk`.

---

## Still open, by owner

**Greg** — the IVIG product list and SCIG scope; the confirmed condition list; the
missing hematology row; 12 held-back drugs; the three seed conditions removed on clinical
review.

**John** — info@/help@ mailbox staffing (and a BAA for the one that will receive PHI);
the Formstack confirmation screen and auto-reply, which almost certainly still carry the
timeframe promise the site no longer does; the noindex decision; Council Capital and the
CEO bio; permit `#PH-042891`; whether an after-hours clinical line exists.

**Deploy** — the CSP is Report-Only with no reporting endpoint, so it currently enforces
nothing and reports nowhere. The last blocker to flipping it is cleared: built pages now
have zero inline `<script>` blocks.
