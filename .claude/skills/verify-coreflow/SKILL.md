---
name: verify-coreflow
description: Verify CoreFlow Specialty Infusion site copy and compliance end-to-end before declaring any change done. Use after any edit to .njk pages, _data, or layout. Encodes build, accreditation, MUSC, legal, geography, voice, and render checks.
---

# Verifying CoreFlow changes

Never report a change complete based on a successful edit alone. Run **every** check below against the freshly built `_site/` output (not just the `.njk` source). If any check fails, fix the issue and rerun from Check 1 — do not hand back partially verified work.

Produce a **PASS/FAIL table by check and by page** at the end. Do not declare done until every row is PASS. The 10 primary pages are: `index`, `providers`, `patients`, `payers`, `refer`, `about`, `careers`, `contact`, `diseases-we-treat`, `drugs-we-provide`.

Most of the content checks are now **scripted**, one script per check under `scripts/`, and `npm run verify` runs the build plus all of them in order. Read the count from this file: **there are 21 checks.** Run the scripts rather than re-deriving the greps — and never merge two checks into one script, because a merged check can be passed by weakening either half.

## Check 1 — Build
Run `npx @11ty/eleventy`. Requires zero errors and zero broken templates. The site must build to `_site/`. If the build fails, nothing else can pass — fix first.

## Check 2 — No accreditation claims of any kind
**This check was INVERTED on 2026-10-01 and the previous version must not be restored.** It used to enforce the *shape* of a pursuit claim: every page mentioning URAC/ACHC had to say **pursuing**, carry **Q4 2026**, and repeat the exact disclaimer *"Accreditation has been initiated and has not yet been awarded."* **Leadership removed the accreditation pursuit from the site entirely on 2026-10-01.** CoreFlow does not hold URAC or ACHC and no longer says it is seeking them.

The old rule is now backwards — it would demand a disclaimer on copy that does not exist, and would *pass* a page that re-added "pursuing URAC accreditation" so long as the disclaimer came along.

- **FAIL** on `URAC` or `ACHC` anywhere in **raw** built HTML, comments included. Absolute rule, no allowlist.
- **FAIL**, outside `bio` blocks, on accreditation claim *shapes*: "we/CoreFlow are accredited", "dual-accredited", "accredited by/under/through", "pursuing|seeking|applying for … accreditation", "accreditation … initiated|awarded|anticipated|pending", accreditation paired with a target quarter, and programme names (`Specialty Pharmacy v5.0`, `IRX-NO797`).
  - Run: `npm run check-accreditation` (`scripts/check-no-accreditation.mjs`) — must print PASS.
- **Shapes, not the bare word, because two legitimate uses remain:** Lora Santi's bio names a prior employer ("an AAAHC-accredited surgery center") — third-party employment history, the same carve-out Check 3 makes for MUSC, and bio blocks are stripped before the shape rules run. And `privacy.njk` twice lists "legal, regulatory, accreditation, and recordkeeping obligations" as a retention category — boilerplate about what obligations *can* apply, not a status claim. Rewriting legal retention text to dodge a grep would be the wrong trade.
- **Does not cover:** state licensure (Checks 18, 20); a claim made as a logo or image; anything outside the build.
- **If the policy is reversed,** rewrite this check in the same commit as the copy.

## Check 3 — MUSC appears only in individual employment history
**This check was INVERTED on 2026-09-29 and the previous version must not be restored.** It used to whitelist four approved MUSC *relationship* sentences plus a `[MUSC_RELATIONSHIP_LANGUAGE]` token. The posture is now the opposite: MUSC is named **only** when describing where a named team member previously worked, inside that person's bio. No partnership framing, no relationship statement, no logo, no "in collaboration with", no implied affiliation. The approved-sentence list and the token are **gone** — do not reintroduce either.

