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

Put them in `.env.local` locally, and in Vercel → Project → Settings → Environment Variables for deploys.

## What's in the demo

- **Entry:** Splash (2.5s) → Sign up / Sign in → 7-step onboarding (incl. mandatory free therapy booking) → app.
- **Tabs:** Home (cycle hero, stats, follicle map by ovary, today's meds) · Check-in (mood, anxiety, hope, symptoms, OHSS weight alert, journal, history) · Nora AI · Insights (category filter, popular, articles) · More.
- **More:** Cycle Report (share / copy) · Medications (Today / History / Schedule + log-dose sheet) · Appointments (live countdown, add to calendar) · Charts & Trends · Two Week Wait · Therapy & Coaching · Wellbeing Videos · Community rooms · After a Failed Cycle · Partner Space · Pregnancy Journey · Secret Space · Upgrade (paywall) · Profile.
- **Quick log (+):** tick a dose, or log mood, symptoms and weight from any main tab. Home shows a check-in streak flower and personalised daily stories.
- **Privacy Centre:** anonymous mode, PIN app lock, download my data, delete everything.
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
  store.js                     auth + localStorage persistence (swap for Supabase later)
  cycle.js                     med log, check-ins, cycle dates
  demo-data.js                 all seeded demo content
  nora.js                      Nora system prompt + offline replies
public/manifest.json, apple-touch-icon.png, icon.svg
```

Tailwind CSS v3 with the `bloom` palette in `tailwind.config.js`. Deploy on Vercel.

## Agents

- **sa4** (`.claude/agents/sa4.md`) builds features and flows from the Hanover spec.
- **sa5** (`.claude/agents/sa5.md`) is the designer and enhancement advisor. It benchmarks Bloom against Flo and owns the graphics. See `docs/sa5/flo-benchmark.md` for the recommendation backlog.
