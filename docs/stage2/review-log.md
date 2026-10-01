# Review log — licensure announcement + em dash removal

**Branch:** `feature/licensure-2026-10` · **Date:** 2026-10-01
Four reviewers, each blocking only in its own domain.

| Reviewer | Verdict | Blocking findings | All resolved? |
|---|---|---|---|
| Marketing Copy | **BLOCK** → resolved | 6 must-fix | Yes |
| Compliance | **PASS** | 0 | n/a (3 advisories actioned) |
| Design | **PASS** | 0 | n/a |
| Build / QA | **PASS** | 0 | n/a (1 real gap actioned) |

---

## 1. Marketing Copy — BLOCK, then resolved

Found a **root cause** rather than six separate nits: `site.licensure` in `_data/site.json` was
written as three stacked fragments ("Licensed by… Permit #24402. Active and in good standing."),
so every page that concatenated anything around it inherited the stack. On `/providers` that
rendered as five fragments with the subject arriving third.

**Fix applied to the cause:** pages now compose from the atoms (`legalEntity`, `permitAuthority`,
`permitNumber`) instead of wrapping text around a pre-built sentence. The prescribed phrasing is
still used verbatim where it stands alone. The now-unused `licensure` key was **deleted** — dead
data in a single-source-of-truth file is a liability, because someone will later edit it believing
it is live.

| # | Finding | Resolution |
|---|---|---|
| 1 | `providers.njk:106` — em dash became a second "and", producing an "and … and" stack | Comma + participle: "consistent across all patients and visits, designed for easy integration into your EHR." |
| 2 | `terms.njk:39` — colon before adverbial phrases of means reads stilted | Split: "…agree to receive text messages. You can do that on a referral form, on an intake or registration form, or by giving verbal consent…" Carrier meaning preserved. |
| 3 | `index.njk` — lead-in sentence + 3-fragment string said the same fact twice ("holds an active… / Active and in good standing") | Rewritten to the prescribed phrasing with the entity as subject. Had already been tightened during the design pass; the duplication is gone. |
| 4 | `providers.njk:61`, `about.njk:43` — "Issued to CoreFlow Rx LLC." landed after the status, subject third | Both recomposed from atoms, entity first. `about` narrative shortened so it no longer duplicates its own card verbatim. |
| 5 | `payers.njk:22` — "licensed by the … Board of Pharmacy **as a pharmacy**" (repeat); "addressed below" is wrong on desktop, where the card sits to the *right* in `grid--2` | "CoreFlow Rx LLC holds South Carolina Board of Pharmacy permit #24402, active and in good standing. … State licensure is separate from accreditation; see the accreditation card." |
| 6 | `payers.njk:58` — "South Carolina Board of Pharmacy **pharmacy** permit" stutter | "SC Board of Pharmacy permit #24402, active and in good standing" |

**Advisories, all accepted:**
- Five semicolons on patient/office-facing copy → periods. A semicolon is not 8th-grade register
  (Check 6), and in `thanks.njk:12` it followed a bolded fragment.
- `diseases-we-treat:81` / `drugs-we-provide:52` → "No match on this page. That is not the same as
  no." The em dash carried a rhetorical beat that ", and" flattened.
- `notice-of-privacy-practices:26` — "we **conduct** … business management" is a bad collocation →
  "These include quality assessment, staff review, credentialing, and business management."
- `index.njk` card title "Accreditation (separate, in progress)" → "Accreditation (in progress)";
  the body sentence already does the verbal separation.

**Called out as genuinely better rewrites:** `drugs-we-provide.njk:21` (dash-plus-colon pileup
split into parallel sentences), the `privacy.njk` definition-list colons, the HIPAA
fragment→clause promotions, and `non-discrimination.njk:41`.

---

## 2. Compliance — PASS

Verified against the freshly built `_site/`, all seven items clear:

1. **Licensure never implies accreditation.** The only `accredited` in the build is inside Lora
   Santi's bio describing a prior employer ("AAAHC-accredited surgery center"); the only `approved`
   is "as soon as your insurance is approved" on `/patients`. Neither is a CoreFlow credential claim.
