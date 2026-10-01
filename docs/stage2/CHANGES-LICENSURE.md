# CHANGES — SC pharmacy licensure announcement + em dash removal

**Branch:** `feature/licensure-2026-10` · **Date:** 2026-10-01 · **Base:** `e378f17` on `main`
**Status:** complete, committed to the branch, **not pushed, not deployed**.

---

## Part 1 — South Carolina pharmacy license

### The record this is built from
| Field | Value |
|---|---|
| Licensee (as the Board lists it) | **CoreFlow Rx LLC** |
| License number | **24402** |
| Type / status | Pharmacy / Active |
| First issued | 09/30/2026 |
| Permit holder | Jason Clapsaddle |
| Supervising pharmacist | Gregory Edward Regan, PH |

**Deliberately NOT published:** the expiration date (06/30/2027) and the "no disciplinary
action" finding. A published expiry goes stale on its own and invites a payer to ask whether
the permit is still current; "no disciplinary action" is true and is also exactly what someone
with something to explain would write. The permit number lets anyone verify both in seconds
against the Board's public register.

### The `PH-042891` conflict — resolved
`CLAUDE.md` described `_data/site.json` as holding `legalLine (SC BoP Permit #PH-042891)`.
**That was stale, and the number was never real.** What was actually found:

1. **It was already gone from `site.json`.** John had replaced `legalLine` with
   *"Applied for licensure with the South Carolina Board of Pharmacy under Reg 99-43(B) ·
   permit not yet issued"* (commits `729ba15`, `cae9c47`). `CLAUDE.md` was never updated to match.
2. **It was a fabricated placeholder, not a different permit type.** `scripts/check-licensure.mjs`
   records that it sat in the site-wide footer with an in-repo TODO against it and was withheld
   on 2026-09-29 as an "unconfirmed permit number".
3. **It was still shipping.** It survived in an **HTML comment** at `payers.njk:45-50`, which
   rendered to `_site/payers.html:123` and is served in page source to anyone who views source.
   Logged in `blockers.md` as a shipped error.

**Fixed by:** converting that comment from HTML (`<!-- -->`) to Nunjucks (`{#- -#}`) so it is
stripped at build; correcting `CLAUDE.md:28` and `AGENTS.md:28`; and pinning the real number in
Check 20, which now fails the build on `PH-042891` in **raw** HTML, comments included.

### Entity name
The Board licenses **CoreFlow Rx LLC**. The site's brand is **CoreFlow Specialty Infusion**.
Every sentence making a licensure claim now uses the Board name. The brand name is unchanged
everywhere else — no mass rename. The `/payers` credentialing table row labelled "Legal entity
name" was changed from the brand name to `CoreFlow Rx LLC`, because a credentialing team reading
that field needs the registered entity. Whether "CoreFlow Specialty Infusion" is a *registered*
trade name of CoreFlow Rx LLC is **unverified** — see `blockers.md`.

### All values live in `_data/site.json`
```json
"legalEntity":     "CoreFlow Rx LLC",
"permitAuthority": "South Carolina Board of Pharmacy",
"permitNumber":    "24402",
"legalLine":       "CoreFlow Rx LLC · Licensed by the South Carolina Board of Pharmacy · Permit #24402"
```
Nothing is hardcoded in markup; every page renders `{{ site.* }}`.

### Placement, and why
| Where | What it says | Rationale |
|---|---|---|
| **Footer** (all 17 pages) | `CoreFlow Rx LLC · Licensed by the South Carolina Board of Pharmacy · Permit #24402` | A sitewide licensure line is normal for a pharmacy and puts the number one scroll from any page. |
| **`/payers`** — "Licensure (state permit)" card + credentialing table row | Full: entity, authority, number, status, documentation offer | A credentialing team needs it in full, and this page already holds the detailed credentialing block. |
| **`/providers`** — "SC Board of Pharmacy (state licensure)" card | Full, plus "documentation available to your office on request" | A prescriber checking legitimacy before referring should not have to hunt. |
| **`/about`** — narrative sentence + commitments card | One sentence in the company narrative; terse card beside the URAC/ACHC cards | Company story, not a credential dump. |
| **`/` (home)** | "State licensure" card, paired with "Accreditation (in progress)" | See below. |

**Homepage — argued both ways, decided to include.** *Against:* the home page is a conversion
surface, not a credentials page, and licensure is table stakes rather than a differentiator;
the footer already carries it sitewide. *For, and decisive:* the home page already had a
"Clinical standards that matter." section whose only content was the accreditation-pursuit
statement — a visitor reading it learned CoreFlow does **not** yet hold accreditation and
nothing about what it **does** hold. That is a strictly worse impression than the truth. The
licensure card answers it in place. **The hero is untouched.**

