# CityView API contract

What the web app expects from the backend. Every call is made from one file, `src/lib/api/index.ts`, and the shapes are typed in `src/lib/api/types.ts`. The mock in `src/lib/api/mock/` answers the same calls with sample data, so the app runs before the backend exists.

## Conventions

- Base URL: `NEXT_PUBLIC_API_BASE_URL` (no trailing slash). Set `NEXT_PUBLIC_API_MODE=live` to use it.
- JSON in and out, except file uploads (multipart).
- Money is in naira, as whole numbers (`8400000`). Dates are ISO 8601 strings.
- Phone numbers are E.164 (`+2348031234567`).
- Calls marked **Auth** send `Authorization: Bearer <token>`. The token comes from `POST /auth/verify`.
- Errors: any non-2xx status with this body. The app shows `message` to the person, so write it for them.

```json
{ "message": "That code is not right. Check it and try again.", "code": "invalid_code" }
```

| Status | When                                     | `code` the app expects                          |
| ------ | ---------------------------------------- | ----------------------------------------------- |
| 400    | Bad input, wrong code                    | `invalid_email`, `invalid_code`, `invalid_plan` |
| 401    | Token missing or expired                 | `unauthorised`                                  |
| 404    | Unknown development, plot or application | `not_found` (pages show the 404 screen)         |
| 413    | Upload too big                           | `file_too_large`                                |

- CORS: the browser calls the API directly for everything after the first page, so allow the web app's origin, the `Authorization` and `Content-Type` headers, and `GET, POST, OPTIONS`.
- The listing, FAQ, terms and plot pages are rendered on the server, which calls the API from Node. Those calls need no token.

## Public (no token)

### `GET /developments/{slug}` → `Development`

Everything on the home page, listing and plot page.

```json
{
  "slug": "cityview",
  "name": "CityView",
  "fullName": "CityView Park & Resort",
  "area": "Apo, Abuja",
  "address": "Apo Wasa, Abuja",
  "description": "A new gated estate in Apo…",
  "startingPrice": 8400000,
  "realtor": { "name": "Gbemileke Peters", "role": "Realtor", "phone": "+2348030000000", "photoUrl": "https://…" },
  "amenities": [{ "label": "Gated entrance", "icon": "gate" }],
  "photos": [{ "url": "https://…", "title": "The gate", "caption": "Gatehouse and barrier" }],
  "paperwork": {
    "summary": "C of O, survey plan, offer of statutory right of occupancy",
    "documents": [{ "id": "rofo", "label": "FEDERAL CAPITAL TERRITORY", "title": "Right of Occupancy" }]
  },
  "plots": [
    {
      "id": "200-res",
      "sizeSqm": 200,
      "use": "Residential",
      "outrightPrice": 8400000,
      "deposit": 1000000,
      "plans": [
        { "months": 6, "total": 9400000 },
        { "months": 12, "total": 10400000 },
        { "months": 18, "total": 11400000 }
      ]
    }
  ],
  "closingCosts": { "surveyFee": 1000000, "legalFee": 500000 },
  "mapsUrl": "https://maps.app.goo.gl/…"
}
```

- `amenities[].icon` is one of `gate`, `shield`, `road`, `lamp`, `drain`, `leaf`.
- `plans[].total` is the full plan amount, deposit included. A plot with no plans is outright only.
- `paperwork.documents[].id` is one of `rofo`, `survey`, `cofo` (the app picks the card colour from it).
- `realtor` is whoever shared the link. If links carry a realtor code (e.g. `?ref=`), return that realtor here.

### `GET /developments/{slug}/faq` → `Faq`

```json
{
  "featuredCount": 6,
  "items": [
    {
      "id": "where",
      "category": "The estate",
      "question": "Where is CityView, Apo Wasa?",
      "answer": [{ "type": "paragraph", "text": "Apo Wasa, in AMAC…" }, { "type": "map" }]
    }
  ]
}
```

- The first `featuredCount` items show on the listing. The rest are on the FAQ page.
- `category` is one of `Prices`, `Papers`, `Building`, `The estate`.
- Answer blocks: `paragraph {text}`, `list {items[]}`, `table {head?[], rows[][]}`, `note {text}`, `map` (draws the map card that opens `mapsUrl`). Plain text only: the app never renders HTML from the API.

### `GET /developments/{slug}/terms` → `Terms`

```json
{ "version": "2026-11-12", "sections": [{ "title": "Payment", "clauses": ["All payments are made to LCR LIMITED.", "…"] }] }
```

The buyer must scroll to the end and slide to agree. The `version` they agreed to is sent with the application.

## Email check

### `POST /auth/email-code`

Body `{ "email": "ada@example.com" }` → `{ "resendAfterSeconds": 45 }`

