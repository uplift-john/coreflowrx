// Shared helpers for the built-HTML content checks. Kept in one place so every
// check reads the same text the way a browser would present it — attribute
// values, <script> payloads and JSON-LD are NOT page copy and must never be
// scanned as if they were.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const SITE = "_site";

export function builtPages() {
  return readdirSync(SITE)
    .filter((f) => f.endsWith(".html"))
    .sort()
    .map((file) => ({ file, html: readFileSync(join(SITE, file), "utf8") }));
}

/** Strip <script>/<style> blocks and all tags, leaving visible text. */
export function visibleText(html) {
  return decode(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function safeChar(code) {
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff
    ? String.fromCodePoint(code)
    : " ";
}

// Numeric entities are decoded generally: &#8220; is exactly how a curly-quoted
// fabricated testimonial would slip past a named-entity-only decoder.
// &amp; is decoded LAST so "&amp;#8220;" never becomes a live entity.
function decode(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => safeChar(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => safeChar(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

// Void elements never have a closing tag. Matching one by class and then hunting
// for </img> is what made stripBlocks() swallow the rest of the document.
const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/**
 * Remove every element whose class list contains `className`, contents included.
 * Depth-aware over the element's own tag name, so a nested <div> inside a bio
 * block does not end it early.
 *
 * SAFETY: this feeds the MUSC and testimonial guards, so silent over-removal
 * here blinds them. Two rules earn their keep:
 *   • A void element (<img class="bio-photo">) is removed as itself and nothing
 *     more. Previously the depth scan hunted a closing tag that can never exist,
 *     fell through, and returned everything BEFORE the tag — discarding the rest
 *     of the document. One <img class="bio-photo"> in a header would have made
 *     both guards pass on a page carrying an explicit MUSC partnership claim and
 *     a fabricated testimonial.
 *   • Genuinely unbalanced markup THROWS rather than returning a truncated
 *     document. A check that cannot see the whole page must fail loudly.
 */
export function stripBlocks(html, className) {
  const open = new RegExp(
    `<(\\w+)\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`,
    "i"
  );
  // Blank comments FIRST, length-preservingly. A commented-out tag inside a bio
  // card ("<!-- <div class=\"card__photo\"> headshot pending -->") pushed the depth
  // counter to 2, so the scan ran past the bio's real </div> and swallowed the
  // rest of the wrapper WITHOUT throwing — the same silent-pass class as the void
  // element bug, reached a different way. Nothing is lost by blanking: MUSC in a
  // source comment is caught separately by check-musc-bio-only against the .njk.
  let out = html.replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));
  for (let guard = 0; guard < 10000; guard++) {
    const m = out.match(open);
    if (!m) return out;
    const tag = m[1].toLowerCase();
    const start = m.index;
    const afterOpen = start + m[0].length;

    if (VOID.has(tag) || m[0].endsWith("/>")) {
      out = out.slice(0, start) + " " + out.slice(afterOpen);
      continue;
    }

    let depth = 1;
    let end = -1;
    const scan = new RegExp(`</?${tag}\\b`, "gi");
    scan.lastIndex = afterOpen;
    let hit;
    while ((hit = scan.exec(out))) {
      depth += hit[0][1] === "/" ? -1 : 1;
      if (depth === 0) {
        end = out.indexOf(">", hit.index) + 1;
        break;
      }
    }
    if (end <= 0) {
      throw new Error(
        `stripBlocks: <${tag} class="…${className}…"> is never closed. Refusing ` +
          `to scan a truncated document — fix the markup, because this would ` +
          `silently blind the MUSC and testimonial checks.`
      );
    }
    out = out.slice(0, start) + " " + out.slice(end);
  }
  throw new Error(
    "stripBlocks: too many matching blocks — aborting rather than scanning partially."
  );
}

export function report(name, problems) {
  if (problems.length) {
    console.error(`FAIL — ${name}:`);
    for (const p of problems) console.error("  - " + p);
    process.exit(1);
  }
  console.log(`PASS — ${name}.`);
}
