# CHANGES — licensure & accreditation removed from the site; em dashes removed

**Branch:** `feature/licensure-2026-10` *(name is now a misnomer — see note at end)*
**Base:** `e378f17` on `main` · **Status:** committed to the branch, **not pushed, not deployed**

This document supersedes the version written earlier the same day, which described
*publishing* the SC pharmacy permit. **Leadership reversed that on 2026-10-01.** The history is
kept here deliberately, because two of the verification checks have now been inverted twice and
anyone reading them cold needs to know why.

---

## What leadership decided

> Remove any mention of licensure altogether. Do not list our SC BOP or that we're pursuing our
> ACHC URAC. The assumption is that if we're up and running we must have our SC BOP and it's not
> worth mentioning that we're pursuing URAC/ACHC.

**The permit is real and current.** SC Board of Pharmacy pharmacy permit **24402**, issued
2026-09-30, active. It is simply not advertised. Nothing here claims or implies otherwise — the
site is now silent on the subject.

**The accreditation removal is net safer.** The previous copy said CoreFlow was *pursuing* URAC
and ACHC, which required a disclaimer on every page to stop it reading as *holding* them. A claim
that is absent cannot be misread.

**One concern was raised before the work, and has since been closed.** Removing the permit number
from `/payers` costs a credentialing team the one field they would otherwise look up directly, and
some states and payer contracts require a licensed pharmacy to display licence information.
**John confirmed on 2026-10-01 that there is no licence display requirement for the website**, so
the omission is a positioning choice, not a compliance defect. The residual trade-off — credentialing
teams must now request the number rather than read it — is recorded in `blockers.md` item 21.

---

## What was removed

| Page | Removed |
|---|---|
| **`/` (home)** | The entire **"Clinical standards that matter."** section — it contained *only* the licensure and accreditation cards, so it emptied out. |
| **`/about`** | The licensure sentence from the company narrative, **and the entire "Our clinical commitments." section** (SC BOP + URAC + ACHC cards — all three). |
| **`/providers`** | "SC Board of Pharmacy (state licensure)" card; "URAC & ACHC (pursuing)" card; **"Licensed by the SC Board of Pharmacy"** under Greg Regan. |
| **`/payers`** | Two accreditation sentences from the hero; "Licensure (state permit)" card; "Accreditation" card; the **"State pharmacy license"** row from the credentialing table. |
| **Footer (all 17 pages)** | `legalLine` reduced from `CoreFlow Rx LLC · Licensed by the South Carolina Board of Pharmacy · Permit #24402` to **`CoreFlow RX, LLC`**. |
| **`_data/site.json`** | `permitAuthority` and `permitNumber` keys deleted outright. |

### Entity name — resolved
`legalEntity` is now **`CoreFlow RX, LLC`**, per John. The earlier open question (the Board record
reads "CoreFlow Rx LLC", project records read "CoreFlow RX, LLC") **no longer applies**: the rule
that a licensure claim must match the Board record exactly only binds licensure claims, and there
are none. The registered form is what ships. It renders in the footer on all 17 pages and in the
`/payers` credentialing table's "Legal entity name" row.

### Three judgement calls on residual licensure wording
| Where | Was | Now | Why |
|---|---|---|---|
| `/providers` Lora Santi card | "Licensed registered nurse" | *removed* | Redundant with "BSN, **RN**", it is literally a licensure mention, and it restored symmetry with Greg's card, which had just lost its credential line. |
| `/providers` team intro | "named, **licensed**, and reachable" | "named, **credentialed**, and reachable" | Same meaning; "credentialed" is already the site's own word for its clinical people. |
| `privacy.njk` ×2 | "legal, regulatory, **accreditation**, and recordkeeping obligations" | *kept* | Boilerplate about what obligations *can* apply, not a status claim — and rewriting legal retention text to dodge a grep is the wrong trade. **Flagged for John.** |

### Deliberately kept — not CoreFlow's licensure
- **"licensed physicians and other providers eligible to prescribe"** (5 pages) — the
  prescriber-order gate. Removing it would weaken a real control, not a marketing line.
- **"licensed providers to submit patient referrals"** (terms).
- **"permitted by law" / "as permitted by HIPAA"** — the Check 18 rule is `\bpermit\b`, which does
  not match "permitted". That word boundary is load-bearing.
