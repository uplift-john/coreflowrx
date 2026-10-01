# CoreFlow Rx — blockers & open items

Everything here is awaiting your input, an off-repo action only you can perform, or a
deliberate placeholder. Nothing here blocked the rest of the work from completing.

**Updated 2026-09-29 (post-review pass, branch `feature/post-review-2026-09`).**

## ⚠ FIRST: this branch was cut from a 10-commit-stale `main`

Discovered 2026-09-29 while checking merge readiness. `origin/main` was **10 commits
ahead** of the local `main` this branch was based on, and all six files those commits
touched are files this branch also changed. **Merging without reconciling would have
reverted real work**, including:

- **Both clinician bios** — Dr. Greg Regan (PharmD, RPh) and Lora Santi (BSN, RN), with
  full paragraphs. This branch still had `[NAME]` placeholders.
- **John's own permit fix**, already applied across four files ("applied for",
  `Permit #TBD`).
- **An `.onDark` wrapper + CSS** making the physician-order notice legible against the
  dark providers hero.

`origin/main` has been merged in and every conflict hand-resolved to keep both sides.
Two things surfaced in the process:

1. **`providers.njk` on `origin/main` has unbalanced markup** — the `.onDark` edit nested
   the notice inside `.hero__cta` and dropped two closing `</div>`s (49 `<div>` vs 47
   `</div>`), leaving the hero container unclosed. **That bug is live right now.** The
   merge keeps the `.onDark` intent with the notice correctly placed after `.hero__cta`;
   the file is now balanced at 43/43.
2. **`Permit #TBD` was dropped.** Check 4 already forbids an incomplete permit number in
   a regulated field ("e.g. `Permit Add #`") and `#TBD` is that shape. The *intent* —
   applied for, not held — is John's and is kept everywhere. Say the word if you want the
   literal `#TBD` back and I'll carve it out of the check explicitly.

**Greg Regan's bio contains the only permitted MUSC reference on the site** — "most
recently managing prior authorization operations for infusion services at MUSC" — which
is exactly the employment-history usage Invariant 2 allows. It sits inside a
`class="card bio"` block, which is what makes Check 3/14 permit it. Lora Santi's does too.
**Do not move either bio out of a `.bio` block**; the check will fail the build.

---

## Status at a glance

John answered six items on 2026-09-29. Everything he answered is applied and verified;
everything that needs Greg is now a **marked placeholder** rather than a blocker, per his
instruction to build the skeleton and take Greg's input later.

| | Item | State |
|---|---|---|
| §0 | IVIG product names / SCIG | **placeholder** — Greg. Renders the generic entry with a visible on-page note. |
| §1 | Empty Immunology row | **RESOLVED** — `"immunology"` added to IVIG. Pulmonology still empty. |
| §2 | Greg's condition list | **placeholder** — Greg. Page is seed-marked, noindex, off the sitemap. |
| §3 | 12 held-back drugs | **placeholder** — Greg. None renders; flipping `status` publishes. |
| §4 | `providers.njk` service lines | **RESOLVED** — hydration, hematology and infectious disease all removed. The two remaining cards are backed by `_data/`. |
| §5 | info@ / help@ mailboxes | **RESOLVED** — both live and monitored. BAA on help@ still to confirm. |
| §6 | Timeframe promise outside the repo | **OPEN — John.** After-hours on-call line: resolved. |
| §7 | `noindex` on providers/patients | **RESOLVED** — dropped; both added to `sitemap.xml`. |
| §8 | CSP / HSTS | **OPEN — deploy.** Last blocker to enforcing is cleared. |
| §10 | Permit `#PH-042891` | **RESOLVED** — no permit yet; every reference now says applied-for. New Check 18 guards it. |
| §11 | Council Capital | **RESOLVED** — removed from the site. CEO bio still **OPEN — John.** |
| §12 | Unidentified cover-sheet PDF | **OPEN — John.** |

---

---

## 0. THE TOP QUESTION — for Greg: which IVIG products, and is SCIG in scope?

This is the single highest-value unanswered question on the site.

"IVIG" appears as a **generic entry in four specialties** and is the most-repeated item
in the whole drug map — yet **no specific immunoglobulin product is named anywhere**.
Referring offices do not search for "an immunoglobulin." They have a patient on
**Gamunex-C**, or **Privigen**, or **Octagam**. A staffer who scans the page for their
product and doesn't find it assumes the answer is no, and routes the patient elsewhere.

