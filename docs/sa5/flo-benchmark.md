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

## Pass 4: from the owner's Flo screenshots (Sept 2026)

Notes only. Flo's screenshots and artwork are not stored in this repo, and Bloom's graphics are drawn from scratch.

| Flo screen | What Flo does well | What Bloom shipped |
|---|---|---|
| Log sheet ("Today · Cycle day 15") | ~16 moods and many symptoms, each a pill with its own illustrated icon, grouped into sections. Search at the top, and you can move between days | `LogChips` + `FeelingFace` (13 IVF feelings, e.g. "Envious of others' news", "Numb") + `SymptomIcon` (16 symptoms in Body and Injections groups, adding pelvic pressure, brain fog and bruising). Search, and logging up to 6 days back (saved to that day). Used in both Quick log and Check-in |
| Settings: "Your Flo experience" | Big mode cards with a ring icon and a check on the selected one | `JourneyPicker` in Profile: Planning → Stims → Retrieval → Transfer → 2WW, plus "I'm pregnant" (opens Pregnancy Journey). `PhaseIcon` progress rings. A "Change phase" pill on Home. Home, stories and Insights adapt |
| Flo for Partners | "You're always in control", a Stop sharing card, and "Your view / His view" phone mockups | Partner hero with control copy, a Stop sharing card with confirmation, and drawn *Your view / Their view* phones. **Beyond Flo:** per-item sharing toggles (phase, appointments, med times, tips) that update "their view" live, and a clear "never shared" list |
| Insights | Search, bookmarks, themed carousels ("Most popular", "Later in your cycle"), large illustrated cards | Search, bookmarks with a Saved view and count, carousels "For Stimulation Day 7", "Most popular", "Coming up next: Post Retrieval" and "Saved for later", and larger cards |

Still to borrow: Flo's "Doctor's story" video series (needs real clinicians and consent) and a notifications inbox.

## Pass 5: Flo's Today screen (sleep score, daily insights, "My cycles")

| Flo pattern | What Bloom shipped |
|---|---|
| Night-sky **sleep score** card: ring, "Great", hours asleep, one line of advice, "Show me" | `SleepCard`: dark sparkle card, score ring (check only for good nights), hours, a kind IVF-aware message, and a sheet with a 7-night bar chart, two-tap "last night" logging and IVF sleep tips (`lib/sleep.js`) |
| **My daily insights** tiles (Cycle day in a drop, sleep tile, conversation starters) | Tiles before the stories: a **Stim day** drop, a **sleep score** tile, a **follicles** tile with mature dots, and **Talk tonight**, conversation starters for the couple |
| **My cycles** stats with ⓘ and a chart with a "normal range" band | `CycleStats`: stim days, lead follicle, average growth, E2 change and doses taken, each with a reviewed ⓘ sheet. A lead-follicle chart with the **typical trigger zone (17–20 mm)** band, plus a banner that "every body responds at its own pace" |
| Date header + calendar icon | Today's date on Home opens `CycleCalendar`: done and planned stim days, appointments, logged-day dots, and details for the tapped day (appointments, mood, feelings, symptoms, sleep) |

## Pass 6: graphics everywhere

At the owner's request, every screen now has illustrations that express its content, all in one style:
- The **More menu** tiles each show their section's drawing (a report clipboard, a pill and pen, an ultrasound screen, a chart, an hourglass, therapy chat, yoga, community, a rainbow after rain, a couple, a baby, a locked journal, a bell, a shield and a crown).
- **`ScreenHero`** is on Appointments, Charts, Medications, Two Week Wait, Therapy, Community, After a Failed Cycle, Pregnancy, Upgrade, Privacy and Reminders.
- **Wellbeing** has five drawn scenes (movement, breath, meditation, nutrition, emotional support), a featured card, a one-minute **Breathe with me** exercise, and mood chips with faces.
- **Item art**: appointment types, drawn therapist avatars, flower avatars in community rooms, drawn baby-size fruits for each pregnancy week (replacing emoji that don't render on every phone), med-type art, and partner features.
- **Nora** uses the Bloom flower as its avatar, plus an intro card. Secret Space uses a locked journal.

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
| 9 | **Apple Health / Google Fit** sync for sleep (feeds the new Sleep card automatically), steps and weight | High | M |

## Sources

- [Flo, "How we evolved and enriched the main screen of the Flo app. Part 1: My daily insights"](https://medium.com/flo-health/how-we-evolved-and-enriched-the-main-screen-of-the-flo-app-part-1-stories-cee6f4035e5)
- [Flo, "Part 2: Cycle widgets"](https://medium.com/flo-health/how-we-evolved-and-enriched-the-main-screen-of-the-flo-app-part-2-cycle-widgets-b73d5ccb948d)
- [Flo Help: What can I find on the main screen](https://help.flo.health/hc/en-us/articles/4401756146452-What-can-I-find-on-the-main-screen-and-where-have-the-event-icons-gone)
- [Flo Help: Logging your symptoms](https://help.flo.health/hc/en-us/articles/4406826542740-Logging-your-symptoms)
- [Neuron: Flo case study](https://www.neuronux.com/flo)
- [Flo UI breakdown (screensdesign)](https://screensdesign.com/showcase/flo-period-pregnancy-tracker)
- [Flo (app), Wikipedia](https://en.wikipedia.org/wiki/Flo_(app))