- **PASS** requires every `musc` occurrence in built HTML to sit inside an element whose class list contains `bio`, and zero MUSC references in source templates (including HTML comments — that is how the last wording TODO survived three passes).
- Permitted example, inside a bio: "…most recently managing prior authorization operations for infusion services at MUSC."
- **FAIL** on anything else.
  - Run: `npm run check-musc` (`scripts/check-musc-bio-only.mjs`) — must print PASS.
- **Does not cover:** a logo or image of MUSC; an unnamed but obvious reference ("South Carolina's academic medical center"); or whether the employment history in a bio is true. Those are the Compliance reviewer's.
- **Check 19 guards the same risk generally.** Check 3 names one organisation; Check 19 catches the *shape* of a third-party relationship claim, whoever it names.

## Check 4 — Legal flags
- **Testimonials: superseded by Check 15.** The old rule here asked for an HTML-comment flag on each sample quote. Flagging a fabricated quote is no longer sufficient — as of 2026-09-29 the fabricated testimonials are **deleted** and Check 15 forbids the markup entirely. Do not re-add a "flag it" allowance.
- No placeholder credentialing data may go live. **FAIL** on: dummy `1234567890` NPI/NCPDP values, an incomplete permit number (e.g. `Permit Add #`), or garbled/placeholder payer names (e.g. `HITS, IRN, MHITS`). These must be replaced with real, confirmed values or withheld behind "available upon request".
- **Licensure is handled by Checks 18 and 20, not here.** As of 2026-10-01 the site states **no** licensure at all. Permit **24402** is real and current (issued 2026-09-30 to **CoreFlow RX, LLC**) but is deliberately unpublished; Check 20 fails the build on it *and* on the fabricated `#PH-042891`.
  - Suggested: `grep -rniE "1234567890|permit add #|HITS, IRN, MHITS" _site/`
- **Staff names: the withholding is OVER as of 2026-09-29 — this rule is inverted from its 2026-07-13 form.** John published the two real clinician names on `main`: **Dr. Greg Regan, PharmD, RPh** (Pharmacist-in-Charge) and **Lora Santi, BSN, RN** (Director of Nursing), each with a bio, alongside CEO **Jason Clapsaddle**. The old rule required a `[NAME]` placeholder in every clinician/officer listing; requiring that now would delete real published content. **There should be no `[NAME]` placeholders left in a team listing** — if one reappears, someone has reverted to a stale base (which is exactly what happened: a feature branch cut from a 10-commit-stale `main` still carried them).
  - **FAIL** if the old *fictional* names appear anywhere — they were on providers, about, AND privacy (Privacy Officer), so sweep every page, not just team sections.
  - Suggested: `grep -rniE "Sarah Mitchell|Rachel Simmons" _site/`
  - Greg Regan's bio carries the **only permitted MUSC reference on the site** — employment history inside a bio. It must stay inside an element whose class list contains `bio`, or Check 3/14 will fail it. Same for Lora Santi's.

## Check 5 — Geography guardrail
CoreFlow is filing additional state licenses; do not lock the brand to one state or name out-of-state markets publicly.

- **FAIL** if any specific out-of-state city/market is named publicly: `Charlotte`, `Chapel Hill`, `Durham`, `Augusta`, `Savannah`, `Atlanta`, etc.
- **FAIL** if the hard single-state lock language remains (e.g. `we serve one state`, `patients in 49 others`).
- **PASS**: "local", "your community", "neighbors taking care of neighbors", and factual references to serving South Carolina today are allowed.
  - Suggested: `grep -rniE "charlotte|chapel hill|durham|augusta|savannah|atlanta|49 others|serve one state" _site/`

## Check 6 — Voice
- Prescriber and payer pages **may** use clinical terminology (USP 659/1079, cold chain, taxonomy codes). **URAC and ACHC are no longer permitted anywhere** — see Check 2, which fails the build on either name. **CRNI is no longer permitted on any page** — see Check 16. Older wording listed both as allowed; that is stale.
- Patient pages must stay ~8th-grade reading level, short sentences, and keep a **human phone number visible**. FAIL if a patient page drops the phone number or drifts into jargon/bureaucratic tone.
- Overall tone across the site: expert, modern, trustworthy — never salesy, buzzword-heavy, or bureaucratic.