**Ask Greg:**
1. Which specific IVIG products do we dispense?
2. Do we provide **SCIG** at all? `providers.njk` currently claims "IVIG/SCIG" in its
   Neuroimmunology card, but there is no SCIG entry anywhere in `_data/therapies.json`.
   One of those two things is wrong.

The page is already built to absorb the answer: every therapy in `_data/therapies.json`
has an empty `products: []` array. Drop the brand names in and they render as sub-items.
**No template change, no rebuild.**

**Placeholder now live (2026-09-29):** the IVIG card carries a visible note —
*"Specific immunoglobulin products are still being confirmed. If you need a particular
brand, call us and we'll check availability before you refer."* It renders from the `note`
field in `_data/therapies.json`, so no product name is invented and a staffer searching
for a brand gets a real answer instead of silence. **Delete the `note` field when the
`products` array is filled in.**

---

## 1. ✅ RESOLVED — Immunology is populated

**John confirmed 2026-09-29: add `"immunology"` to IVIG.** Done. `/drugs-we-provide` now
renders IVIG under Immunology, and the page no longer tells an immunology prescriber that
CoreFlow has nothing for them. The rest of this section is kept as the record of why.

**Pulmonology is still empty** and needs Greg — after removing Leqvio (an error) and four
subcutaneous-only respiratory biologics, nothing is left. The genuine home-infusion
pulmonology class, alpha-1 antitrypsin augmentation, appears nowhere.

---

### Original finding (for the record)

The intake map lists **only Leqvio** under Immunology. Leqvio (inclisiran) is a
subcutaneous lipid-lowering agent with no immunology relevance whatsoever — a probable
data-entry error. Removing it leaves the specialty with nothing, so
`/drugs-we-provide` renders Immunology as *"We're not listing immunology therapies yet."*

Meanwhile `_data/conditions.json` files **Primary Immune Deficiency** and **Secondary
Immune Deficiency** under immunology, and `providers.njk` headlines
*"Neuroimmunology & immunodeficiency (IVIG/SCIG) … plus CVID, XLA, and
hypogammaglobulinemia."* So the site says it is built for immunodeficiency and, one
click later, that it has no confirmed immunology therapy.

**The fix was to add `"immunology"` to IVIG's `specialties` array** — John confirmed it,
and it is applied.

Pulmonology is empty for the same reason: after removing Leqvio (an error) and four
subcutaneous-only respiratory biologics, nothing is left. The genuine home-infusion
pulmonology class — alpha-1 antitrypsin augmentation — appears nowhere, even though
`conditions.json` seeds Alpha-1 as a pulmonology condition.

---

## 2. Greg's disease list — the whole `/diseases-we-treat` page is scaffolding

**Every one of the 16 conditions on that page is UNCONFIRMED.** They are a structural
seed drawn from the immunoglobulin indications that map onto CoreFlow's Neurology,
Immunology, Rheumatology and Dermatology rows, plus two gastroenterology entries. They
are *not* a claim. (The seed started at 19; three were removed on clinical review —
see below.)

Publishing a condition CoreFlow cannot service is the exact failure Greg raised in July,
so the page is deliberately defensive:

- `robots: noindex, nofollow`, and absent from `sitemap.xml`.
- A visible "under clinical review and is not final" notice **inside the hero, above the
  list**, not below it.
- Every per-condition action is **"Call to confirm {condition} →"** pointing at `tel:` —
  deliberately **not** a one-click referral.
- The meta description says conditions prescribers "ask us about", never "supports".

**When Greg's list lands:** replace the `conditions` array in `_data/conditions.json`
and set each `status` to `"confirmed"`. Then, in one commit: delete the
`.note-box--review` block, restore the per-condition referral CTA, drop the `robots`
line, and add the page to `sitemap.xml`. The template needs no other edit.

### Three seeded conditions were REMOVED on clinical review — tell Greg

They are recorded in `_data/conditions.json` under `_removedOnClinicalReview`. Put any
of them back only with Greg's explicit sign-off.

- **Guillain-Barré Syndrome — removed on patient-safety grounds.** GBS is an acute,
  rapidly ascending neuromuscular emergency; up to ~30% of patients need mechanical
  ventilation, and IVIG for GBS is given **inpatient** with respiratory and autonomic
  monitoring. There is no home-infusion GBS pathway. The failure mode is not commercial
  over-claim — it is a prescriber or caregiver seeing GBS on a home-infusion list and
  routing toward the home instead of the hospital. Chronic/relapsing disease is coded
  **CIDP**, which is still listed.
- **Immune Thrombocytopenia — removed.** ITP is hematology, not oncology, but there is
  no hematology row in the seven specialties, so it had nowhere correct to sit. It was
  rendering in the Oncology group beside Rituxan and Ruxience, which reads as "we treat
  ITP with rituximab" — off-label.