### Licensure and accreditation are separated — visually and verbally
Required, because the two must never blur. On every page where both appear they are now
**separate sibling cards with distinct headings**, and the accreditation side opens by naming
the distinction:

- `/` — "State licensure" │ "Accreditation (in progress)" → *"Accreditation is a separate process from state licensure."*
- `/payers` — "Licensure (state permit)" │ "Accreditation" → *"State licensure is separate from accreditation; see the accreditation card."*
- `/providers`, `/about` — "SC Board of Pharmacy (state licensure)" card → *"State licensure is separate from accreditation."*

The accreditation statement itself is **byte-for-byte unchanged**, including the required
disclaimer *"Accreditation has been initiated and has not yet been awarded."* Check 2 is untouched.

### Pre-launch language brought current
Every instance found, and what it became:

| File | Before | After |
|---|---|---|
| `_data/site.json:22` | "Applied for licensure … permit not yet issued" | `CoreFlow Rx LLC · Licensed by the South Carolina Board of Pharmacy · Permit #24402` |
| `index.njk:93` | "We have applied for a … Resident Pharmacy Permit under Reg 99-43(B); it has not yet been issued." | Split into a "State licensure" card stating permit 24402 active |
| `providers.njk:61` | "Applied for a Resident Pharmacy Permit … Permit not yet issued — we will supply the number to your office as soon as it is." | "CoreFlow Rx LLC holds South Carolina Board of Pharmacy permit #24402, active and in good standing. Permit documentation is available to your office on request." |
| `about.njk:42` | "Resident Pharmacy Permit applied for under Reg 99-43(B). Permit not yet issued." | "Permit #24402, active and in good standing." |
| `payers.njk:22` | "SC Resident Pharmacy Permit applied for … Permit not yet issued; status documentation available…" | "CoreFlow Rx LLC holds South Carolina Board of Pharmacy permit #24402, active and in good standing. Permit documentation is available to credentialing teams on request." |
| `payers.njk:53` | "Resident Pharmacy Permit application submitted … Permit not yet issued" | "SC Board of Pharmacy permit #24402, active and in good standing" |
| `payers.njk:45-50` | HTML comment: "no permit has been issued yet … the old #PH-042891 number" | Rewritten as a Nunjucks comment recording the issuance; no longer ships |

**No operational capacity was claimed.** "Licensed to operate" is a fact on the record.
"Now serving patients statewide", a patient count, a go-live date, or a service-area claim are
**not** facts I have evidence for, and none were written. One pre-launch item was deliberately
**left alone** and flagged instead: `non-discrimination.njk:32`, a Nunjucks comment saying the
Section 1557 taglines "must be inserted here before launch" — that is a genuinely open counsel
item, not stale copy. See `blockers.md`.

### Greg's title — already settled, no change needed
The hedge described in the brief **does not exist in the current tree**. Both references already
read **"Pharmacist-in-Charge"** (`about.njk:32`, `providers.njk:87`) and the string
"Director of Pharmacy" appears nowhere in the repo. **Kept: Pharmacist-in-Charge** — it is South
Carolina's statutory term for the pharmacist of record, and it is what the Board record means by
"supervising pharmacist". A separate, pre-existing discrepancy in his *credentials* is flagged in
`blockers.md`.

---

## Part 2 — Em dash removal

**Result: zero U+2014 in built HTML and built JS.** 77 occurrences were found in scope; each was
read in context and resolved individually. No global substitution was performed, and ` - ` was
never used as a replacement.

### What was actually found — three categories the brief did not anticipate

1. **7 `&mdash;` HTML entities.** These render as em dashes on screen but are invisible to a
   literal-character search. They were caught **only** because the new check scans for the entity
   forms, after a first pass that removed every literal character reported clean.
2. **1 runtime-injected em dash in `finder.js`.** The therapy/condition finder built its
   aria-live announcement as `specialty + " — "` — an em dash inserted into the DOM after
   page load and **read aloud by a screen reader**. No scan of built HTML could ever see it.
   Changed to `": "`, which also reads better in a spoken announcement.
3. **1 em dash inside a shipping HTML comment** (`payers.njk`), carrying the retired permit
   number with it.

### Disposition by file
| Scope | Count | Action |
|---|---|---|
| `.njk` templates + `_includes/` (rendered copy) | 37 | **Rewritten individually** |
| `_data/*.json` internal annotation strings | 15 | **Rewritten** (explicitly in scope; never rendered) |
| `&mdash;` entities in `.njk` | 7 | **Rewritten** |
| `finder.js` / `site.js` (1 runtime + 8 comments) | 9 | **Rewritten** |
| `styles.css` | 20 | **Left** — all in CSS *comments*; zero in `content:` pseudo-elements, which is the only part of `styles.css` the brief put in scope |
| `_headers` | 3 | **Left** — `#` comments in Cloudflare header config, never rendered |
| `scripts/`, `docs/`, `CLAUDE.md`, `AGENTS.md` | — | **Left** — internal, out of scope |