## Check 7 — Render integrity
For each of the 10 primary pages, open the built HTML and confirm:
- No leaked Nunjucks artifacts — no raw `{{ … }}` or `{% … %}` in the output.
  - Suggested: `grep -rnE "\{\{|\{%|%\}" _site/*.html`
  - Note: match the opening `{{`/`{%`, **not** bare `}}` — the Plausible analytics snippet legitimately contains `||{}};` (a `}}`), so grepping bare `}}` false-positives. A real leak always carries the opening `{{`/`{%`.
- No empty required sections (hero, CTA, primary body).
- All internal links resolve to a built page (no 404 targets).
- The primary conversion action — a prescriber referral CTA — is present and links correctly on Home and Providers.

## Check 8 — No internal content published (ALLOWLIST)
Eleventy's input dir is the repo root, so **every** markdown/template file renders into `_site/` unless ignored, and internal docs must never ship. Do **not** rely on a denylist of known-bad paths — a denylist only catches leaks someone already thought of, and the next internal file postdates the list (this is exactly how `AGENTS.md` and `.agents/` leaked: they were added after the old denylist was written). Instead, **allowlist** the legitimate output and FAIL on anything else, named or not.

- **Known-good routes** (the only pages that may ship — add one here *only* when you deliberately add a page): `index about accessibility careers contact diseases-we-treat drugs-we-provide non-discrimination notice-of-privacy-practices patients payers privacy providers refer terms thanks 404`.
- Run: `npm run check-leaks` (`scripts/check-leak-allowlist.mjs`) — the allowlist now lives in that script as well as here. **Keep the two in sync**; the script is what fails the build.
- **Images now pass by EXACT FILENAME too, not by extension** (added 2026-09-29). `.eleventy.js` globs `*.png`/`*.jpg`, so a screenshot of an insurance card or a payer contract left at the repo root would have published silently and passed a type-based check — the same failure mode the PDF rule exists to prevent. The `IMAGES` set in `scripts/check-leak-allowlist.mjs` is the allowlist; the failure message prints the exact line to add when a new image is deliberately published.
- **Allowed file types** (assets, governed by the passthrough globs in `.eleventy.js` — no per-file maintenance): `html css js jpg jpeg png svg ico webp gif txt xml`.
- **Allowed extensionless files** (deploy config, passthrough-copied): `_headers` (and `_redirects` if added).
- **Allowed published documents — by EXACT filename, never by extension** (PDFs are documents, not bulk assets; a bare `pdf` type would silently ship a confidential PDF left at root): `coreflow-fax-cover-sheet.pdf`. Add a filename here *and* an exact `addPassthroughCopy(...)` line in `.eleventy.js` only when you deliberately publish a new document.
- **FAIL** if any built `*.html` maps to a route not in the allowlist, or any file has an extension outside the allowed set. Past incident: `docs/CoreFlow-Copy-Review.md` shipped live at coreflowrx.com/docs/CoreFlow-Copy-Review/; the 2026-08-20 preflight caught `AGENTS.md` → `_site/AGENTS/` and `.agents/…/SKILL.md` → `_site/.agents/…/` one commit before first publish.
  - Suggested:
    ```sh
    PAGES="index about accessibility careers contact diseases-we-treat drugs-we-provide non-discrimination notice-of-privacy-practices patients payers privacy providers refer terms thanks 404"
    bad=""
    for f in $(find _site -name '*.html'); do
      route=${f#_site/}; route=${route%/index.html}; route=${route%.html}
      case " $PAGES " in *" $route "*) ;; *) bad="$bad $f" ;; esac
    done
    for f in $(find _site -type f ! -name '*.html' ! -name '*.css' ! -name '*.js' ! -name '_headers' ! -name '*.jpg' ! -name '*.jpeg' ! -name '*.png' ! -name '*.svg' ! -name '*.ico' ! -name '*.webp' ! -name '*.gif' ! -name '*.txt' ! -name '*.xml' ! -name 'coreflow-fax-cover-sheet.pdf'); do
      bad="$bad $f"
    done
    [ -z "$bad" ] && echo PASS || echo "FAIL — unexpected:$bad"
    ```