- **Alpha-1 Antitrypsin Deficiency — removed.** Its only treatment is weekly IV alpha-1
  augmentation, and no augmentation product exists anywhere in `_data/therapies.json`.
  The site would have named a condition whose therapy it has no record of carrying,
  under a specialty that already renders empty.

**Still open on the remaining 16 seed conditions:**
- **Dermatomyositis** and **Myositis** are listed as siblings, but myositis is the parent
  category containing dermatomyositis — and `"myositis"` is also an *alias* of
  Dermatomyositis, so one search returns both. Merge, or make Myositis the parent.
- **Stiff-Person Syndrome** and **Pemphigus & Pemphigoid**: IVIG in SPS is off-label with
  limited evidence; the combined pemphigus/pemphigoid entry implies parity when only
  pemphigus vulgaris has an on-label IV therapy on this formulary.

### ⚠ The missing hematology row

ITP, Soliris and Ultomiris were all removed or held back for the same structural reason:
**the seven-specialty model has no hematology row**, while `providers.njk` separately
publishes a **Hematology** service card (iron replacement). The taxonomy is wrong, not
merely under-populated. Greg should decide whether hematology is an eighth specialty.

---

## 3. Unresolved clinical flags — drugs held back from publication

The drug map came from an intake spreadsheet and is not clinically vetted. **Twelve
entries are marked `"status": "unconfirmed"` in `_data/therapies.json`, which means they
render nowhere on the site and are absent from the search index.** `verify-coreflow`
Check 17 fails the build if any of them reaches built HTML.

Flip a `status` to `"confirmed"` and it publishes. No template change needed.

| Drug | Why it is held back |
|---|---|
| **Simponi Aria** | The map reads "**Aria Simponi**" — transposed. Also tagged dermatology and gastroenterology; IV golimumab has neither indication (subcutaneous Simponi has the UC one, the IV does not). |
| **Leqvio** | Inclisiran, subcutaneous lipid-lowering. No immunology or pulmonology relevance — there is no outcome in which this entry becomes correct. **Recommend deleting the entry outright.** |
| **Leqembi** | Legitimate drug; confirm CoreFlow dispenses it. ARIA MRI monitoring and controlled dispensing channels make home infusion genuinely contentious. |
| **Ilumya, Xolair, Fasenra, Tezspire** | **No IV formulation exists** for any of these — all four are subcutaneous only. Omit unless CoreFlow dispenses SC. Xolair is also tagged GI with no GI indication; Ilumya is tagged GI + rheumatology when it is plaque-psoriasis only. |
| **Skyrizi, Stelara** | IV induction and SC maintenance are both real. Confirm which CoreFlow provides. |
| **Vyvgart Hytrulo** | Subcutaneous. The same route question held back the six above; this one had been missed. Note **Vyvgart** (IV) remains confirmed and published — they are genuinely distinct products. |
| **Soliris, Ultomiris** | Indications (PNH, aHUS) are **hematology**, not oncology — the oncology tag was a stand-in for a specialty row that does not exist. Both also carry a **REMS with meningococcal vaccination requirements**; the dispensing pharmacy must be REMS-certified. Confirm certification with the PIC before publishing either. |

**Also removed (claims withdrawn, not added):** `Rituxan` lost its `gastroenterology`
tag (no rituximab indication in IBD — the UC trials failed) and `IVIG` lost its
`gastroenterology` tag (no established GI indication).

**Further clinical notes raised in review, not actioned:**
- **Rituxan is tagged `neurology`**, where rituximab has no FDA indication — MS/NMOSD use
  is entirely off-label. It came from the intake map, so it was left in place. Decide
  whether to keep it as an off-label offering or drop the tag.
- **Rituxan and Ruxience carry different specialty sets** (Rituxan: dermatology,
  neurology; Ruxience: oncology, rheumatology). Biosimilar labels genuinely differ, so
  the split may be right — but nothing records *why*.
- **Briumvi and Ocrevus first-dose plausibility.** Briumvi's first dose is a 4-hour
  infusion; Ocrevus's is split 300 mg × 2 with ≥1 hour post-infusion observation.
  First-dose home administration is not standard practice. Confirm whether first doses
  happen in a facility. Ocrevus also now has an SC form (Ocrevus Zunovo) that the entry
  does not distinguish.
- **Vyepti** is overwhelmingly a clinic buy-and-bill product — confirm the channel exists.

