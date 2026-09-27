# Bloom vs Flo: design benchmark & enhancement backlog

Owned by the **sa5** agent (`.claude/agents/sa5.md`). Last updated 2026-09-27.

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

## Backlog (ranked by impact ÷ effort)

| # | Recommendation | Impact | Effort |
|---|---|---|---|
| 1 | **Quick-log "+" floating button** on Home: mood, symptom, weight and dose in one sheet (Flo's core loop) | High | S |
| 2 | **Split check-in into 3 swipeable cards** (mood → body → notes) with an illustrated mood picker instead of emoji | High | M |
| 3 | **Visual Cycle Report**: journey ring, follicle growth sparkline per ovary, E2 curve vs typical range, med adherence donut | High | M |
| 4 | **Personalised stories** driven by phase, stim day and today's logged symptoms (Flo's tailoring) | High | M |
| 5 | **Privacy centre** screen: what is stored, export/delete, "Anonymous mode" toggle, with a shield illustration | High | S |
| 6 | **2WW day-by-day illustration** (embryo development timeline) | Med | M |
| 7 | **Follicle growth animation** between scans (Day 5 → Day 7 → today) on the Ovary graphic | Med | M |
| 8 | **Insights article covers**: per-category illustration instead of flat colour blocks | Med | S |
| 9 | **Dark mode** with a night palette for 3am injection and anxiety moments | Med | M |
| 10 | **Haptic-style micro-interactions**: dose "taken" confetti petals, streak flower that grows with daily check-ins | Med | S |

## Sources

- [Flo, "How we evolved and enriched the main screen of the Flo app. Part 1: My daily insights"](https://medium.com/flo-health/how-we-evolved-and-enriched-the-main-screen-of-the-flo-app-part-1-stories-cee6f4035e5)
- [Flo, "Part 2: Cycle widgets"](https://medium.com/flo-health/how-we-evolved-and-enriched-the-main-screen-of-the-flo-app-part-2-cycle-widgets-b73d5ccb948d)
- [Flo Help: What can I find on the main screen](https://help.flo.health/hc/en-us/articles/4401756146452-What-can-I-find-on-the-main-screen-and-where-have-the-event-icons-gone)
- [Flo Help: Logging your symptoms](https://help.flo.health/hc/en-us/articles/4406826542740-Logging-your-symptoms)
- [Neuron: Flo case study](https://www.neuronux.com/flo)
- [Flo UI breakdown (screensdesign)](https://screensdesign.com/showcase/flo-period-pregnancy-tracker)
- [Flo (app), Wikipedia](https://en.wikipedia.org/wiki/Flo_(app))