2. **Permit number.** `Permit #24402` on all 17 pages; zero other permit-shaped tokens;
   `grep -rln "042891" _site/` → nothing, binaries included. Every `<!-- -->` in all 17 built pages
   was extracted and inspected — only the Plausible note and three form-provider notes remain, none
   carrying regulated data.
3. **No expiration date.** No `06/30/2027`, `2027-06-30`, "June 30", "expires", "valid through".
   The issue date is also absent from published output.
4. **No disciplinary assertion.** Zero hits for `disciplin|sanction|no action|unblemished|clean record`.
5. **Entity name on licensure claims.** Every licensure sentence names `CoreFlow Rx LLC`.
6. **A2P/10DLC elements survived.** Full diff of all three carrier documents read. Confirmed intact
   in built output: program name, both program descriptions, "2–6 messages per month" / "1–5 messages
   per referral submitted", bold "Message and data rates may apply.", bold **HELP** and **STOP**, and
   the mobile-data non-sharing attestation (canonical two-sentence version untouched in `privacy.njk:58`).
7. **Accreditation disclaimer verbatim** on all four pages that mention URAC/ACHC, each phrased as
   *pursuing* with *anticipated Q4 2026*.

**Advisories, all actioned:**
- `CLAUDE.md:28` / `AGENTS.md:28` still documented `legalLine (SC BoP Permit #PH-042891)` as the
  source of truth. Not published, but these are the files an agent reads first, so the stale number
  was a live reintroduction risk. **Both corrected in this commit.**
- `about.njk` / `providers.njk` separated licensure from accreditation visually but lacked the
  explicit *verbal* separator that `/` and `/payers` carry. **Sentence added to both** — all four
  pages now have parity.
- Greg Regan's published credentials vs the Board record → recorded in `blockers.md` (pre-existing,
  not introduced here).

---

## 3. Design — PASS

Reviewed in-browser against a live Eleventy server.

- The home "Clinical standards that matter." section renders as two balanced sibling cards with
  clear separation between "State licensure" and "Accreditation (in progress)". Verified at desktop
  width; one copy tightening was made on the spot after reading it rendered (repeated "active" and
  three "South Carolina"s in the licensure card).
- Footer stays balanced. The licensure line sits on its own row beneath the copyright, is visually
  quiet, and does not crowd the five-column nav block.
- `/payers` licensure card sits naturally in the existing `grid--2` beside the accreditation card.
- **No new CSS.** `git diff` on `styles.css` is empty. Every new element reuses `.card`, `.grid`,
  `.grid--2`, which are pre-existing.

**Responsive — one honest limitation.** A true 375px viewport could not be reached: macOS enforces
a minimum Chrome window width, and the extension kept capturing at a fixed viewport across three
resize attempts. Rather than keep retrying, responsive behaviour was confirmed **structurally**,
which is conclusive here: the new markup adds no CSS and uses `.grid--2`, whose mobile-first rule is
`grid-template-columns:1fr` with two columns only above `@media(min-width:768px)` (`styles.css:86,88`).
The licensure and accreditation cards therefore stack to a single column below 768px exactly as
every other `.grid--2` on the site already does. **Worth a human glance on a real phone before merge.**

---

## 4. Build / QA — PASS

| Check | Result |
|---|---|
| Eleventy build | 17 files, exit 0, zero warnings |
| `npm run verify` | exit 0, **13 scripted PASS** |
| SKILL.md self-consistency | `grep -c '^## Check'` = **21**; header count, "Checks 8–21", "all fourteen build-level" all agree |
| Links / `action="#"` | PASS; zero `action=` of any kind (all forms are third-party iframes) |
| Leak allowlist | PASS; the two new `scripts/*.mjs` do not render into `_site/` |
| PDF hash + geometry | `sha256=7598d937…6012` matches the pin; gap 75.7pt (min 25.0) |
| U+2014 in built HTML / JS | **0**, including `&mdash;`, `&#8212;`, `&#x2014;`, `—` |
| `PH-042891` in `_site/` | **0 hits**, whole-directory |
| `24402` placement | 23 hits = 17 footer + 6 dedicated; **zero hardcoded** — all from `{{ site.* }}` |
| New checks genuinely fail | **9/9 negative tests exit 1** |
| `_data/*.json` syntax | all parse |