- When a leak IS found, protect the source in **whichever** of the repo's **two** ignore mechanisms fits, and — if it's a genuinely new page — add its route to `PAGES` above, in the same commit:
  - `.eleventyignore` — for directories and some root files (currently `docs/`, `.claude/`, `.agents/`, `AGENTS.md`, `scripts/`, `CLAUDE.md`).
  - `.eleventy.js` `ignores.add(...)` — for root files (currently `DESIGN-ENHANCEMENT-PROMPT.md`, `README.md`).
  There are two lists; a file is unprotected unless it is in one of them. This split is a trap — check both.

## Check 9 — Skill copies in sync
`verify-coreflow` lives at two paths so both harnesses load it: `.claude/skills/verify-coreflow/SKILL.md` (Claude Code) and `.agents/skills/verify-coreflow/SKILL.md` (Codex / AGENTS.md convention). The `.agents/` copy MUST be a symlink to the `.claude/` canonical file, or byte-identical to it. They must never diverge silently — a stale copy means one harness enforces rules the other doesn't (this happened: the copies drifted for three weeks over a Codex→Claude rebrand before the 2026-08-20 preflight caught it).

- **FAIL** if the two files differ.
  - Suggested: `diff -q .claude/skills/verify-coreflow/SKILL.md .agents/skills/verify-coreflow/SKILL.md && echo PASS || echo FAIL`

## Check 10 — Contact facts match the single source of truth
Contact facts live only in `_data/site.json` and must render identically everywhere. A wrong fax number shipped live once (a referring office faxing PHI reaches the wrong recipient) — this check exists so it cannot recur silently.

**Email is a TWO-ROLE split (John, 2026-09-29).** `site.email` = `info@coreflowrx.com` is the public support address. `site.emailLegal` = `help@coreflowrx.com` is the address already registered in the carrier-facing A2P/10DLC documents, and Terms, Privacy and the Notice of Privacy Practices must keep it so the registered text does not move. Inside `<main>`, those three routes use **only** `emailLegal` and every other route uses **only** `email`. The site-wide footer is chrome, not page content, and carries the public address on every page including the legal ones — that is intended, and the rule is scoped to `<main>` for exactly that reason. Two addresses on one site is only safe if nothing drifts, so the split is enforced rather than trusted.

- **FAIL** if any contact fact rendered into `_site/` disagrees with `_data/site.json`, or if a phone/fax-shaped string appears in built HTML that is not the value in `site.json` (i.e. a hardcoded number bypassing `{{ site.* }}`), or if either email role is used on the wrong page.
  - Run: `npm run check-contact` (`scripts/check-contact-facts.mjs`) — must print PASS.
  - **Does not cover:** whether either mailbox is monitored, or whether the A2P campaign record matches. Both are off-repo — see `docs/stage2/blockers.md`.
  - The current values are `fax (843) 279-3185`, `phone (854) 888-9070`. The retired-but-owned number `(854) 209-2494` and the stale `(843) 884-0102` must never appear.
  - Suggested:
    ```sh
    grep -rniE "854[)._ -]*209[)._ -]*2494|2092494|843[)._ -]*884[)._ -]*0102|8840102" _site/ && echo "FAIL — stale number in build" || echo PASS
    # every phone-shaped string in built HTML must be one of the site.json values
    grep -rhoE "\(8[0-9]{2}\) [0-9]{3}-[0-9]{4}" _site/*.html | sort -u
    ```
    Every line the second command prints must be a value in `site.json`.

## Check 11 — Internal link & anchor integrity
No internal link may 404 and no anchor may point at a missing id — the `#fax-cover` dead buttons and empty `action="#"` forms shipped once because nothing checked.

