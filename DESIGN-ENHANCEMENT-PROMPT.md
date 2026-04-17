# Design Enhancement Prompt for CoreFlow Specialty Infusion Website

Copy and paste the following prompt into a new Claude thread (or Claude Code session) to get a design upgrade with images:

---

You are my front-end designer and developer. I have a complete 11-page static HTML website for CoreFlow Specialty Infusion, a home infusion pharmacy in Mount Pleasant, SC. The site is functional and the copy is final, but it looks like a wireframe — no images, no visual depth, and the design needs to feel like a premium healthcare brand, not a template.

The site files are at: `/Users/johnmoye/Downloads/coreflow rx logo/coreflow-rx/`

## What I need you to do:

### 1. Add hero images and section photography
Source royalty-free images from Unsplash (use direct Unsplash URLs as `<img src>` — they work on any hosted site). Choose images that fit a home healthcare / infusion therapy context:

- **Homepage hero**: A warm, professional image of a nurse with a patient in a home setting
- **Providers hero**: A physician at a desk or consulting — professional, clinical feel
- **Patients hero**: A patient in a comfortable home setting, receiving care or resting comfortably
- **About hero**: The Mount Pleasant / Charleston SC waterfront or Lowcountry landscape
- **Careers hero**: A nurse in scrubs, professional and approachable
- **Contact hero**: The Mount Pleasant area or a professional office exterior

For each image, use Unsplash's URL parameters to serve optimized sizes (e.g., `?w=1440&q=80`). Add `loading="lazy"` to all images below the fold.

### 2. Enhance the visual design (CSS only — don't change the HTML structure or copy)

- Add a full-width hero image treatment: background image with a navy overlay gradient so text remains readable on top
- Add subtle section dividers or background texture to break up the white space
- Add hover animations to cards (slight lift + shadow increase)
- Add a subtle gradient or pattern to the proof bar
- Improve the footer — add the stacked logo (logo-stacked-color.png) to the footer
- Make the CTA buttons slightly larger and add a subtle hover transition
- Consider adding a thin teal accent line under section titles

### 3. Add social proof / trust signals

- Add a "Trusted by MUSC Health" logo-style badge near the proof bar (use text-based treatment, not a logo file)
- Add subtle background icons or decorative elements to the cards (CSS-only, using borders or pseudo-elements)

### 4. Do NOT change:

- Any of the written copy / text content
- The company name "CoreFlow Specialty Infusion"
- Phone number (843) 884-0101 or fax (843) 884-0102
- The logo files — use them exactly as they are (logo-horizontal-color.png for header, logo-stacked-color.png for footer/OG)
- The page structure or number of pages
- Any of the form fields or navigation links

### Brand reference:

- Primary navy: #0a2540 / #1b3a5c
- Accent teal: #1f8a9a
- Highlight amber: #f0b429
- Font: System font stack (already in CSS)
- Voice: Expert, modern, trustworthy — not salesy, not corporate

### Technical constraints:

- Static HTML/CSS only — no build step, no frameworks
- Images via Unsplash CDN URLs (no local downloads needed)
- Must remain WCAG 2.1 AA accessible
- Mobile-first responsive (current breakpoints at 768px and 1024px)
- Keep Lighthouse performance score high — lazy-load below-fold images

### Deliverable:

Update the existing HTML and CSS files in place. Show me before/after of the homepage when done.

---