**Missing field:** there is no `route` on any therapy. Route is the single question that
disqualified seven entries, yet no rendered card states it. Add `route` once you confirm
IV vs SC scope, and render it on the card.

---

## 4. ⚠ PARTLY RESOLVED — `providers.njk` service lines

**John removed two on 2026-09-29:** "Hydration and supportive care" (which carried the
hyperemesis gravidarum claim the clinical reviewer escalated by name) and "Hematology"
(iron replacement, with no hematology specialty row behind it). Both cards are gone.

**John removed the third on 2026-09-29: "Infectious disease".** All three unbacked
service lines are now gone. The section keeps two cards — Neuroimmunology (IVIG) and
Rheumatology and immunology — **both of which the drug data now supports**, so the page
and the finder it links to no longer contradict each other.

The scoping note-box that existed to cover the unbacked lines was simplified accordingly:
it no longer says "for the therapy areas below that it doesn't list", because there are
none.

**If infectious disease, hematology or hydration are services CoreFlow actually intends
to offer,** they need a specialty row and therapies in `_data/therapies.json` with Greg's
sign-off before the copy goes back. Re-adding the cards alone would recreate the
contradiction.

The Neuroimmunology card no longer claims SCIG or "built for high-volume immunology
prescribers"; that half was withdrawn and routed to the phone.

---

### Original finding (for the record)

`providers.njk` → "Conditions and therapies we support" advertises:

1. Neuroimmunology & immunodeficiency (IVIG/**SCIG**) — SCIG is nowhere in the data
2. **Infectious disease** — IV antibiotics/antifungals/antivirals. No ID specialty, no
   anti-infective anywhere in `_data/therapies.json`, no ID condition in `conditions.json`
3. **Hematology** — iron replacement. No hematology specialty row, no iron product
4. Rheumatology and immunology — biologics
5. **Hydration and supportive care** — hyperemesis gravidarum, post-surgical dehydration

Lines 2, 3 and 5 have **no backing in the repo's own data**, and the section now links
directly to the drug finder that cannot corroborate them.

**These were not deleted.** They are your pre-existing published business claims, and a
specialty-biologic intake map is not proof that CoreFlow can't run OPAT or hydration —
the map governs the *drug page*, not the company's whole service scope. A scoping
note-box was added instead, stating plainly what the searchable list covers and that
other therapy areas are confirmed by phone.

**You need to decide:** either those service lines are real (in which case add the
specialties and therapies to `_data/therapies.json` with Greg's sign-off), or they are
aspirational (in which case the cards should come down).

### ⚠ Escalated BY NAME: home IV hydration for hyperemesis gravidarum

`providers.njk` → "Hydration and supportive care" lists **hyperemesis gravidarum**. The
clinical reviewer flagged this as the highest-risk claim on the site and asked for it to
be raised by name rather than covered by a generic "call us" note.

Home IV hydration and home PICC lines in HG are **contested practice**. ACOG does not
endorse routine home IV hydration for hyperemesis, and the literature includes maternal
thrombotic and line-sepsis deaths associated with home HG infusion programmes. This is
materially different from listing osteomyelitis OPAT. **Decide deliberately whether
CoreFlow offers this, and if so, say so with the clinical guardrails stated.**

### What was withdrawn from `providers.njk` in this pass

The Neuroimmunology card used to read *"IVIG and SCIG for … plus CVID, XLA, and
hypogammaglobulinemia. We're built for high-volume immunology prescribers…"* while the
drug page it links to said *"We're not listing immunology therapies yet."* The unbacked
half was withdrawn and routed to the phone; the card is now "Neuroimmunology (IVIG)".
**This is a symptom of item 1 — resolving the IVIG immunology tag would let the stronger
claim come back.**

---

## 5. ✅ RESOLVED — email split, and both mailboxes are live

You chose **two roles** (2026-09-29):

- `site.email` = **info@coreflowrx.com** — public. Header, footer, JSON-LD, `/contact`,
  `/refer`, `/thanks`.
- `site.emailLegal` = **help@coreflowrx.com** — carrier-facing. Terms §3 (SMS support),
  Privacy Policy, Notice of Privacy Practices. Kept so the **A2P/10DLC registered text
  does not move**.

`verify-coreflow` Check 10 now enforces the split by route (scoped to `<main>`; the
site-wide footer carries the public address on every page, including the legal ones,
which is intended).

**John confirmed 2026-09-29: both mailboxes are live and monitored.** ✅

**One sub-item still open:** `notice-of-privacy-practices` routes HIPAA rights requests and
privacy complaints to help@, so **that mailbox will receive PHI**. It must sit on a mail
platform under a **signed BAA**, and it must **not** be the same inbox GoHighLevel
delivers contact/careers submissions into. Also worth confirming the A2P/10DLC campaign
record still matches the published Terms text.

---

## 6. ⚠ OFF-REPO — the timeframe promise almost certainly still lives in Formstack

**Only you can fix this.** Every named turnaround was removed from the website
("within one business day", "within 24 hours", the Day 1 / Days 1–3 / Days 2–5 headings,
"two business days"). `verify-coreflow` Check 13 now fails the build on any number
within five words of hour/day/week.

**That check cannot see outside the repo.** The same promise very likely still appears in:

1. **The Formstack referral workflow's confirmation screen** — the message shown after a
   referring office submits.
2. **Any auto-reply email** Formstack or the intake workflow sends.
3. Any GoHighLevel autoresponder on the contact / careers / payers forms.

Please check all three and replace any clock with a responsiveness statement. The site
now says "we acknowledge every referral promptly" and "we move fast on authorizations" —
match that language so the site and the confirmation don't contradict each other.

**✅ After-hours: resolved.** John confirmed 2026-09-29 that an on-call phone exists.
`refer.njk` now reads *"For urgent clinical matters outside business hours, call (854)
888-9070 to reach our on-call line. For a medical emergency, call 911."* — no clock, no
promise about who answers. **If the routing works differently (a separate number, a
prompt to follow, a pager), say so and I'll match the wording to it.**

---

## 7. ✅ RESOLVED — `noindex` removed from `/providers` and `/patients`

**John approved 2026-09-29.** The `robots` lines are gone from both files, both pages are
in `sitemap.xml` (`/providers` at 0.9, `/patients` at 0.8), and the now-obsolete
explanatory comments were removed. `/diseases-we-treat` remains noindex and off the
sitemap — that one is deliberate and unrelated (see §2).

### Why it was safe (for the record)

Both pages carry `robots: "noindex, nofollow"` and are absent from `sitemap.xml`. The
documented reason was containment: each page carried a **fabricated testimonial**
("Margaret R., Summerville, SC"; "Dr. James W., Rheumatology, Charleston, SC") flagged
in an HTML comment as SAMPLE / replace before launch.

**Both testimonials are now deleted**, and `verify-coreflow` Check 15 makes the markup
impossible to reintroduce — it fails the build on any `<blockquote>`, `<cite>`,
dash-attributed personal name, or 60+ character quoted passage outside a bio block.

**The stated precondition for the noindex is therefore gone.**

**Recommendation:** delete the `robots` line from `providers.njk` and `patients.njk` and
add `/providers` and `/patients` to `sitemap.xml`, in one commit.

**Reasoning:** these are two of the three primary audience pages and the prescriber
referral path. Every other page that a prescriber or patient would search for is
indexed. Leaving them out means the two highest-intent pages on the site are invisible to
search while `/careers` and `/thanks` are not.

**Why it wasn't done for you:** re-indexing is a business and SEO decision with a real
consequence, and the brief was explicit that this one is yours. An explanatory comment
was added to the front matter of both files so the next person doesn't have to
reconstruct why the noindex existed — that context was previously carried only by the
HTML comment that was deleted along with the testimonial.

---

## 8. Security-headers follow-ups

- **CSP is still `Report-Only` and has no `report-uri`/`report-to`, so it enforces
  nothing and reports nowhere — it is currently inert.** Either add a reporting endpoint
  or flip it to enforcing.
- **The last blocker to enforcing is now cleared:** the inline Plausible bootstrap moved
  into `site.js`, so `script-src 'self' https://plausible.io` no longer needs
  `'unsafe-inline'`. Built pages now contain **zero** inline `<script>` blocks (the
  JSON-LD block is `type="application/ld+json"`, which is data, not script). Verify the
  embeds load with no console violations, then flip it.
- Wildcard vendor subdomains (`https://*.formstack.com`, `https://*.leadconnectorhq.com`)
  and the unused `form-action` origins were dropped — the forms are cross-origin iframes,
  and the parent's `form-action` does not apply inside them.
- **HSTS is `max-age=86400`** — one day gives essentially no protection on a first visit
  after a week away. Raise to `31536000` once HTTPS is confirmed stable.

---

## 9. Off-repo actions only you can do (carried forward)

- **Formstack:** set the referral workflow's post-submit redirect to `/thanks`. Confirm
  the **BAA** is active. Confirm SMS/consent language on the form. **And see item 6.**
- **GoHighLevel:** the three widget IDs in `contact` / `careers` / `payers` came from the
  exec prompt — confirm they are the current live forms.
- **Cloudflare 404:** wire the built `/404.html` as the custom error page.
- **Cloudflare Access:** if enabled, add **bypass policies for `/terms` and `/privacy`**
  (carrier reviewers fetch these anonymously) and a service token for the uptime monitor.
- **workers.dev alias — permanent pre-Access checklist item, not a resolved ticket.**
  `coreflowrx.john-057.workers.dev` once served the full pre-Pass-A site (including the
  wrong fax) through an intended-down period. A `wrangler deploy`, a recreated Worker, or
  dashboard clicks can silently re-enable it. Re-verify before every Access enablement:
  `curl -sI https://coreflowrx.john-057.workers.dev | head -1` (expect 404).
- **Push the archive tag:** `git push origin archive/ghl-integration-fn`.
- **Counsel review** (from the carrier-text draft): TCPA vs the HIPAA treatment
  exemption for appointment reminders; retention periods vs SC Board of Pharmacy
  requirements; the §4 service-provider carve-out vs the actual vendor set; and
  specifically — **GoHighLevel has no BAA; Privacy §4 is only true if no PHI reaches
  it.** That boundary is now a public representation as well as a `CLAUDE.md` rule.

---

## 10. Placeholders reported, NOT filled

- **✅ RESOLVED — staff names are published.** `Dr. Greg Regan, PharmD, RPh`
  (Pharmacist-in-Charge) and `Lora Santi, BSN, RN` (Director of Nursing) are live on
  `about` and `providers`, carried in from `main`. Zero `[NAME]` placeholders remain
  sitewide. Check 4 was **inverted** to match: it used to *require* the placeholder, and
  now notes that a reappearing `[NAME]` means someone has reverted to a stale base.
  **`CRNI` is not restored** on either listing — Check 16 forbids it sitewide. Say so if
  you want that reconsidered.
- Minor: Lora's card title reads "Director of Nursing" while her bio prose says "Director
  of Infusion Nursing". Both are your wording; pick one.
- `payers.njk` — NPI, NCPDP, permit number and payer participation all read "Available
  upon request".
- **✅ PERMIT — RESOLVED 2026-09-29. John: there is no permit yet; every reference must
  say we have applied for it.** Applied. This turned out to be bigger than the number:
  the site was claiming the licence in four affirmative forms at once.

  | Where | Was | Now |
  |---|---|---|
  | footer (`site.json` `legalLine`) | "Licensed by the South Carolina Board of Pharmacy · Permit #PH-042891" | "Resident Pharmacy Permit application submitted to the South Carolina Board of Pharmacy under Reg 99-43(B) · permit not yet issued" |
  | `index` | "**We hold** a South Carolina Board of Pharmacy Resident Pharmacy Permit" | "Our application **is with** the Board … the permit **has not yet been issued**" |
  | `about` | "Resident Pharmacy Permit **issued** under Reg 99-43(B)" | "application submitted … **Permit not yet issued**" |
  | `providers` | "Resident Pharmacy Permit under Reg 99-43(B). **Permit #PH-042891**." | "application submitted … not yet issued — we will supply the number as soon as it is" |
  | `payers` hero | "a **South Carolina-licensed** specialty infusion pharmacy" | "a South Carolina specialty infusion pharmacy" |
  | `payers` licensure card + table | "**issued by** the SC Board of Pharmacy" | "application submitted … **Permit not yet issued**" |

  **New `verify-coreflow` Check 18** now fails the build on any claim of holding a permit
  or pharmacy licence, on any permit number, on `#PH-042891` specifically, and on any page
  whose `<main>` raises the Resident Pharmacy Permit without saying it is not yet issued.
  Individual licences ("Licensed by the SC Board of Pharmacy" under the
  Pharmacist-in-Charge, "licensed registered nurse", "licensed physicians") are
  deliberately allowed — a pharmacist can hold a personal licence while the pharmacy's
  permit is pending.

  **When the permit is issued:** update every row above together, relax the two rules in
  `scripts/check-licensure.mjs`, and pin the real number in place of `#PH-042891` — all in
  one commit.

---

## 11. Unverifiable claims left in place for you to confirm or retract

Neither was introduced by this pass; both are published facts only you can source.

- **✅ `about.njk` Council Capital — RESOLVED 2026-09-29.** John removed it. The sentence
  claimed a corporate relationship with a named third party and had nothing in the repo
  behind it. The preceding paragraph closes the narrative on its own.

  **This was the second named-third-party claim to come off the site in one pass** (MUSC
  was the first), so it earned a check rather than just a fix: **new Check 19** fails the
  build on the *shape* of such a claim — `joint venture with X`, `in partnership with X`,
  `backed by X`, `selected by X`, `preferred partner for X`, and any mention of `private
  equity` — whoever it names. Check 3 guards MUSC by name; Check 19 guards the pattern, so
  the next one fails the build instead of waiting for a reviewer. A genuine, authorised
  partnership must be added to that script deliberately, with the authorisation recorded
  next to it.
- **`about.njk`** — *"Jason brings over 15 years of healthcare operations and strategy
  experience, most recently as a senior leader in specialty pharmacy services."* Specific
  number plus a prior-role claim. Jason is the only publishable name on the site, which
  makes the surrounding facts higher-stakes, not lower. Confirm with him directly.

---

## 12. ⚠ UNIDENTIFIED document still in the pipeline (carried forward)

`~/Downloads/Coreflow fax cover sheet update.pdf`
SHA-256 `eb27f6efd971f80bed97da6ed826f0e699917e463626f8cbebb876a312ed1b93`, ~369 KB.

Its hash matches **neither** the defective nor the shipped cover sheet, and you confirmed
you produced only two. **Do not ship it, and do not treat newest-by-timestamp as
newest-by-intent.** Identify it before any future cover-sheet swap picks it up by
mistake. The shipped file is pinned by SHA-256 in `verify-coreflow` Check 12.

---

## 13. Decisions made in this pass — flag if you disagree

- **The MUSC check was inverted, and the old version must not be restored.** It used to
  whitelist four approved *relationship* sentences plus a `[MUSC_RELATIONSHIP_LANGUAGE]`
  token. MUSC is now permitted **only** inside an individual's bio describing where they
  previously worked. The approved-sentence list and the token are gone. Every MUSC
  mention on the site was removed — homepage proof bar, providers callout, payers card,
  and two About sections — along with the TODO comments referencing the wording.
  `verify-coreflow` Check 3/14 now fails on any MUSC outside a `bio` block, including in
  source comments.
- **`CRNI` is gone sitewide**, including from the Director of Nursing listings. Check 6
  used to list CRNI as permitted clinical terminology on prescriber/payer pages; that is
  now stale and has been corrected.
- **The homepage decorative image strip was deleted**, not just the proof bar. Two
  reviewers independently found it was the same photo shoot as the hero directly above
  it, cropped 5.14:1 so both faces were sliced, under an off-palette blue wash — carrying
  no information while pushing the first real content ~250px down the highest-traffic
  page.
- **`Vyvgart Hytrulo`, `Soliris` and `Ultomiris` were moved to unconfirmed** on clinical
  review (see item 3). If you believe any of the three is correct as published, flip the
  `status` back.
- **Check 8 now allowlists images by exact filename**, not by extension. `.eleventy.js`
  globs `*.png`/`*.jpg`, so a screenshot of an insurance card left at the repo root would
  have published silently — the same failure the PDF rule exists to prevent. Adding a new
  image now needs one line in `scripts/check-leak-allowlist.mjs`; the failure message
  prints the exact line to add.

---

# Pass: licensure announcement + em dash removal (2026-10-01, `feature/licensure-2026-10`)

## 14. ⚠ SHIPPED ERROR — the fabricated permit number `PH-042891` was live in page source

**Found 2026-10-01. Fixed in this branch. Not yet deployed.**

`#PH-042891` was never a real permit number. It was withheld from visible copy on 2026-09-29
("unconfirmed permit number"), but it **survived in an HTML comment** at `payers.njk:45-50`,
which rendered to `_site/payers.html:123` and is served to anyone who views page source.
`verify-coreflow` Check 18 passed the whole time, because it scanned `visibleText()` and
`lib-html-text.mjs` strips comments.

- **Fixed:** the comment is now a Nunjucks comment (`{#- -#}`), stripped at build. Zero hits in
  `_site/`.
- **Guarded:** new Check 20 fails the build on `PH-042891` in **raw** HTML, comments included.
- **Also corrected:** `CLAUDE.md:28` and `AGENTS.md:28` both still documented
  `legalLine (SC BoP Permit #PH-042891)` as the source of truth. These are the files an agent reads
  first, so the stale number was a live reintroduction risk.
- **Could not verify against production.** `coreflowrx.com` currently sits behind a **Cloudflare
  Access login wall** — an unauthenticated fetch 302s to `coreflowrx.cloudflareaccess.com`. So the
  live bytes could not be read to confirm how long it was exposed, or whether it still is.
  **→ John: confirm whether that Access policy is intentional. If the marketing site is meant to be
  public, it is currently gated to everyone, which is a much larger problem than the permit number.**

## 15. Entity name — "CoreFlow Rx LLC" vs "CoreFlow Specialty Infusion"

The Board licenses **CoreFlow Rx LLC**. The site brands as **CoreFlow Specialty Infusion**
(`site.name`). Every **licensure claim** now uses the Board name; the brand name is unchanged
everywhere else. No mass rename was performed.

One row was changed on judgement: `/payers` → "Legal entity name" now renders `CoreFlow Rx LLC`
rather than the brand name, because a credentialing team reading a field labelled *legal entity
name* needs the registered entity.

**→ John: is "CoreFlow Specialty Infusion" a registered trade name / DBA of CoreFlow Rx LLC?**
Nothing in the repo attests to it. If it is, a `(d/b/a …)` note on the credentialing table would be
worth adding. If it is **not**, trading publicly under an unregistered name is its own issue.

## 16. En dashes — question, not a defect

Four en dashes (U+2013) remain in site copy, **deliberately left in place**. All are correct
typography for numeric ranges:

| Location | Text |
|---|---|
| `_data/site.json:9` | `Mon–Fri, 8:30 AM – 4:30 PM ET` |
| `terms.njk:43` | `2–6 messages per month` |
| `terms.njk:43` | `1–5 messages per referral submitted` |

The `terms.njk` pair is the **A2P/10DLC message-frequency disclosure**, a carrier-required element —
changing it moves registered text.

**→ John: you said em dashes specifically. Confirm whether you want en dashes touched too.**
Check 21 explicitly does **not** cover them and carries a note not to extend it without asking.

## 17. ⚠ The published fax cover sheet PDF contains two em dashes — NOT fixed

`coreflow-fax-cover-sheet.pdf` is SHA-256-pinned (`7598d937…6012`, Check 12) and **cannot be edited
here** — any change needs regeneration and a new hash, plus re-derived geometry anchors.

Extracted text confirms **2 em dashes**, both section labels:
- `SEND TO — COREFLOW RX FAX`
- `FROM — REFERRING PRACTICE`

It also contains 2 en dashes (`8:30am – 4:30pm ET, Mon–Fri`), consistent with item 16.

**Deliberately not replaced.** Check 21 does not read PDFs and says so. **→ John: decide whether
the document gets regenerated. If so, update `EXPECTED_SHA256` and re-derive the Check 12 anchor
words and threshold in the same commit.**

## 18. Pre-launch claim flagged rather than rewritten

`non-discrimination.njk:28-33` — a Nunjucks comment stating the **Section 1557 taglines are pending
a counsel-confirmed SC top-15 language list** and "must be inserted here before launch".

This was **left alone**. It is not stale pre-launch copy that the permit issuance makes wrong — it is
a genuinely open compliance item (45 CFR Part 92 requires taglines in the top 15 languages of the
state). The comment is Nunjucks, so it does not ship. **→ Still open with counsel.**

## 19. Greg Regan's published credentials vs the Board record

Raised by the Compliance reviewer. **Pre-existing — not introduced or changed in this pass.**

| Source | Reads |
|---|---|
| Board record | `Gregory Edward Regan, PH` (supervising pharmacist) |
| `about.njk:32`, `providers.njk:87` | `Dr. Greg Regan, PharmD, RPh` — *Pharmacist-in-Charge* |

The **title** is settled and consistent sitewide: **Pharmacist-in-Charge** is South Carolina's
statutory term for the pharmacist of record, which is what the Board means by "supervising
pharmacist". No "Director of Pharmacy" exists anywhere in the repo.

What is **not** attested by the record excerpt is the credential string: the honorific "Dr.", and
the `PharmD` / `RPh` suffixes. These are published professional-credential claims.
**→ John/Greg: confirm the exact credentials as they should appear.**

## 20. Not covered by any check — carried forward

- **Formstack and GoHighLevel form copy.** Em dashes, timeframe promises and licensure wording
  inside those third-party iframes are not in `_site/` and cannot be scanned. Only John can edit them.
- **`styles.css` comments (20) and `_headers` comments (3)** still contain em dashes. Both are
  deliberate and documented in Check 21's non-coverage list — neither is ever rendered as copy.
  Note that an em dash in a `content:` pseudo-element **would** be visible copy and Check 21 would
  not catch it; there are none today.
- **Whether permit 24402 is still active.** Off-repo. Re-verify with the Board before the renewal
  window. The expiration date is deliberately unpublished (see `CHANGES-LICENSURE.md`), so nothing
  on the site goes stale on its own — but nothing on the site will warn you either.