- **FAIL** if `node scripts/check-links.mjs` exits non-zero (dead internal link, missing fragment id, or empty `href="#"`/`action="#"`).
  - Run: `npm run check-links` (or `node scripts/check-links.mjs`) — must print PASS.
  - Also: `grep -rn 'action="#"' *.njk _includes/*.njk` must return nothing.

## Check 12 — Published document integrity (SHA-256 pin, then geometry)
For any PDF this repo publishes, **text extraction is necessary but not sufficient** — a document can extract every string perfectly and still be unreadable. The first fax cover sheet did exactly this: the physician-order box overlapped the confidentiality notice, so both were visually garbled, yet `pdftotext` read every word (they were all present, just overlapping). This defect is invisible to any text/grep check.

- **FAIL** if `python3 scripts/check-pdf-geometry.py _site/coreflow-fax-cover-sheet.pdf` exits non-zero.
  - **PRIMARY — SHA-256 pin.** The published PDF must match the known-good hash `7598d9373bae76e22d994191e3854f885a64a8561030482b9ba879c87bd76012` (branded "final" cover sheet, 2026-09-03). This is the real guard: if the hash matches, the geometry cannot have drifted at all — what ships is exactly the reviewed file. Pin/verify by **hash, not filename or timestamp** (the defective and correct cover sheets had confusingly similar names; a third "…update.pdf" of unknown provenance also existed — see blockers.md).
  - **SECONDARY — geometry.** Asserts the "CONFIDENTIALITY" notice sits clearly below the "A valid physician order" box (gap ≥ 25pt; correct ≈ 37, defective overlap ≈ 15) plus the text (correct fax, no stale numbers). This only earns its keep when the PDF is **legitimately replaced** (new hash).
  - **Scope it honestly:** the geometry check detects **one specific collision** between two named anchor words. It is **not** a general "this PDF renders correctly" check — a *different* overlap (e.g. the ENCLOSED checkboxes over the NOTES rules) passes it cleanly. A green Check 12 means "the pinned file (or a replacement whose order-box/notice separation is intact)", never "the document is visually fine."
  - **On a legitimate redesign:** update `EXPECTED_SHA256` **and re-derive the anchor words + threshold** for the new layout — the current threshold is calibrated against the current layout. Do not just re-run.
  - Requires `pdfplumber` (`python3 -m pip install pdfplumber`). The script **exits 2 and refuses to pass** if the dependency is missing — never let this check silently skip.

## Check 13 — No specific time commitments
**Rationale:** CoreFlow cannot yet honour a named turnaround, and a published clock ("within one business day") is a promise a referring office will hold us to on day one. Speed as a *quality* is fine — "fast", "without delay", "we move fast on authorizations", "we don't sit on referrals". Speed as a *clock* is not.

- **FAIL** on a number — digit or number-word — within five words of hour / day / business day / week, anywhere in the visible text of any built page.
  - Run: `npm run check-time` (`scripts/check-no-time-commitments.mjs`) — must print PASS.
- **One carve-out, by exact string, for a legal reason:** 45 CFR Part 92 (Section 1557) requires the non-discrimination grievance notice to state the period in which a complainant may file. That is a deadline the federal rule imposes on the *reader*, not a turnaround CoreFlow is promising, and deleting it would be a compliance defect. It is scoped to the one phrase so any **new** timeframe still fails. Do not widen it.
- **Does not cover:**
  - Prose that *means* "one business day" without the words — "we confirm by close of business" passes. That is the Marketing Copy reviewer's job, and it is the most likely thing to slip through.
  - **Anything outside the repo.** The Formstack confirmation screen and the referral auto-reply email are not scanned and have historically carried the same promise. Tracked in `docs/stage2/blockers.md` — only John can fix those.
  - Minutes and months, deliberately: "the infusion takes about an hour" is a clinical duration, not a turnaround.

## Check 14 — No MUSC outside bio blocks
This is Check 3's script. It is listed separately here because it runs separately; see **Check 3** for the full rule, including that it replaced the old approved-sentence list and must not be reverted.

