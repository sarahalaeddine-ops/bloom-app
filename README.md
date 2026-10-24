# Bloom — Your IVF Companion

*You are not alone in this journey.* Bloom is an AI-powered IVF companion, built as a Next.js 16 PWA that installs on iPhone like a native app. The full product spec is in [`docs/hanover/`](docs/hanover/).

## Run it

```bash
npm install
npm run dev          # http://localhost:3000  (app)
                     # http://localhost:3000/landing  (waitlist landing page)
```

### Checks

```bash
npm run lint
npm test             # unit + API route tests (Node's built-in test runner, no extra packages)
npm run build
npm run build:app    # the static app bundle for iOS/Android must build too
```

Tests live in `tests/*.test.mjs`. `tests/setup/register.mjs` lets Node resolve the app's extensionless imports and gives `lib/` a minimal `window`/`localStorage`, so pure logic and route handlers can be tested without a browser or network. CI runs all three on every pull request (`.github/workflows/ci.yml`).

### iOS and Android apps (Capacitor)

The same app ships to the App Store and Google Play as a Capacitor app (`ios/`, `android/`, `capacitor.config.ts`). Full plan, founder checklist and store texts: [`docs/sa6/app-store.md`](docs/sa6/app-store.md).

```bash
npm run build:app    # static export of the app into out/ (API calls go to NEXT_PUBLIC_API_BASE)
npm run app:sync     # build:app + copy into ios/ and android/ (npx cap sync)
npm run app:ios      # open Xcode (Mac only)
npm run app:android  # open Android Studio
npm run app:icons    # regenerate icons/splash from the Bloom mark (needs Playwright + Chromium)
```

For a store build, put `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.production.local` (public values; never server secrets). In the native app: reminders are scheduled on the phone (work with Bloom closed), the app lock can use Face ID / fingerprint, Upgrade and the demo persona are hidden, and the privacy policy (`/privacy`), support (`/support`) and account deletion (`/delete-account`) pages open on the website. Native code lives behind `lib/native.js`, which is a no-op on the web.

On the sign-in screen, tap **✦ Try the demo as Sarah** to jump straight into a fully seeded account (Stim Day 7, Antagonist, 11 follicles, E2 1,840).

### Nora AI

Nora calls Claude through a server route (`app/api/nora/route.js`), so the API key never reaches the browser.

| Env var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Enables live Nora replies. Without it Nora answers with scripted, cycle-aware demo replies. |
| `NORA_MODEL` | Optional model override (defaults to `claude-sonnet-4-6`, as in the spec). |