Emails a 6-digit code. The app shows "Resend in 0:45" and then a "Resend code" link that calls this again.

### `POST /auth/verify`

Body `{ "email": "ada@example.com", "code": "123456" }` → `{ "token": "…", "email": "ada@example.com" }`

Wrong code: 400 `invalid_code`. The token is kept in memory only (a refresh signs the person out), and it is used for everything below. Mock: the only code that works is `123456`.

## Title papers (Auth)

### `GET /developments/{slug}/papers` → `Paper[]`

```json
[
  {
    "id": "cofo",
    "label": "CERTIFICATE OF OCCUPANCY",
    "title": "C of O",
    "pages": [
      { "plotNumber": "9142", "area": "19.65 ha", "imageUrl": "https://…signed…" },
      { "plotNumber": "9143", "area": "31.37 ha", "imageUrl": "https://…signed…" }
    ]
  }
]
```

These scans are confidential. Return short-lived signed URLs, ideally with the viewer's name burnt into the image as well. The app draws a watermark (name · VIEW ONLY · time) over each scan and blocks right-click and drag, but a screenshot can't be prevented in a browser.

## Buying (Auth)

### `POST /files` (multipart) → `{ "fileId": "…" }`

Fields: `file` (image or PDF, ≤ 10 MB), `kind` = `passport_photo` | `id_front` | `id_back`.

Uploaded as soon as the person picks a file. Photos are shrunk in the browser first (passport 360 × 360, ID up to 900 px). The ID type is not asked for: read it from the file.

### `POST /applications` → `Offer`

```json
{
  "developmentSlug": "cityview",
  "plotId": "200-res",
  "months": 12,
  "termsVersion": "2026-11-12",
  "buyer": {
    "passportPhotoFileId": "f-1",
    "firstName": "Tobi",
    "middleName": "…",
    "lastName": "Adeyemi",
    "gender": "Male",
    "phone": "+2348034127790",
    "altPhone": "+234…",
    "nationality": "Nigerian",
    "countryOfResidence": "Nigeria",
    "dateOfBirth": "1990-04-02",
    "maritalStatus": "Married",
    "homeAddress": "14 Admiralty Way, Lekki",
    "occupation": "…",
    "employer": "…",
    "workAddress": "…",
    "idFrontFileId": "f-2",
    "idBackFileId": "f-3",
    "nextOfKin": {
      "fullName": "Ada Adeyemi",
      "relationship": "Spouse",
      "phone": "+2348031112222",
      "altPhone": "…",
      "email": "…",
      "address": "…"
    }
  }
}
```

- `months`: `0` for outright, or `6`, `12`, `18`.
- Required: first and last name, phone, home address, `idFrontFileId`, and next of kin's name, relationship and phone. Everything else may be missing.
- Names are stored as typed (first letter capitalised). They go on the title documents, so changing them later costs ₦200,000.
- `relationship`: `Spouse`, `Parent`, `Sibling`, `Child`, `Friend`. `maritalStatus`: `Single`, `Married`, `Other`.

Response, and the email with the offer goes out to the confirmed address:

```json
{
  "applicationId": "app-123",
  "emailedTo": "tobi@example.com",
  "plot": { "sizeSqm": 200, "use": "Residential" },
  "months": 12,
  "payBy": "2026-11-22T00:00:00Z",
  "firstPayment": 1000000,
  "balance": 9400000,
  "balanceDueBy": "2027-11-01T00:00:00Z",
  "amountDue": 2500000,
  "accountName": "LCR LIMITED",
  "accounts": [{ "bank": "GTBank", "accountNumber": "0885375920" }]
}
```

- Plan: `firstPayment` is the deposit; `balance` and `balanceDueBy` are set.
- Outright: `firstPayment` is the price; `totalWithClosingCosts` is set instead of `balance`.
- `amountDue` is what the account page tells them to transfer now. **Decide with LCR:** the prototype asks for deposit plus closing costs on a plan (₦2.5M on 200 sqm); the earlier WhatsApp message asked for the deposit only (₦1M). The mock does deposit plus closing costs.

### `POST /applications/{id}/transfer-notice` → `{ "status": "awaiting_confirmation" }`

Sent when the buyer taps "I've made the transfer". LCR then checks the accounts, confirms the payment and emails the receipt. That part happens outside the app.

## Open items for the backend and LCR

- The exact Google Maps link for the site (`mapsUrl`). The mock searches by name.
- `amountDue` on a plan: deposit only, or deposit plus closing costs.
- Zenith Bank (1229245371) is in LCR's PDF but not in the accounts list.
- Development fee (₦10,000 per sqm) and corner piece (₦2M) are not part of the offer yet.
- The FAQ's "100% returns within 12 months" answer is left out until LCR signs it off.
- Links for Terms of Service and Privacy Policy (`src/lib/links.ts`).
