# Bloom vs Flo: design benchmark & enhancement backlog

Owned by the **sa5** agent (`.claude/agents/sa5.md`). Last updated 2026-09-27 (pass 2).

## What Flo does well

| Flo pattern | Why it works | Bloom today |
|---|---|---|
| **Cycle circle** on the main screen, showing today's day and phase | The whole cycle is readable at a glance, with no numbers to parse | ✅ Added the `JourneyRing` with IVF phases (Stims → Retrieval → Embryos → 2WW) and a pulsing marker for today |
| **Daily stories** ("My daily insights"): short, one-day content tailored to cycle day and symptoms | Makes the app worth opening daily, and each tip is small enough to take in | ✅ Added `Stories` on Home: 4 illustrated stories, tap-through viewer, seen state |
| **Illustration-first UI**: graphs and art instead of dense text | Friendly and non-clinical, lowers anxiety | ✅ Added spot illustrations for onboarding, stories and success states, plus the brand flower mark |
| **Fast logging** with a "+" button and 80+ symptom and event chips | Logging takes seconds | 🟡 Check-in has chips, but it is one long form |
| **Conversational onboarding** with many personalising questions | Users feel understood, and the data drives the content | 🟡 7 steps now illustrated; could adapt the content more |
| **Cycle report dashboard** (redesigned from chat to visual dashboard) | Easier to digest than an assistant's messages | 🟡 Cycle Report is mostly text and lists |
| **Secret Chats**: anonymous community | Safe space for taboo topics | ✅ Community rooms with flower aliases, plus Secret Space |
| **Partner mode** | Brings the partner in | ✅ Partner Space |
| **Anonymous mode / privacy** after the 2021 FTC settlement | Trust is a feature | 🟡 Only a single "never sold" line. Make privacy visible |

## Where Bloom beats Flo (lean in)

- **IVF-specific**: follicle map, E2 trends, stim meds, OHSS alert, 2WW. Flo has none of these.
- **Nora AI** is available 24/7 and knows about the cycle.
- **Mandatory free therapy session**: no competitor does this.

## Shipped in this pass

1. `components/ui/Graphics.jsx`: BloomFlower, Blobs, JourneyRing, Ovary, 10 spot illustrations.
2. Home hero redesigned around the journey ring, and the follicle map is now drawn as two ovaries with follicles to scale.
3. Flo-style daily **Stories** row and full-screen viewer (`components/ui/Stories.jsx`, `STORIES` in `lib/demo-data.js`).
4. Onboarding emojis replaced with illustrations. Animated flower on splash, sign-in and welcome.
5. Check-in success screen is now a blooming flower with sparkles.
6. Tab bar uses lucide icons with an active pill instead of unicode glyphs.
7. All motion respects `prefers-reduced-motion`.

## Shipped in pass 2 (going for #1)

1. **Quick log "+" button** on every main tab: mark a dose, mood (illustrated faces), symptoms and weight in one sheet. Weight gains of 2 kg or more still trigger the OHSS alert. Saving plays a petal burst and shows a toast (`components/QuickLog.jsx`).
2. **Streak flower + "Your week"** on Home: one petal per check-in day and a 7-day mood strip (`StreakFlower`, `MoodFace`, `checkinStreak()`, `lastSevenDays()`).
3. **Personalised stories**: `storiesFor()` ranks stories by phase and the last check-in (symptoms, anxiety, mood) and shows why ("Because you logged bloating"). Added phase stories for retrieval, transfer and 2WW.
4. **Visual Cycle Report**: journey ring, dose-adherence and maturity donuts, ovary graphic, E2 chart, mood faces, plus **Save as PDF** (print stylesheet).
5. **Privacy Centre** (More): anonymous mode (hides the name everywhere), **PIN app lock** with a lock screen and a forgot-PIN path, "what Bloom holds", **download my data** (JSON, password stripped), delete everything, and privacy promises.
6. **Illustrated mood faces** replace emoji in check-in and history.
7. **Insights covers**: each category has its own illustration (heart, plate, embryo, couple, leaf).
8. **More grid** uses lucide icons instead of glyphs.
9. **Landing page**: flower mark and an illustrated three-feature section.
10. Accessibility: sheets are `role="dialog"`, toasts are `role="status"`, and all new motion is off under reduced-motion.

## Shipped in pass 3

1. **Arabic + RTL and French**: a full right-to-left layout with an Arabic font (IBM Plex Sans Arabic / Noto Naskh Arabic). Arabic addresses the user in the feminine. Nora replies in the chosen language, live and offline. There's a language picker on sign-in, onboarding and Profile, and the first visit follows the browser language.
2. **Reminders**: service-worker notifications for doses and appointments with a choice of lead time, an in-app fallback, a "coming up" list, a test reminder, and an `.ics` export of daily dose alarms for when the app is closed.
3. **Secure backend**: passwords hashed with salted PBKDF2 (legacy accounts migrate on sign-in), a hashed app-lock PIN, optional Supabase cloud accounts and sync with row-level security, and **end-to-end encrypted Secret Space** (AES-256-GCM with a passphrase).
4. **Medical Review Board**: a "Medically reviewed by…" badge on articles and stories, sources on every article, and a board sheet with the editorial policy. The reviewers are demo placeholders until the real board is appointed.

## Backlog (ranked by impact ÷ effort)

| # | Recommendation | Impact | Effort |
|---|---|---|---|
| 1 | **Translate the rest**: article library, deeper More screens, plus Spanish, Hindi and Urdu | High | M |
| 2 | **Clinic connect**: import scan and bloods results from the clinic (or photo-OCR a results sheet) so data isn't typed by hand | Very high | L |
| 3 | **Server push** (web-push + cron over the stored subscriptions) so reminders arrive when the app is closed, beyond the calendar export | High | M |
| 4 | **Appoint the real Medical Review Board** and put its names on content (swap the placeholders) | High | S (people) |
| 5 | **Split check-in into 3 swipeable cards** (mood → body → notes) | High | M |
| 6 | **Dark mode** night palette for 3am injections | Med | M |
| 7 | **Follicle growth animation** between scans on the Ovary graphic | Med | M |
| 8 | **2WW embryo development timeline** illustration, day by day | Med | M |
| 9 | **Apple Health / Google Fit** sync for sleep, steps and weight | Med | M |

## Sources

- [Flo, "How we evolved and enriched the main screen of the Flo app. Part 1: My daily insights"](https://medium.com/flo-health/how-we-evolved-and-enriched-the-main-screen-of-the-flo-app-part-1-stories-cee6f4035e5)
- [Flo, "Part 2: Cycle widgets"](https://medium.com/flo-health/how-we-evolved-and-enriched-the-main-screen-of-the-flo-app-part-2-cycle-widgets-b73d5ccb948d)
- [Flo Help: What can I find on the main screen](https://help.flo.health/hc/en-us/articles/4401756146452-What-can-I-find-on-the-main-screen-and-where-have-the-event-icons-gone)
- [Flo Help: Logging your symptoms](https://help.flo.health/hc/en-us/articles/4406826542740-Logging-your-symptoms)
- [Neuron: Flo case study](https://www.neuronux.com/flo)
- [Flo UI breakdown (screensdesign)](https://screensdesign.com/showcase/flo-period-pregnancy-tracker)
- [Flo (app), Wikipedia](https://en.wikipedia.org/wiki/Flo_(app))
