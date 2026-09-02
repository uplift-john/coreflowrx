#!/usr/bin/env python3
"""Integrity check for the published fax cover sheet.

PRIMARY guard: SHA-256 pin. The published PDF must match a known-good hash. If it
matches, the document's geometry cannot have drifted at all — the hash is the real
guarantee that what ships is exactly the reviewed file.

SECONDARY guard: geometry. This only earns its keep when the document is
LEGITIMATELY REPLACED (new hash). Text extraction is necessary but NOT sufficient:
the first cover-sheet version extracted every string correctly yet was unreadable
because the physician-order box overlapped the confidentiality notice. pdftotext
can't see overlap, so we also assert POSITION.

SCOPE — read before trusting a green result: the geometry check detects ONE
specific collision, between the two named anchor words "valid" (physician-order
box) and "CONFIDENTIALITY" (notice). It is NOT a general "this PDF renders
correctly" check. A DIFFERENT overlap — e.g. the ENCLOSED checkboxes colliding
with the NOTES rules — passes this check cleanly. A green Check 12 means "the
pinned file, or a replacement whose order-box/notice separation is intact" — not
"the document is visually fine." The threshold below is calibrated against the
CURRENT layout; a genuinely redesigned cover sheet needs the anchors AND the
threshold RE-DERIVED, not just re-run, and the pinned hash updated.

    CORRECT file: "valid" top = 653.5, "CONFIDENTIALITY" top = 690.6  (gap 37.1)
    DEFECTIVE:    gap 14.8 (colliding). Ordering alone does NOT distinguish them
                  — both have CONFIDENTIALITY below valid; the discriminator is
                  the GAP magnitude.

Usage: python3 scripts/check-pdf-geometry.py [path-to-pdf]
       (defaults to the built _site/coreflow-fax-cover-sheet.pdf)
Exit: 0 PASS · 1 FAIL (integrity) · 2 dependency/usage error (fail loud, never skip).
"""
import hashlib
import re
import sys

try:
    import pdfplumber
except ImportError:
    sys.stderr.write(
        "FAIL: pdfplumber not installed — the cover-sheet geometry check cannot run.\n"
        "Install it (do NOT skip this check): python3 -m pip install pdfplumber\n"
    )
    sys.exit(2)

PDF = sys.argv[1] if len(sys.argv) > 1 else "_site/coreflow-fax-cover-sheet.pdf"

# PRIMARY assertion: the published cover sheet must be exactly this reviewed file.
# If you deliberately replace the cover sheet, update this hash AND re-derive the
# geometry anchors/threshold below for the new layout.
EXPECTED_SHA256 = "f3ac2e3e44d83459887253f354255f0430e43787ab3f1b3610fe57674599bc3b"

# SECONDARY assertion, calibrated for the CURRENT layout only:
MIN_GAP = 25.0  # correct file gap is 37.1; defective is 14.8. 25 splits them with margin.

fails = []

# --- PRIMARY assertion: SHA-256 pin. If this matches, geometry cannot have drifted. ---
try:
    with open(PDF, "rb") as fh:
        actual_sha = hashlib.sha256(fh.read()).hexdigest()
except OSError as e:
    sys.stderr.write(f"FAIL: could not read {PDF}: {e}\n")
    sys.exit(2)
if actual_sha != EXPECTED_SHA256:
    fails.append(
        f"SHA-256 mismatch (PRIMARY guard): got {actual_sha}, expected {EXPECTED_SHA256}. "
        f"If this is an INTENTIONAL replacement, update EXPECTED_SHA256 and RE-DERIVE the "
        f"geometry anchors/threshold for the new layout — do not just re-run."
    )

# --- SECONDARY assertions: text + geometry (only meaningful on a legitimate replacement) ---
try:
    with pdfplumber.open(PDF) as pdf:
        page = pdf.pages[0]
        text = page.extract_text() or ""
        words = page.extract_words()
except Exception as e:  # noqa: BLE001
    sys.stderr.write(f"FAIL: could not open/parse {PDF}: {e}\n")
    sys.exit(2)

# --- Text checks: correct fax present, retired/stale numbers absent ---
digits = re.sub(r"\D", "", text)
if "8432793185" not in digits:
    fails.append("correct fax (843) 279-3185 not found in extracted text")
for bad, label in (("8542092494", "(854) 209-2494"), ("8438840102", "(843) 884-0102")):
    if bad in digits:
        fails.append(f"stale/retired fax {label} present in the PDF")

# --- Geometry check: confidentiality notice must sit clearly BELOW the order box ---
def top_of(target):
    hits = [w for w in words if w["text"] == target]
    return hits[0]["top"] if hits else None

valid_top = top_of("valid")            # inside "A valid physician order..."
conf_top = top_of("CONFIDENTIALITY")   # confidentiality notice heading
if valid_top is None:
    fails.append('anchor word "valid" (order box) not found — layout changed unexpectedly')
if conf_top is None:
    fails.append('anchor word "CONFIDENTIALITY" (notice) not found — layout changed unexpectedly')

gap = None
if valid_top is not None and conf_top is not None:
    gap = round(conf_top - valid_top, 1)
    if gap < MIN_GAP:
        fails.append(
            f"order box and confidentiality notice are colliding: "
            f"CONFIDENTIALITY.top={round(conf_top,1)} - valid.top={round(valid_top,1)} = gap {gap} "
            f"(need >= {MIN_GAP}; correct file is ~37.1, defective overlap is ~14.8)"
        )

print(f"PDF: {PDF}")
print(f"  sha256={actual_sha}  (pinned {EXPECTED_SHA256[:12]}…)")
print(f"  valid.top={None if valid_top is None else round(valid_top,1)}  "
      f"CONFIDENTIALITY.top={None if conf_top is None else round(conf_top,1)}  gap={gap}  (min {MIN_GAP})")

if fails:
    print("FAIL — cover-sheet integrity:")
    for f in fails:
        print("  - " + f)
    sys.exit(1)
print("PASS — cover sheet: SHA-256 matches the pinned file (primary); the order-box/notice "
      "separation is intact (secondary — one specific collision only, not a full render check).")
