# Asset manifest

What ships, what is orphaned, and what new image slots this pass opened.
Last updated 2026-09-29 (`feature/post-review-2026-09`).

## New image slots opened by this pass

**None.** The two new pages (`/diseases-we-treat`, `/drugs-we-provide`) are deliberately
text-and-data only. No hero photo, no icons beyond inline SVG, no illustration. A
prescriber checking "can you take this patient?" is mid-task; every element either helps
them find the answer faster or gets out of the way, and a decorative hero would push the
search field further down a page whose whole job is that field. If you later want a hero
on either page, note the measurement in `CHANGES-POST-REVIEW.md`: the diseases search
field is currently 0.89 screenfuls down at 375px, and anything above it is spent budget.

## One asset REMOVED from use

| File | Was | Now |
|---|---|---|
| `hero-home.jpg` | homepage decorative strip under the hero | **no longer referenced** |

Deleted because it was the same photo shoot as `hero-home-infusion.jpg` directly above
it, cropped to 5.14:1 so both faces were sliced through, under a hardcoded
`rgba(70,126,154,…)` wash that is not a brand token. It carried no information
(`aria-hidden`, `alt=""`) while pushing the first substantive content ~250px down the
site's highest-traffic page.

The file still passes through to `_site/` because it is on the Check 8 image allowlist.
It is ~84 KB of dead payload. **Decide:** either drop it from
`scripts/check-leak-allowlist.mjs` and let Check 8 fail the build (which will tell you to
also remove the source file), or leave it and note why.

## Currently shipped images

`.eleventy.js` globs `*.jpg`/`*.png`/`*.svg`, so **everything in the repo root ships**.
Since 2026-09-29, Check 8 additionally requires each image to be on an exact-filename
allowlist in `scripts/check-leak-allowlist.mjs` — the same discipline PDFs already had,
because a screenshot of an insurance card or a payer contract left at the repo root
would otherwise publish silently and pass a type-based check.

**Adding an image now takes one line in that script.** The failure message prints the
exact line to add.

| File | Size | Used by |
|---|---|---|
| `hero-home-infusion.jpg` | 200 KB | `index` hero (`hero__image`) |
| `hero-providers.jpg` | 94 KB | `providers` photo hero |
| `hero-patients.jpg` | 96 KB | `patients` + `careers` photo heroes |
| `hero-about.jpg` | 113 KB | `about` photo hero |
| `accent-iv-care.jpg` | 102 KB | `patients` image strip |
| `coreflow-horizontal-logo.png` | 64 KB | header logo (`site.logo`, 730×200) |
| `logo-stacked-color.png` | 111 KB | `site.ogImage` (social cards) |
| `favicon.svg` | 38 KB | favicon + apple-touch-icon |
| `coreflow-fax-cover-sheet.pdf` | 274 KB | 4 download buttons; SHA-256 pinned by Check 12 |

### Shipped but unreferenced (~937 KB)

| File | Size | Note |
|---|---|---|
| `hero-home.jpg` | 84 KB | orphaned by the strip deletion — see above |
| `accent-iv-bags.jpg` | 85 KB | unused |
| `accent-iv-drip.jpg` | 207 KB | unused |
| `logo-horizontal-black.png` | 120 KB | brand variant, plausibly deliberate |
| `logo-horizontal-color.png` | 140 KB | brand variant |
| `logo-horizontal-gray.png` | 133 KB | brand variant |
| `logo-stacked-transparent.png` | 168 KB | brand variant |

The four logo variants are plausibly intentional (brand-kit downloads). The three
`hero-home` / `accent-iv-*` files are dead payload. `_site/` totals ~2.4 MB.

## Image conventions

- **Decorative images take `alt=""`** and sit in an `aria-hidden` wrapper.
- **Content images take descriptive alt text.** The homepage hero alt was changed in this
  pass from "A CoreFlow nurse starts a home infusion…" to "An infusion nurse starts a home
  infusion…" — Invariant 4b applies to alt text, and Check 16 now scans `alt`,
  `aria-label` and `title` precisely because that instance had slipped through.
- **The logo carries intrinsic `width`/`height`** (730×200 from `site.logoWidth`/
  `logoHeight` in `_data/site.json`) with `width:auto` in CSS, so it scales by height
  across breakpoints while the attributes prevent layout shift.
- **No image is referenced by a hardcoded path in a template** where a `site.*` value
  exists — the logo comes from `site.logo`, the social card from `site.ogImage`.