- **Lora Santi's bio: "an AAAHC-accredited surgery center"** — a prior employer's accreditation,
  the same third-party carve-out Check 3 makes for MUSC.

---

## Layout repairs the removals forced

Removing whole sections broke two things that a copy-only diff would have hidden:

1. **`/about` had three `section--soft` bands in a row.** The removed "Our clinical commitments."
   section was a plain `.section` sitting between two soft ones; deleting it collapsed the
   alternation into one long unbroken band. **Fixed:** "Serving patients wherever they live." is
   now a plain `.section`.
2. **`/` lost the soft band before its closing CTA**, leaving three plain sections running into
   the footer. **Fixed:** the closing "Ready to refer?" section is now `section--soft`.
3. **Two grids orphaned a card.** `/providers` "Clinical standards you can verify." went 6 → 4
   cards in a `grid--3`, leaving one card alone on row 2 → switched to **`grid--2`** (clean 2×2).
   `/payers` "Our clinical and quality framework." went 5 → 3 in a `grid--2` → switched to
   **`grid--3`** (clean single row).

All verified in-browser. **No CSS was changed** — only which existing grid/section classes are applied.

---

## Verification — three checks inverted

`verify-coreflow` is still **21 checks**; `npm run verify` now runs **14** scripted (Check 2 became
scripted). All 14 pass, plus the judgement checks (5, 6, 7, human half of 4) run by hand.

| Check | Was | Now |
|---|---|---|
| **2 — accreditation** | *Manual grep.* If URAC/ACHC appear, require "pursuing" + "Q4 2026" + the exact disclaimer. | **Scripted.** FAIL on `URAC`/`ACHC` in **raw** HTML (comments included), and on accreditation claim *shapes* outside bios. |
| **18 — licensure** | FAIL on stale pre-issuance language, a published expiry, disciplinary claims. | FAIL on **any** licensure reference: `Board of Pharmacy`, `pharmacy permit`, bare `permit`, `licensure`, `Reg 99-43`, "we are licensed", "state/SC-licensed". |
| **20 — permit number** | Require the number to be `24402`; require the canonical licensure sentence present. | FAIL on **any** permit number — including `24402` itself — in **raw** bytes. The "canonical sentence must exist" rule is deleted; it would now fail the build. |

**Check 18 has now been inverted twice**, and the script carries a version table saying so. v1
("do not claim what you do not have") and v3 ("do not discuss licensure at all") look similar and
mean different things — v3 exists alongside a permit that is real.

**Why Check 2 uses claim shapes rather than the bare word "accredit":** two legitimate uses remain
(Lora's prior employer, privacy's retention boilerplate). Bio blocks are stripped before the shape
rules run, so neither needs an allowlist.

**Why Checks 18 and 20 stay separate scripts:** the skill's own rule — a merged check can be passed
by weakening either half. 18 reads visible text and forbids *language*; 20 reads raw bytes and
forbids a *number*, which is what leaked last time inside an HTML comment.

**All three were negative-tested.** 7 mutations, each proven to fail the build: URAC in a comment;
"pursuing ACHC accreditation"; "CoreFlow is accredited" with no brand name; "Board of Pharmacy";
the bare word "permit"; `24402` in a comment; `PH-042891` in a comment. A regression guard then
confirmed the legitimate copy ("licensed physicians", "permitted by law", "accreditation
obligations") still passes.

### Final assertions, clean build
```
URAC | ACHC in _site        0
permit | Board of Pharmacy  0
24402 anywhere in _site     0
PH-042891 in _site          0
U+2014 in built HTML and JS 0
"CoreFlow RX, LLC"          17/17 pages
```

---

## Em dash removal — unchanged, still holding

Everything from the earlier pass stands: **zero U+2014 in built HTML and built JS**, including the
`&mdash;` / `&#8212;` / `&#x2014;` entity forms and the `—` JS escape that `finder.js` was
injecting into an aria-live region at runtime. **4 en dashes remain in source by decision** (numeric
ranges; two are the A2P/10DLC frequency disclosure) — still an open question for John in
`blockers.md`.

---

## Note on the branch name

`feature/licensure-2026-10` now does the opposite of what it says. It is **unpushed and unmerged**,
so renaming is free:
```sh
git branch -m feature/licensure-2026-10 feature/remove-licensure-2026-10
```
Left as-is so the name John already has does not change underneath him.
