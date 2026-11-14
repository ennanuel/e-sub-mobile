# CityView web app

The buyer web app for **CityView Park & Resort, Apo Wasa, Abuja** (developer: LCR). A realtor shares a link; the buyer sees the estate, reads the title papers, picks a plot and a plan, agrees to the terms, fills in their details and gets the offer and the accounts to pay into.

Built with Next.js 15 (App Router), React 19 and TypeScript. CSS Modules, no UI library. It runs on a built-in mock API until the backend is ready.

## Run it

```bash
npm install
cp .env.example .env.local      # defaults to the mock API
npm run dev                     # http://localhost:3000
```

Node 20.9 or newer.

| Command                       | What it does                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Development server                                                                                    |
| `npm run build` / `npm start` | Production build and server                                                                           |
| `npm run typecheck`           | TypeScript, strict                                                                                    |
| `npm run lint`                | ESLint (Next.js rules)                                                                                |
| `npm run format`              | Prettier (`format:check` only checks)                                                                 |
| `npm run check`               | Typecheck, lint, format check and build: run before every merge                                       |
| `npm run test:e2e`            | Playwright journeys on an iPhone 13 and a Pixel 7 screen (run `npx playwright install chromium` once) |

On the mock API, the email code is always **123456**.

## Plug in the backend

1. Build the endpoints in **docs/API.md**. The types are in `src/lib/api/types.ts`.
2. Set `NEXT_PUBLIC_API_MODE=live` and `NEXT_PUBLIC_API_BASE_URL=https://api.example.com`.
3. Add the API's image host to `images.remotePatterns` in `next.config.ts` if you move photos to `next/image`.

Every call goes through `src/lib/api/index.ts`. Screens never call `fetch` themselves. The live client (`client.ts`) adds the bearer token, sends JSON or multipart, and turns error responses into `ApiError` with the API's `message`, which the screens show as is. In live mode the mock code is not bundled.

Errors:

- A 404 on public data shows the not-found page; any other failure on a page shows `app/error.tsx` with **Try again**.
- A failed call on a screen shows the API's `message` next to the button, with a plain fallback for network trouble (`lib/api/errors.ts`).
- A 401 means the session ended: the app forgets the token and sends the buyer back to confirm their email. What they typed is kept.

The test suite passes against a stand-in server that follows docs/API.md in live mode, so the wiring has been checked end to end.

## The journey and its URLs

| URL                                           | Screen                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/`                                           | Redirects to `/developments/cityview`                                                 |
| `/developments/[slug]`                        | Home: the road scene. Swipe up or **Get started** turns it into the listing.          |
| `/developments/[slug]?view=listing`           | The listing: price, realtor, amenities, photos, paperwork, available units, questions |
| `/developments/[slug]/faq`                    | All questions, with search (matches in yellow) and topics                             |
| `/developments/[slug]/papers`                 | Paperwork → slide to view → email, code, name → red "View only" notice → the papers   |
| `/developments/[slug]/papers?doc=cofo`        | One paper: both plots' scans, watermarked with the viewer's name                      |
| `/developments/[slug]/plots/[plotId]?plan=12` | A plot: outright or 6, 12, 18 months; deposit, plan and closing costs                 |
| `/developments/[slug]/buy/terms`              | All the terms. The slider unlocks only after scrolling to the end.                    |
| `/developments/[slug]/buy/email`              | Email (skipped if it was confirmed earlier in this visit)                             |
| `/developments/[slug]/buy/verify`             | The 6-digit code                                                                      |
| `/developments/[slug]/buy/details`            | Basic info, More info (with ID), Next of kin                                          |
| `/developments/[slug]/buy/offer`              | "We've emailed it to you", then **Proceed to payment**                                |
| `/developments/[slug]/buy/pay`                | Amount and accounts with copy buttons, then **I've made the transfer**                |
| `/developments/[slug]/buy/thank-you`          | Thank you, {name}                                                                     |

## How the code is laid out

```
src/
  app/                    Routes only. Server pages fetch public data and hand it to a screen.
  features/
    home/                 Cover, listing, photo viewer, the cover-to-listing animation
    faq/                  Questions: answers, search highlight, map card
    papers/               Paper cards, sign-in sheet, view-only notice, viewer and watermark
    buy/                  Plot page and every buying step
  components/
    ui/                   Screen (top bar, body, sticky footer), Button, SlideToConfirm, CodeInput, fields, toast
    art/                  The road scene, the CityView logo, the map illustration (static SVG)
    icons.tsx
  lib/
    api/                  The API: types, live client, mock data and handlers
    session.tsx           Confirmed email, token and name (in memory)
    purchase.tsx          Plot, plan, agreed terms, details draft, offer (in memory)
    load.ts               Server loaders for public data (cached per request, 404 -> not-found page)
    useEmailCheck.ts      Send and confirm the email code (papers sheet and buying)
    pricing.ts, format.ts, sky.ts, layout.ts, validation.ts, image.ts, routes.ts, links.ts
tests/                    Playwright journeys
docs/API.md               The backend contract
```

### State

- **Session** (`lib/session.tsx`): the token and email from the email check, and the name from the papers sheet. Lives in React context only. A refresh or a new tab starts over; nothing goes into browser storage.
- **Purchase** (`lib/purchase.tsx`): the plot and plan, the terms version agreed, what's typed on Your details, and the offer. It sits in the development layout, so moving between the plot page and the buying steps keeps it.
- Each buying step checks for the steps before it (`features/buy/useBuyGuard.ts`). Opening a step directly, or after a refresh, sends the buyer back to the first step that is missing.

### Design

- Tokens (colours, fonts) are CSS variables in `app/globals.css`. Fonts are self-hosted from `@fontsource`.
- The app is a phone-width column (max 430 px), centred on wider screens.
- The home page and the art are drawn in 390 px design units: `var(--u)` is one design pixel, so they scale with the screen (`lib/layout.ts` has the same numbers for the animation).
- `components/art/` and the CityView logo are drawn for this estate. A second development needs its own art, or a photo in place of the road scene.
- The sky on the home page and listing follows the time in Abuja (`lib/sky.ts`): sunrise look 6 to 7am, sun up until 6pm, sunset look after.
- Motion respects "reduce motion".

## What changed from the prototype

Taken out because they were only for the demo:

- the WhatsApp notification, chat, fake receipt upload and "payment confirmed" message
- tapping NEW DEVELOPMENT to switch the sky
- fixed 2-second waits: loading states now show only while an API call runs
- "any 6 digits work": the code is checked by the API
- remembering details in the browser tab (sessionStorage)
- the device frame and zoom scaling, replaced by a responsive layout
- sample-maths prices for 500 and 1000 sqm: all sizes now use LCR's plan prices from the FAQ

Moved to the backend: the amount to pay, the pay-by date and the accounts come in the offer from `POST /applications`.

## Before launch

- Real photos, realtor and prices from the API (the mock uses the gate photo everywhere).
- Paper scans as signed, short-lived URLs from the API, not public files. `public/mock/` is sample content only.
- The open items at the end of docs/API.md: map link, amount due on a plan, Zenith Bank, development fee and corner piece, the FAQ returns answer, Terms of Service and Privacy Policy links.
- `npm audit` shows moderate advisories in dev-only lint packages; the production dependencies report none.
# e-sub-mobile
