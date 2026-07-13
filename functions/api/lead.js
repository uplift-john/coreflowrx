/**
 * Cloudflare Pages Function: POST /api/lead
 *
 * Receives website form submissions (payer inquiry, careers, contact) and
 * upserts a contact into GoHighLevel (LeadConnector) API v2.
 *
 * SAFETY — PHI / HIPAA:
 *   GoHighLevel has NO signed BAA for this account. Only the three NON-PHI
 *   forms may post here. The patient referral form (refer.njk) collects PHI
 *   and MUST NOT be pointed at this endpoint or any non-BAA service.
 *
 * Secrets (never hardcode, never commit):
 *   GHL_TOKEN       — Private Integration token (scopes: contacts.write,
 *                     locations/customFields.readonly, locations/customFields.write)
 *   GHL_LOCATION_ID — GHL sub-account (location) ID
 *   Local dev: .dev.vars (git-ignored). Production: Cloudflare Pages secrets.
 *
 * API details verified against GoHighLevel/highlevel-api-docs (2026-07-13):
 *   POST https://services.leadconnectorhq.com/contacts/upsert
 *   Headers: Authorization: Bearer <token>, Version: 2021-07-28
 *   customFields items: { key, field_value }
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

const MAX_FIELD_LEN = 500;
const MAX_MESSAGE_LEN = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Custom field keys expected in GHL (created by scripts/ghl-setup-custom-fields.mjs).
// If GHL generated different fieldKeys, update them here — see docs/forms-field-map.md.
const FORMS = {
  payer: {
    sourceTag: "Website – Payer Inquiry",
    tag: "website-payer-inquiry",
    required: ["organization", "name", "email"],
    standard: { organization: "companyName" },
    custom: {
      title: "contact.payer_contact_title",
      plan_type: "contact.payer_plan_type",
      inquiry_type: "contact.payer_inquiry_type",
      message: "contact.payer_message",
    },
  },
  careers: {
    sourceTag: "Website – Careers",
    tag: "website-careers",
    required: ["name", "email"],
    standard: {},
    custom: {
      role: "contact.careers_role_interest",
      license: "contact.careers_license_info",
      crni: "contact.careers_crni_status",
      source: "contact.careers_referral_source",
      message: "contact.careers_message",
    },
  },
  contact: {
    sourceTag: "Website – Contact",
    tag: "website-contact",
    required: ["name", "email", "message"],
    standard: {},
    custom: {
      role: "contact.contact_role",
      message: "contact.contact_message",
    },
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function clean(value, max = MAX_FIELD_LEN) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function splitName(full) {
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { firstName: full, lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function parseBody(request) {
  const type = (request.headers.get("content-type") || "").toLowerCase();
  if (type.includes("application/json")) {
    return { data: await request.json(), isJson: true };
  }
  if (
    type.includes("application/x-www-form-urlencoded") ||
    type.includes("multipart/form-data")
  ) {
    const fd = await request.formData();
    const data = {};
    for (const [k, v] of fd.entries()) if (typeof v === "string") data[k] = v;
    return { data, isJson: false };
  }
  return { data: null, isJson: false };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let parsed;
  try {
    parsed = await parseBody(request);
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400);
  }
  const { data, isJson } = parsed;
  if (!data || typeof data !== "object") {
    return json({ ok: false, error: "Unsupported request body." }, 400);
  }

  const formType = clean(data.form);
  const form = FORMS[formType];
  if (!form) return json({ ok: false, error: "Unknown form." }, 400);

  // Honeypot: hidden "website" field must be empty. Pretend success to bots.
  if (clean(data.website)) {
    return isJson ? json({ ok: true }) : redirectThanks(request);
  }

  // Validate
  const fields = {};
  for (const key of Object.keys(data)) {
    if (key === "form" || key === "website") continue;
    fields[key] = clean(data[key], key === "message" ? MAX_MESSAGE_LEN : MAX_FIELD_LEN);
  }
  for (const req of form.required) {
    if (!fields[req]) return json({ ok: false, error: "Please fill in all required fields." }, 422);
  }
  if (!EMAIL_RE.test(fields.email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 422);
  }

  // Build GHL upsert payload — allowlisted fields only.
  const { firstName, lastName } = splitName(fields.name || "");
  const customFields = [];
  for (const [formField, ghlKey] of Object.entries(form.custom)) {
    if (fields[formField]) customFields.push({ key: ghlKey, field_value: fields[formField] });
  }
  const payload = {
    locationId: env.GHL_LOCATION_ID,
    name: fields.name || undefined,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    email: fields.email,
    phone: fields.phone || undefined,
    source: form.sourceTag,
    tags: [form.tag],
    customFields,
  };
  for (const [formField, ghlField] of Object.entries(form.standard)) {
    if (fields[formField]) payload[ghlField] = fields[formField];
  }

  // Dry-run when secrets are not configured (local dev without token).
  if (!env.GHL_TOKEN || !env.GHL_LOCATION_ID) {
    console.log("[lead] DRY RUN (GHL_TOKEN/GHL_LOCATION_ID not set). Payload:", JSON.stringify(payload));
    return isJson ? json({ ok: true, dryRun: true }) : redirectThanks(request);
  }

  try {
    const resp = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GHL_TOKEN}`,
        Version: GHL_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      // Log details server-side only; never leak upstream internals to the client.
      const detail = await resp.text().catch(() => "");
      console.error(`[lead] GHL upsert failed: ${resp.status} ${detail.slice(0, 500)}`);
      return json({ ok: false, error: "We couldn't submit your request. Please call us instead." }, 502);
    }
    const result = await resp.json().catch(() => ({}));
    console.log(`[lead] GHL upsert ok. form=${formType} new=${result.new === true} id=${result.contact && result.contact.id}`);
  } catch (err) {
    console.error("[lead] GHL request error:", err && err.message);
    return json({ ok: false, error: "We couldn't submit your request. Please call us instead." }, 502);
  }

  return isJson ? json({ ok: true }) : redirectThanks(request);
}

// No-JS fallback: browsers posting url-encoded forms get a redirect to a
// static thank-you page instead of raw JSON.
function redirectThanks(request) {
  const url = new URL(request.url);
  return Response.redirect(`${url.origin}/thanks.html`, 303);
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "Method not allowed." }, 405);
}