- Run: `npm run check-musc` (`scripts/check-musc-bio-only.mjs`) — must print PASS.

## Check 15 — No fabricated testimonials or attributed quotes
**Rationale:** the providers and patients pages shipped invented quotes from invented people ("Margaret R., Summerville, SC"). A fabricated patient endorsement is not a copy problem, it is a misrepresentation. The old guard was an HTML comment asking a human to notice; this one cannot be talked out of it.

- **FAIL**, outside `bio` blocks, on: any `<blockquote>` or `<cite>`; a dash-attributed personal name ("— Dr. James W."); or a quoted run of 60+ characters.
  - Run: `npm run check-testimonials` (`scripts/check-no-testimonials.mjs`) — must print PASS.
- Two legitimate non-quote callouts formerly used `<blockquote>` and are now `.note-box` (the Privacy patient notice and the patients-page "one way to ask your doctor" script). Keep them that way — the check is absolute precisely so there is no allowlist to grow.
- **Does not cover:** a real, consented testimonial. The check cannot tell a true quote from an invented one, so it forbids the shape. When CoreFlow has a consented quote, revisit this check *deliberately*, add the markup pattern, and record the consent at the same time.
- Also not covered: a testimonial rendered as an image, or a paraphrase without quote marks ("prescribers tell us we're the easiest partner they work with").

## Check 16 — Nursing language (no CRNI, no implied employment)
**Rationale:** this one is legal exposure, not style. The nurses are **not CoreFlow employees**. Copy saying "CoreFlow nurses" or "our nurses" asserts an employment relationship that does not exist, which bears on liability, on payer representations, and on the nurses' own status. Separately, CRNI is removed everywhere it describes a nurse.

- **FAIL** on: `CRNI`; `CoreFlow nurse(s)`; `CoreFlow's nurse(s)`; `CoreFlow RN(s)`; `CoreFlow-credentialed RN(s)/nurse(s)`; `our nurse(s)`; "we employ … nurses"; "nurses we employ"; "staff/employed/in-house nurses".
  - Run: `npm run check-nursing` (`scripts/check-nursing-language.mjs`) — must print PASS.
- **Deliberately allowed:** "CoreFlow nursing partner", "our nursing partners", "credentialed nursing partners", "the nursing team caring for your patient", "the infusion nurse assigned to your patient", "experienced infusion nurses", "your nurse", and "CoreFlow's clinical standards" — standards do belong to CoreFlow; nurses do not. Note the patterns match `nurse`/`nurses` and never `nursing`.
- Choose the replacement per sentence. Do not find-and-replace one phrase across the site.
- **Does not cover:** structural implication without the words — "Meet the CoreFlow team" over a grid of nurse photos passes this and still implies employment. Compliance owns that, as a blocker not a style note. Recruiting copy on `/careers` can also imply employment with no banned phrase in it.

## Check 17 — Conditions and drugs come only from `_data/`
**Rationale:** Greg's confirmed disease list is still coming and the drug map is an unvetted intake spreadsheet, so both will be replaced wholesale. A single name typed into a template means that replacement silently half-lands — which is how a therapy CoreFlow cannot service stays published. (This check caught exactly that on its first run: the condition-search hint named two conditions in the template.)

- **FAIL** if: the rendered item set on either finder page differs from `_data/therapies.json` / `_data/conditions.json`; either finder template contains a literal drug or condition name; or any therapy marked `"status": "unconfirmed"` appears anywhere in built HTML.
  - Run: `npm run check-data` (`scripts/check-data-driven.mjs`) — must print PASS.
- **Does not cover:** whether the data is *clinically correct*. It checks provenance, not truth — a wrong drug in the JSON renders happily. That is the Clinical/Pharmacy reviewer's job and Greg's sign-off. It also does not police therapy names in ordinary prose elsewhere on the site; only the two finder templates are held to the no-literals rule.

