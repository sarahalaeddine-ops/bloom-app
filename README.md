# Bloom — Your IVF Companion

*You are not alone in this journey.* Bloom is an AI-powered IVF companion, built as a Next.js 16 PWA that installs on iPhone like a native app. The full product spec is in [`docs/hanover/`](docs/hanover/).

## Run it

```bash
npm install
npm run dev          # http://localhost:3000  (app)
                     # http://localhost:3000/landing  (waitlist landing page)
```

On the sign-in screen, tap **✦ Try the demo as Sarah** to jump straight into a fully seeded account (Stim Day 7, Antagonist, 11 follicles, E2 1,840).

### Nora AI

Nora calls Claude through a server route (`app/api/nora/route.js`), so the API key never reaches the browser.

| Env var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Enables live Nora replies. Without it Nora answers with scripted, cycle-aware demo replies. |
| `NORA_MODEL` | Optional model override (defaults to `claude-sonnet-4-6`, as in the spec). |

Put them in `.env.local` locally (see `.env.example`), and in Vercel → Project → Settings → Environment Variables for deploys.

Nora replies in the user's language (English, Arabic or French), both live and in demo mode.

### Accounts, sync and security

Bloom runs in one of two modes:

| Mode | When | Where data lives |
|---|---|---|
| **Local** (default) | No Supabase env vars | This browser only. Passwords are stored as salted PBKDF2-SHA256 hashes (210k iterations), never in plain text. |
| **Cloud** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set | Supabase Auth handles accounts. App data syncs to the `user_state` table, which has row-level security so each user can only reach her own row. |

To turn on cloud mode: create a Supabase project, run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor, then set the two env vars. Signing out of a cloud account clears that user's health data from the device.

Whichever mode is used:
- **Secret Space is end-to-end encrypted.** Entries are encrypted in the browser with AES-256-GCM, using a key derived from the user's passphrase. Only ciphertext is stored or synced, and nobody (including Bloom) can recover it without the passphrase.
- **The app-lock PIN** is stored as a salted hash and never leaves the device.
- **Privacy Centre** lets her download her data (JSON, no password) or delete everything, which also deletes her cloud row.

### Reminders

**More → Reminders** turns on dose and appointment notifications, delivered through the service worker (`public/sw.js`), with a choice of lead time (on time, 5, 15 or 30 min). They fire while Bloom is open or in a background tab, and fall back to in-app toasts if notifications are blocked. For reminders when the app is fully closed, **Add dose alarms to my calendar** downloads an `.ics` file with a daily repeating event and alarm for every dose. The service worker already handles `push` events, ready for a push server.

### Languages

English, **Arabic (full right-to-left layout)** and French. Users can switch on the sign-in screen, during onboarding, or in Profile, and the first visit follows the browser's language. Strings live in `lib/i18n.js` and story translations in `lib/stories-i18n.js`. The core app is translated: sign-in, onboarding, Home, Quick log, Check-in, More, Nora, Insights, stories and the review badge. Article bodies and the deeper More screens are still English for now.

## What's in the demo

- **Entry:** Splash (2.5s) → Sign up / Sign in → 7-step onboarding (incl. mandatory free therapy booking) → app.
- **Tabs:** Home (cycle hero, stats, follicle map by ovary, today's meds) · Check-in (mood, anxiety, hope, symptoms, OHSS weight alert, journal, history) · Nora AI · Insights (category filter, popular, articles) · More.
- **More:** Cycle Report (share / copy) · Medications (Today / History / Schedule + log-dose sheet) · Appointments (live countdown, add to calendar) · Charts & Trends · Two Week Wait · Therapy & Coaching · Wellbeing Videos · Community rooms · After a Failed Cycle · Partner Space · Pregnancy Journey · Secret Space · Upgrade (paywall) · Profile.
- **Quick log (+):** tick a dose, or log mood, symptoms and weight from any main tab. Home shows a check-in streak flower and personalised daily stories.
- **Privacy Centre:** anonymous mode, PIN app lock, download my data, delete everything.
- **Medical Review Board:** every article and story shows who reviewed it, with sources and the editorial policy. The board members are placeholders until the real board is appointed.
- **Reminders** and **three languages** (see above).
- **Landing page** at `/landing` with waitlist form.

All data persists in `localStorage` (`bloom_*` keys), so the demo survives reloads. **Profile → Reset demo data** clears it. No real payments are taken.

## Structure

```
app/
  layout.jsx, globals.css      fonts + PWA meta tags
  page.jsx                     splash → auth → onboarding → app shell
  landing/page.jsx             waitlist landing page
  api/nora/route.js            Nora chat (server-side Anthropic call + demo fallback)
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
  reminders.js                 reminder scheduler, notifications, .ics dose alarms
  i18n.js, stories-i18n.js     English / Arabic / French
  cycle.js                     med log, check-ins, cycle dates
  demo-data.js                 all seeded demo content
  nora.js                      Nora system prompt + offline replies
public/manifest.json, apple-touch-icon.png, icon.svg, sw.js
supabase/schema.sql            cloud table + row-level security
```

Tailwind CSS v3 with the `bloom` palette in `tailwind.config.js`. Deploy on Vercel.

## Agents

- **sa4** (`.claude/agents/sa4.md`) builds features and flows from the Hanover spec.
- **sa5** (`.claude/agents/sa5.md`) is the designer and enhancement advisor. It benchmarks Bloom against Flo and owns the graphics. See `docs/sa5/flo-benchmark.md` for the recommendation backlog.