### Punctuation choices
Chosen per sentence, by what the dash was doing:

**Colon** (what follows explains or enumerates) — `referral-checklist` list items; `terms.njk`
program descriptions; meta descriptions on `privacy` and `notice-of-privacy-practices`; the
term→definition items in `privacy.njk` (colon moved *inside* the existing `<strong>`, matching the
`<strong>Service providers.</strong>` idiom already on that page).

**Comma** (parenthetical or appositive) — `privacy.njk:59` "…this website, including our referral
intake platform…"; `providers.njk:106`; the two finder hero lines.

**Two sentences** (most often the best answer) — `index.njk:72`; all three HIPAA
use/disclosure items; `thanks.njk` ×3; `providers.njk:85`; `refer.njk:33`; both finder
"No match on this page." lines; `referral-checklist:5`; `terms.njk:39`.

**Parentheses** — one `therapies.json` annotation ("Aria Simponi" (transposed)).

**Rewrite** — `layout.njk` brand `aria-label` ("{{ site.name }} — Home" → "{{ site.name }} home
page", which is what a screen reader should actually say); `non-discrimination.njk:41`
("CEO — Civil Rights Coordinator" → "CEO and Civil Rights Coordinator"); `drugs-we-provide.njk:21`
(dash-plus-colon pileup split into two parallel sentences); `finder.js` aria-live separator.

**Semicolons were used and then largely reverted.** Five patient- and office-facing sentences
initially took a semicolon. The Marketing reviewer was right that a semicolon is not 8th-grade
register (Check 6), so `thanks.njk:12`, `referral-checklist:5`, `refer.njk:33`,
`diseases-we-treat:137` and `drugs-we-provide:118` became periods. Two semicolons remain, both in
`_data` internal annotations that no reader sees.

### En dashes — left in place, question for John
**4 en dashes (U+2013) remain, deliberately.** All are correct typography for numeric ranges:
- `_data/site.json:9` — `"Mon–Fri, 8:30 AM – 4:30 PM ET"` (×2)
- `terms.njk:43` — `"2–6 messages per month"`, `"1–5 messages per referral submitted"` (×2)

The `terms.njk` pair is the **A2P/10DLC message-frequency disclosure** — a carrier-required
element. Changing it would move registered text. **No change made; confirm whether you want these
touched.** Check 21 explicitly does not cover en dashes and says not to extend it without asking.

### Legal pages — meaning preserved
`terms`, `privacy` and `notice-of-privacy-practices` are carrier-facing A2P/10DLC documents.
Only punctuation changed, plus three clause restructurings in the HIPAA use/disclosure list that
preserve each category exactly. Compliance review confirmed every carrier-required element
survived: program name, both program descriptions, message frequency, "Message and data rates may
apply.", bold **HELP** and **STOP**, and the mobile-data non-sharing attestation.

---

## New and changed verification

`verify-coreflow` went from **19 to 21 checks**. `npm run verify` runs 13 scripted checks.

### Check 18 — INVERTED (not weakened)
The old Check 18 existed to fail the build on **any** claim of holding a permit. That rule now
asserts the opposite of the truth. The check's own closing note prescribed this migration:
*"WHEN THE PERMIT IS ISSUED: update every reference together, then relax rules 1 and 3 here in the
same commit and pin the real number in rule 2's place."* It now fails on:
retired **pre-issuance** language (a regression guard — stale copy has twice returned here via a
branch cut from an out-of-date `main`); a published **expiration date**; and any **disciplinary**
assertion. Its regex matches "issued", never "awarded", so the required accreditation disclaimer
is untouched.

### Check 20 — NEW · `scripts/check-permit-number.mjs`
Any permit-number-shaped token must be `24402`; fails by name on `PH-042891`; fails on any
sentence that mentions a permit/licence/the Board **and** contains "accredited", "certified" or
bare "approved"; and fails if the canonical licensure sentence vanishes from the build entirely.
**Scans raw HTML as well as visible text**, so an HTML comment cannot hide a wrong number —
that gap was found by the Build/QA reviewer and closed before commit.

### Check 21 — NEW · `scripts/check-no-em-dashes.mjs`
Zero U+2014 in built HTML **and built JS**, including `&mdash;`, `&#8212;`, `&#x2014;` and the
`—` JS escape. Scans **raw** bytes, not `visibleText()`, because comments ship.
Documented non-coverage: PDFs, the Formstack/GoHighLevel iframes, anything outside the build,
`styles.css` comments, `_headers` comments, and **en dashes**.

All three were negative-tested: every rule was proven to fail the build when violated.