## Check 18 — No pharmacy licensure claims of any kind
**This check has now been INVERTED TWICE.** Read the history before touching it; each version asserts the opposite of the one before, so restoring an old one publishes a false statement.

| Version | Posture |
|---|---|
| v1 (to 2026-09-30) | CoreFlow held no permit → FAIL on any claim of holding one, and on the fabricated `#PH-042891`. |
| v2 (2026-10-01) | Permit 24402 issued 2026-09-30 → FAIL on stale pre-issuance language, a published expiry, any disciplinary assertion. |
| **v3 (2026-10-01, current)** | **Leadership removed licensure from the site entirely → FAIL on any licensure reference at all.** |

**v3 is not v1 returning.** v1 said *do not claim what you do not have*. v3 says *do not discuss licensure at all*. **The permit is real and current** — SC Board of Pharmacy permit 24402, issued 2026-09-30 to CoreFlow RX, LLC. It is simply not advertised, on the reasoning that a pharmacy which is open is necessarily permitted.

- **FAIL**, over visible text, on: `Board of Pharmacy`, `pharmacy permit`, a bare `permit`, `licensure`, `Reg 99-43`, `Resident Pharmacy`, "we are licensed", "licensed … pharmacy", "state/SC-licensed".
  - Run: `npm run check-licensure` (`scripts/check-licensure.mjs`) — must print PASS.
- **Deliberately allowed — about OTHER PEOPLE, and all load-bearing copy:** "licensed physicians and other providers eligible to prescribe" (the prescriber-order gate on five pages — removing it would weaken a real control, not a marketing line); "licensed providers to submit patient referrals"; and "permitted by law" / "as permitted by HIPAA". The rule is `\bpermit\b`, which does **not** match "permitted" — that word boundary is the whole reason the HIPAA language survives, so do not loosen it to a substring.
- **Does not cover:** a permit NUMBER, including inside HTML comments — **Check 20**, which scans raw bytes and is a separate script because a merged check can be passed by weakening either half. Accreditation — Check 2. Whether permit 24402 is still current: it is unpublished, so nothing on the site goes stale, but nothing warns you either.

## Check 19 — No named third-party business relationship claims
**Rationale:** this file's own closing rule says that when the same class of problem appears twice, add a grep-able check instead of fixing the instance. This class appeared twice in a single pass. **MUSC Health** was asserted as a home infusion partner in five places (Check 3 now confines it to bios), and **Council Capital** — *"CoreFlow was established as a joint venture with Council Capital, a healthcare-focused private equity firm"* — sat on `/about` with nothing in the repo behind it, until John removed it on 2026-09-29. Both are representations **about a third party** that CoreFlow cannot make unilaterally. Check 3 guards one company by name; this one guards the shape, so the next one fails the build instead of waiting for someone to notice.

- **FAIL**, outside `bio` blocks, on the grammatical shapes such a claim takes when it names an organisation: `joint venture with X`, `in partnership with X`, `partnered with X`, `backed/funded/owned/established by X`, `selected/chosen/endorsed/trusted/approved by X`, `X selected/chose/trusts CoreFlow`, `preferred|exclusive|approved … partner for X`, and any mention of `private equity`.
  - Run: `npm run check-third-party` (`scripts/check-third-party-claims.mjs`) — must print PASS.
- **Deliberately allowed:** vendor *processing* disclosures, which the Privacy Policy requires — "hosted by Formstack under a signed BAA" is a data-handling fact, not a relationship claim.
- **Does not cover:** an unnamed but obvious reference ("South Carolina's academic medical centre"), or whether a claim is *true*. A real, authorised partnership must be added here deliberately, with the authorisation recorded alongside — that is the point of the check, not a gap in it.

## Check 20 — No permit number anywhere, raw bytes included
**Inverted 2026-10-01, hours after it was written.** The version it replaces *required* the number to be `24402` and *required* the canonical licensure sentence to be present; after the removal that version would fail the build on its own third rule.