**Real gap found and closed.** `check-permit-number.mjs` originally scanned only `visibleText()`,
which strips comments — so an injected `<!-- TODO permit #PH-042891 -->` **passed**. That is
precisely the regression the check was written to prevent. A raw-HTML pass was added and the exact
mutation now fails the build. Also actioned: `_headers`' three comment em dashes added to Check 21's
documented non-coverage, and Checks 20/21 moved after Check 19 in the skill file.

**Process note from the reviewer:** the tree was being edited while it ran, so it verified both the
staged and working trees — both green. Everything is staged and committed together.

---

## Verdict matrix

| Dimension | Verdict |
|---|---|
| Marketing Copy | PASS (after 6 must-fix + 4 advisories applied) |
| Compliance | PASS (3 advisories applied) |
| Design | PASS (375px not machine-verified — see above) |
| Build / QA | PASS (1 check gap closed) |
| **Overall** | **PASS — ready for John's review. Not pushed.** |


---

# Addendum — 2026-10-01, later the same day: licensure & accreditation removed

**Leadership reversed the licensure announcement.** Everything above describes *publishing* the SC
pharmacy permit; the site now states no licensure and no accreditation at all. The review record
above is kept because the Marketing and Compliance findings in it shaped copy that survives, and
because two checks have now been inverted twice.

## What carried over from the reviews above

- **Marketing's root-cause finding still holds.** It flagged that `site.licensure` was three
  stacked fragments every page inherited. That key, and the pages that composed around it, are now
  gone entirely — the problem was deleted rather than fixed.
- **Compliance's advisory to correct `CLAUDE.md` / `AGENTS.md`** applied again: both had been
  updated in the first pass to document permit 24402 as a `site.json` fact. Both are now rewritten
  to state that licensure and accreditation are deliberately absent, with a pointer to the three
  checks that enforce it.
- **Build/QA's finding that `visibleText()` strips comments** is the reason Check 20 still scans
  raw bytes, and the reason the new Check 2 scans raw bytes for `URAC`/`ACHC`. That lesson outlived
  the policy that prompted it.

## Review of this pass

| Dimension | Verdict | Notes |
|---|---|---|
| Compliance | **PASS** | Zero URAC/ACHC, zero permit/licensure wording, zero permit number, verified over the whole `_site/` directory including comments and binaries. The removal is strictly safer than the pursuit claim it replaces. Carrier-facing A2P/10DLC content in `terms`/`privacy`/`notice-of-privacy-practices` was **not touched** in this pass — the only edit to those files was the earlier punctuation work, already reviewed and passed. |
| Design | **PASS, after three repairs** | Removing whole sections broke the soft/plain band alternation on `/about` (three soft in a row) and on `/` (three plain into the footer), and orphaned a card in two grids. All four fixed and re-checked in-browser at desktop width. No CSS changed. |
| Marketing Copy | **PASS** | The pages that lost sections still read as complete: `/payers` hero reads cleanly without its two accreditation sentences; `/about`'s lead is intact; Greg's and Lora's cards are symmetrical again. Three residual licensure words were handled individually rather than by find-and-replace. |
| Build / QA | **PASS** | 14/14 scripted checks; 7/7 negative tests on the inverted checks bite; regression guard confirms legitimate "licensed physicians" / "permitted by law" / "accreditation obligations" copy still passes. |

**Same limitation as the first pass:** a true 375px viewport was not reachable in-browser. Layout
changes here are class swaps between existing mobile-first grid rules (`grid--2` and `grid--3` are
both single-column below 768px), so mobile behaviour is unchanged by construction — but the
section-band and grid changes are still worth a glance on a real phone.
