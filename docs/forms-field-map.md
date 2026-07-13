# Website Forms → GoHighLevel Field Map

Status: implemented on branch `forms/ghl-integration`.
GHL API details verified 2026-07-13 against the official spec repo
([GoHighLevel/highlevel-api-docs](https://github.com/GoHighLevel/highlevel-api-docs)):
base URL `https://services.leadconnectorhq.com`, `POST /contacts/upsert`
(scope `contacts.write`), `GET|POST /locations/{locationId}/customFields`
(scopes `locations/customFields.readonly`, `locations/customFields.write`),
required header `Version: 2021-07-28`, `Authorization: Bearer <Private Integration token>`.
Custom-field values are sent as `{ key, field_value }` items in `customFields[]`.

## PHI classification summary

| Form | File | PHI? | Wired to GHL? |
|---|---|---|---|
| Payer inquiry | `payers.njk` | No | Yes — `POST /api/lead` (`form: "payer"`) |
| Careers | `careers.njk` | No (explicitly excludes SSN) | Yes — `POST /api/lead` (`form: "careers"`) |
| Contact | `contact.njk` | No structured PHI (see caveat) | Yes — `POST /api/lead` (`form: "contact"`) |
| Patient referral | `refer.njk` | **YES — PHI** | **NO. Not connected. GHL has no BAA.** |

Caveat (contact form): the free-text message field could incidentally contain
health details if a patient types them. No PHI is requested, and the form is
classified non-PHI, but see the report's referral/HIPAA options for the
longer-term posture.

## 1. Payer inquiry — `payers.njk`

Source tag: `Website – Payer Inquiry` · Tag: `website-payer-inquiry`

| Form field (name) | Label | Type | Required | PHI | GHL mapping |
|---|---|---|---|---|---|
| `organization` | Organization name | text | yes | no | standard `companyName` |
| `name` | Contact name | text | yes | no | standard `name` |
| `title` | Title / Role | text | no | no | custom `contact.payer_contact_title` |
| `email` | Email address | email | yes | no | standard `email` (upsert dedupe key) |
| `phone` | Phone number | tel | no | no | standard `phone` |
| `plan_type` | Plan type | select | no | no | custom `contact.payer_plan_type` |
| `inquiry_type` | Nature of inquiry | select | no | no | custom `contact.payer_inquiry_type` |
| `message` | Message (optional) | textarea | no | no | custom `contact.payer_message` |
| `website` | (honeypot, visually hidden) | text | — | — | never sent; non-empty ⇒ submission dropped |

## 2. Careers — `careers.njk`

Source tag: `Website – Careers` · Tag: `website-careers`

| Form field (name) | Label | Type | Required | PHI | GHL mapping |
|---|---|---|---|---|---|
| `name` | Full name | text | yes | no | standard `name` |
| `email` | Email address | email | yes | no | standard `email` |
| `phone` | Phone number | tel | no | no | standard `phone` |
| `role` | Role interest | select | no | no | custom `contact.careers_role_interest` |
| `license` | Current SC license number and type | text | no | no (professional license; SSN explicitly excluded — hint kept) | custom `contact.careers_license_info` |
| `crni` | CRNI credential? | select | no | no | custom `contact.careers_crni_status` |
| `source` | How did you hear about CoreFlow? | text | no | no | custom `contact.careers_referral_source` (GHL standard `source` is reserved for the per-form source tag) |
| `message` | Brief message (optional) | textarea | no | no | custom `contact.careers_message` |
| `website` | (honeypot) | text | — | — | never sent; non-empty ⇒ dropped |

## 3. Contact — `contact.njk`

Source tag: `Website – Contact` · Tag: `website-contact`

| Form field (name) | Label | Type | Required | PHI | GHL mapping |
|---|---|---|---|---|---|
| `name` | Full name | text | yes | no | standard `name` |
| `email` | Email address | email | yes | no | standard `email` |
| `phone` | Phone number | tel | no | no | standard `phone` |
| `role` | I am a… | select | no | no | custom `contact.contact_role` |
| `message` | Message | textarea | yes | no structured PHI (see caveat above) | custom `contact.contact_message` |
| `website` | (honeypot) | text | — | — | never sent; non-empty ⇒ dropped |

## 4. Patient referral — `refer.njk` — NOT CONNECTED (PHI)

Collects: prescriber name/NPI, office info, **patient name, DOB, phone, ZIP,
diagnosis (ICD-10), therapy, insurance, clinical notes**. Patient fields are PHI.
GoHighLevel has **no signed BAA** for this account ⇒ this form must not send
data to GHL or any non-BAA endpoint. Submission remains gated (`action="#"`,
button disabled via markup comment). Options for a compliant path are in the
integration report for John's decision.

## GHL custom fields required (model: `contact`, dataType as noted)

Created by `scripts/ghl-setup-custom-fields.mjs` (idempotent). IDs are written
back here by the script once it has run with a live token.

| Name | Expected fieldKey | dataType | GHL field ID |
|---|---|---|---|
| Payer Contact Title | `contact.payer_contact_title` | TEXT | _pending — run setup script_ |
| Payer Plan Type | `contact.payer_plan_type` | TEXT | _pending_ |
| Payer Inquiry Type | `contact.payer_inquiry_type` | TEXT | _pending_ |
| Payer Message | `contact.payer_message` | LARGE_TEXT | _pending_ |
| Careers Role Interest | `contact.careers_role_interest` | TEXT | _pending_ |
| Careers License Info | `contact.careers_license_info` | TEXT | _pending_ |
| Careers CRNI Status | `contact.careers_crni_status` | TEXT | _pending_ |
| Careers Referral Source | `contact.careers_referral_source` | TEXT | _pending_ |
| Careers Message | `contact.careers_message` | LARGE_TEXT | _pending_ |
| Contact Role | `contact.contact_role` | TEXT | _pending_ |
| Contact Message | `contact.contact_message` | LARGE_TEXT | _pending_ |

Notes:
- Select inputs are stored as TEXT (the `POST /locations/{id}/customFields`
  create DTO does not accept picklist options; values arrive as plain text anyway).
- The endpoint references fields by `key`, not ID, so it works as soon as the
  fields exist. After running the setup script, confirm the actual `fieldKey`s
  match the expected keys above; if GHL generated different keys, update
  `CUSTOM_FIELD_KEYS` in `functions/api/lead.js` (the script prints a warning
  on any mismatch).