This is the narrow mechanical backstop under Check 18. Check 18 reads visible text and forbids licensure *language*; this one reads **raw bytes** and forbids a permit *number* — the single most damaging thing to leak, because a number is what a payer or surveyor copies into a lookup.

- **FAIL** on any permit/licence number token in raw HTML ("permit #1234", "license no. 1234"), comments included.
- **FAIL by name on both known numbers**, in any spacing or casing, keyword nearby or not:
  - `24402` — **real and current**, so publishing it is not false, merely off-policy.
  - `PH-042891` — **fabricated**. Removed from visible copy 2026-09-29 and still shipped for weeks inside an **HTML comment** on `/payers.html`, because the guard of the day scanned `visibleText()` and `lib-html-text.mjs:23` strips comments. An HTML comment is served to the browser and readable in page source. **That is the entire reason this check reads raw bytes.**
  - Run: `npm run check-permit` (`scripts/check-permit-number.mjs`) — must print PASS.
- **No allowlist, deliberately.** No page may state a permit number, so there is no exception to maintain.
- **Does not cover:** licensure wording without a number (Check 18); accreditation (Check 2); PDFs — the pinned fax cover sheet contains no permit number today, but this check would not see one if a future version added it.

## Check 21 — Zero em dashes (U+2014) in built HTML and built JS
**Rationale:** a house style rule John set 2026-10-01. Mechanical, so it gets a script; worth a script because the em dash is the single easiest character to reintroduce by accident — word processors and AI-drafted copy insert them automatically.

- **FAIL** on the literal `—` **and** on `&mdash;`, `&#8212;`, `&#x2014;`. The entity forms matter: the first pass of this work removed every literal em dash and **seven `&mdash;` entities still rendered em dashes on screen**, caught only because the check scans for them.
- **Scans RAW HTML, not `visibleText()`** — deliberately. `visibleText()` strips comments, and `PH-042891` reached production inside an HTML comment precisely because comment content was never scanned. A comment is shipped to the browser and readable in page source.
- **Also scans built JS.** `finder.js` built an aria-live announcement as `specialty + " \u2014 "` — an em dash injected into the DOM at runtime and read aloud by a screen reader, which no built-HTML scan can see.
  - Run: `npm run check-em-dash` (`scripts/check-no-em-dashes.mjs`) — must print PASS.
- **Does not cover:** **PDFs** — `coreflow-fax-cover-sheet.pdf` is SHA-256-pinned (Check 12) and contains **two** em dashes in its section labels; removing them needs regeneration and a new hash (logged in `blockers.md`). The **Formstack** referral workflow and **GoHighLevel** hosted forms (third-party iframes, not in `_site/`). Form confirmation screens, auto-reply emails, SMS templates. **`_headers`** — 3 em dashes remain in its `#` comments; it is deployed as Cloudflare header config but is never rendered as copy. **`styles.css`** — 20 em dashes remain in its CSS *comments* by decision (developer notes, never rendered); a future em dash in a `content:` pseudo-element **would** be visible copy and this check would not see it.
- **EN dashes (U+2013) are explicitly NOT covered and must not be added to this check without asking John.** "2–6 messages per month" and "8:30 AM – 4:30 PM" are correct typography for numeric ranges; four remain in the build on purpose.

## Output format
Print a table: rows = the 10 primary pages, columns = Checks 1–7, cells = PASS/FAIL (with a one-line note on any FAIL). Checks 8–21 are build-level, not per-page — report each as a single PASS/FAIL line beneath the table. Add a final summary line: overall PASS only if every cell **and** all fourteen build-level checks are PASS. (**There are 21 checks total.**)

`npm run verify` runs the build plus all **14** scripted checks in order and exits non-zero on the first failure. Checks 5, 6, 7 and the human half of 4 are still judgement calls — run them by hand. (Check 2 became scripted on 2026-10-01.) A green `npm run verify` is **not** a green verify-coreflow.

## When you find a recurring issue
If the same class of problem appears twice across runs, add a new grep-able check to this file so future runs catch it automatically — improve the system, not just the instance.