See [Environment variables](#environment-variables) for the full list.

Nora replies in the user's language (English, Arabic or French), both live and in demo mode.

Safety and cost controls (details in [`docs/sa6/architecture.md`](docs/sa6/architecture.md)):
- The system prompt (`buildSystemPrompt` in `lib/nora.js`, versioned by `NORA_PROMPT_VERSION`) never diagnoses or changes doses and puts an immediate clinic referral first for emergency signs (heavy bleeding, severe pain, OHSS signs, fainting, fever, thoughts of self-harm). The scripted fallback detects the same signs in all three languages, and the API returns `urgent: true` for them.
- Nora only receives the first name (none in anonymous mode) and cycle context. Profile fields are sanitised on the server. Secret Space never leaves the device.
- Per-IP rate limit (10/minute, 200/day). It is in memory, so it applies per server instance. Emergencies are never blocked.
- Automatic prompt caching, `max_tokens` 500, 20 s timeout with scripted fallback, and one log line per call with token counts only (no content).
- Prompt or model changes: re-run the evals in [`docs/sa6/nora-evals.md`](docs/sa6/nora-evals.md).

### Environment variables

All optional: with none set, Bloom builds and runs as an offline demo (the private demo page and Nora API stay locked until `DEMO_PASSWORD` is set). Put them in `.env.local` locally (see `.env.example`) and in Vercel → Project → Settings → Environment Variables for deploys.

| Env var | Secret | Purpose |
|---|---|---|
| `DEMO_PASSWORD` | Yes | Password for `/demo-7q4x` and `/api/nora` (`proxy.js`). Any username works; a cookie keeps visitors in for 30 days. Changing it signs everyone out. |
| `ANTHROPIC_API_KEY` | Yes | Live Nora replies. Without it Nora uses scripted replies. |
| `NORA_MODEL` | No | Nora model id (default `claude-sonnet-4-6`). |
| `BLOB_READ_WRITE_TOKEN` | Yes | Waitlist storage in Vercel Blob. Added automatically when a Blob store is connected. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No (public) | Turn on cloud accounts and sync. Row-level security protects the data. Never expose the service-role key. |
| `NORA_REQUIRE_AUTH` | No | `1` = live Nora (Anthropic) only for verified Supabase accounts; local/demo callers, including the web demo, get scripted offline answers. Recommended in production once the native app is live. Unset = today's behaviour. |
| `NEXT_PUBLIC_API_BASE` | No (public) | **App build only** (`npm run build:app`): the hosted site the iOS/Android app calls for `/api/*` and links to for the privacy policy. Default `https://bloomivfcompanion.com`. Leave unset on Vercel. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes, server-only** | Lets `/api/account/delete` erase a cloud account (her `auth.users` row) after verifying her session. Supabase → Project Settings → API keys (legacy `service_role` JWT or a new `sb_secret_…` key). **Never** prefix it with `NEXT_PUBLIC_`, never use it in client code. Without it, "Delete everything" in cloud mode shows an error and deletes nothing. |

**Native app build.** `npm run build:app` makes a static export of the app (only `*.app.jsx` routes: `app/layout.app.jsx`, `app/page.app.jsx`) into `out/` for Capacitor. API routes and `proxy.js` stay on Vercel; the app calls them cross-origin with her Bearer token. `/api/nora` and `/api/account/delete` send CORS headers only to `capacitor://localhost` and `https://localhost` (`lib/cors.js`), and `proxy.js` lets Bearer requests and CORS preflights to `/api/nora` through the demo gate (the route verifies the token itself). See [`docs/sa6/app-store.md`](docs/sa6/app-store.md).

To run the private demo locally: `DEMO_PASSWORD=anything npm run dev`, open http://localhost:3000/demo-7q4x and enter that password.

### Accounts, sync and security

Bloom runs in one of two modes:

| Mode | When | Where data lives |
|---|---|---|
| **Local** (default) | No Supabase env vars | This browser only. Passwords are stored as salted PBKDF2-SHA256 hashes (210k iterations), never in plain text. |
| **Cloud** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set | Supabase Auth handles accounts. App data syncs to the `user_state` table, which has row-level security so each user can only reach her own row. |

To turn on cloud mode: create a Supabase project, run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor, then set the two public env vars, plus `SUPABASE_SERVICE_ROLE_KEY` (server-only) so account deletion works. Signing out of a cloud account clears that user's health data from the device.

Server routes that act for a signed-in user (`/api/nora`, `/api/account/delete`) take her Supabase access token as `Authorization: Bearer …` and verify it with Supabase Auth on the server; they never trust a user id sent by the browser.

**Consent.** Health data only goes to the cloud (Supabase) or to Nora's AI (Anthropic) with her explicit, separate consent, asked in onboarding and changeable in the Privacy Centre. Choices are stored with a version and timestamp (`consent_events` table for cloud accounts). The wording is a draft pending legal review. If you set up cloud mode before this change, re-run `supabase/schema.sql` (it is idempotent) to add the `consent_events` table.

Whichever mode is used:
- **Secret Space is end-to-end encrypted.** Entries are encrypted in the browser with AES-256-GCM, using a key derived from the user's passphrase. Only ciphertext is stored or synced, and nobody (including Bloom) can recover it without the passphrase.
- **The app-lock PIN** is stored as a salted hash and never leaves the device.
- **Privacy Centre** lets her download her data (JSON, no password) or delete everything. In cloud mode that erases her Supabase account (email and sign-in) and synced data on the server (`/api/account/delete`), then wipes the device.

### Reminders

In the iOS/Android app, the next 7 days of reminders are scheduled as local notifications on the phone (neutral lock-screen text, no medicine names), so they arrive with Bloom closed and offline. On the web: **More → Reminders** turns on dose and appointment notifications, delivered through the service worker (`public/sw.js`), with a choice of lead time (on time, 5, 15 or 30 min). They fire while Bloom is open or in a background tab, and fall back to in-app toasts if notifications are blocked. For reminders when the app is fully closed, **Add dose alarms to my calendar** downloads an `.ics` file with a daily repeating event and alarm for every dose. The service worker already handles `push` events, ready for a push server.

### Languages

English, **Arabic (full right-to-left layout)** and French. Users can switch on the sign-in screen, during onboarding, or in Profile, and the first visit follows the browser's language. Strings live in `lib/i18n.js` (plus `lib/i18n-app.js` and `lib/i18n-more.js`), story and article translations in `lib/stories-i18n.js` and `lib/articles-i18n.js`. Every screen a user can reach is translated, including the seeded content; `npm test` fails if a component uses a key missing from any language. Kept in English on purpose: guideline titles in Sources, YouTube searches, medicine brand and protocol names.

## What's in the demo

- **Entry:** Splash (2.5s) → Sign up / Sign in → onboarding (consent, cycle details, "Meet a coach") → app.
- **Tabs:** Home (cycle hero, stats, follicle map by ovary, today's meds) · Check-in (mood, anxiety, hope, symptoms, OHSS weight alert, journal, history) · Nora AI · Insights (category filter, popular, articles) · More.
- **More:** Cycle Report (share / copy) · Medications (Today / History / Schedule + log-dose sheet) · Appointments (live countdown, add to calendar) · Charts & Trends · Two Week Wait · Coaching & support · Wellbeing Videos · Community rooms · After a Failed Cycle · Partner Space · Pregnancy Journey · Secret Space · Upgrade (paywall) · Profile.
- **Quick log (+):** tick a dose, or log mood, 13 illustrated feelings, 16 illustrated IVF symptoms and weight from any main tab, with search and logging for earlier days.
- **Home, Flo-style:** date header with a cycle calendar, daily insight tiles (stim day, sleep score, follicles, "Talk tonight"), a Sleep & rest score card with a 7-night chart, and a "My cycle" card with ⓘ explanations and a lead-follicle chart showing the typical trigger zone.
- **Your Bloom journey** (Profile, or "Change phase" on Home): switch IVF phase any time, and Home, stories and Insights adapt.
- **Insights:** search, bookmarks and carousels for your phase and what's coming next.
- **Partner Space:** you choose exactly what your partner sees, with a live "your view / their view" preview and Stop sharing.
- Home also shows a check-in streak flower and personalised daily stories.
- **Privacy Centre:** anonymous mode, PIN app lock, download my data, delete everything.
- **Medical Review Board:** every article and story shows who reviewed it, with sources and the editorial policy. The board members are placeholders until the real board is appointed.
- **Reminders** and **three languages** (see above).
- **Coaching & support:** one real professional, Tatiana F. Kutteh (Life & Relationship Coach, Beirut), listed with her permission and only facts she publishes (`COACHES` in `lib/demo-data.js`). Links go to her website, Instagram, phone and WhatsApp; Bloom takes no bookings. Her photo is `public/coaches/tatiana-kutteh.jpg`: to change it (or add a photo for another coach), drop a square JPG of at least 400×400 in `public/coaches/`, set `photo: "/coaches/<file>.jpg"` in the entry and rebuild; without it the card shows initials.
- **Community:** the seeded posts and member counts are demo content shown only to the web demo user; real accounts and the app see real posts only, with an empty state until there are some.
- **Landing page** at `/landing` with waitlist form.

All data persists in `localStorage` (`bloom_*` keys), so the demo survives reloads. **Profile → Reset demo data** clears it. No real payments are taken.

## Structure

```
app/
  layout.jsx, globals.css      fonts + PWA meta tags
  page.jsx                     public landing page + waitlist form
  demo-7q4x/page.jsx           the app: splash → auth → onboarding → app shell (password-protected)
  api/nora/route.js            Nora chat (server-side Anthropic call + scripted fallback)
  api/waitlist/route.js        waitlist sign-ups and count (Vercel Blob)
  api/account/delete/route.js  full erasure of a cloud account (verifies her session, service-role key)
proxy.js                       password gate for the demo and the Nora API (DEMO_PASSWORD)
components/
  SplashScreen, AuthScreen, OnboardingScreen, AppShell
  screens/                     Home, CheckIn, Nora, Insights, More
  screens/more/                every More sub-screen (opened via state, no routing)
  ui/                          Logo, BackBtn, Sheet, chat bubbles, LineChart,
                               Graphics (SVG art, journey ring, ovaries), Stories
lib/
  store.js                     auth (hashed local / Supabase cloud) + storage + sync
  crypto.js                    PBKDF2 hashing, AES-GCM encryption (Web Crypto)
  supabase.js                  Supabase client (cloud mode only when env vars are set)
  supabase-server.js           server-only Supabase Auth/REST calls (verify token, own row, admin delete)
  api.js                       browser calls to Bloom's API routes with the user's access token
  reminders.js                 reminder scheduler, notifications, .ics dose alarms
  i18n.js, stories-i18n.js     English / Arabic / French
  cycle.js                     med log, check-ins, cycle dates
  demo-data.js                 all seeded demo content
  nora.js                      Nora system prompt, emergency detection, offline replies
  rate-limit.js                in-memory per-IP rate limiter for API routes
  validate.js                  shared input validation (email)
public/manifest.json, apple-touch-icon.png, icon.svg, sw.js
supabase/schema.sql            cloud table + row-level security
tests/                         node --test suites (npm test)
scripts/nora-evals.mjs         runs the Nora eval prompts against a dev server
docs/sa6/                      architecture record, Nora evals
.github/workflows/ci.yml       lint, test, build on every PR
```

Tailwind CSS v3 with the `bloom` palette in `tailwind.config.js`. Deploy on Vercel.

## Agents

- **sa4** (`.claude/agents/sa4.md`) builds features and flows from the Hanover spec.
- **sa5** (`.claude/agents/sa5.md`) is the designer and enhancement advisor. It benchmarks Bloom against Flo and owns the graphics. See `docs/sa5/flo-benchmark.md` for the recommendation backlog.
- **sa6** (`.claude/agents/sa6.md`) owns the technical architecture, AI features, security and CI. See `docs/sa6/architecture.md` and `docs/sa6/nora-evals.md`.
