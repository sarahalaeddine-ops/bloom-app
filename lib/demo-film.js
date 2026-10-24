// The investor demo film: Sarah (34, Dubai, first IVF cycle) uses Bloom from the day she signs up,
// through every stage of treatment, to the result, whichever way it goes. lib/autoplay.js plays it
// on the real app: every scene is real taps and typing, saved to the demo account. `say` lines are
// one-line subtitles, also read aloud by the voice-over (lib/voice.js); `voice` overrides the
// spoken text where the subtitle wouldn't read well. Investor-facing, so English only.
//
// Targets are button text, aria-labels or field ids (see lib/autoplay.js find()). If the app's
// wording changes, update the text here; tests/demo-film.test.mjs checks the script's shape.
//
// A scene with `signup: true` starts signed out on a wiped device; every other scene runs as the
// demo persona (components/AutoDemo.jsx sets that up), in the scene's `phase`.

function inDays(n) {
  var d = new Date();
  d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

var MORE = { text: "More", exact: true, in: "nav" };
var HOME = { text: "Home", exact: true, in: "nav" };
var BACK = { text: "Back", in: "main" };

// Moves Bloom to another treatment phase the way she would: Home → Change phase → the phase card.
function changePhase(label) {
  return [
    { tap: HOME, after: 900 },
    { tap: { text: "Change phase", in: "main" }, after: 1300 },
    { tap: { text: label, exact: true, in: "main" }, after: 1300 },
  ];
}

export var STORY = "Sarah is 34, lives in Dubai and is starting her first IVF cycle. Watch her use Bloom from the day she signs up, through every stage, to the result, whichever way it goes.";

export var SCENES = [
  {
    id: "start", title: "Day 1: she joins Bloom", sub: "Sign up and set up her cycle", phase: "stimulation", signup: true,
    steps: [
      { say: "Day 1 of injections. Her clinic recommends Bloom. She signs up.", voice: "This is Sarah. Today is day one of her injections, and her clinic has suggested she try Bloom. So, she signs up.", hold: 2200 },
      { tap: { text: "Sign Up", exact: true, sel: "[role=tab]" } },
      { type: { id: "name" }, text: "Sarah" },
      { type: { id: "email" }, text: "sarah.demo@bloomivfcompanion.com" },
      { type: { id: "password" }, text: "bloom2026" },
      { tap: { text: "Create Account", exact: true, sel: "button[type=submit]" }, after: 2200 },
      { say: "Bloom explains what it does for her…", voice: "First, Bloom tells her how it can help…" },
      { scroll: 400 },
      { tap: { text: "Get Started" }, after: 1200 },
      { say: "…and asks her consent before anything leaves her phone.", voice: "and it asks for her permission before anything ever leaves her phone." },
      { tap: { text: "Let Nora answer with AI", sel: "[role=checkbox]" } },
      { tap: { text: "Save my choices" }, after: 1100 },
      { say: "Her clinic, her protocol, where she is.", voice: "Then a few simple questions. Her clinic, her protocol, and where she is right now." },
      { type: { sel: "input" }, text: "Emirates Fertility Centre" },
      { tap: { text: "Continue" }, after: 1000 },
      { tap: { text: "Antagonist", exact: true } },
      { tap: { text: "Continue" }, after: 1000 },
      { tap: { text: "Stimulation", sel: "button", nth: 0 } },
      { tap: { text: "Continue" }, after: 1000 },
      { tap: { text: "1", exact: true } },
      { tap: { text: "Continue" }, after: 1100 },
      { say: "She meets the life coach she can turn to, anytime.", voice: "She also meets the life coach she can reach out to, whenever she needs someone." },
      { scroll: 300 },
      { tap: { text: "Continue" }, after: 1100 },
      { tap: { text: "Open Bloom" }, after: 2200 },
      { say: "Bloom is ready. Now let's skip ahead a week, to a Bloom full of her data.", voice: "And she's all set. Now, let's skip ahead one week, to see Bloom once it's full of her own story.", hold: 2600 },
    ],
  },
  {
    id: "home", title: "Day 7: her day at a glance", sub: "Home during stimulation", phase: "stimulation",
    steps: [
      { say: "Day 7. Bloom shows where she is in the whole cycle, and what today means.", voice: "It's day seven. At a glance, Bloom shows her where she is in the whole cycle, and what today means for her.", hold: 2400 },
      { scroll: 420 },
      { say: "Her follicles, hormone level and next scan: all from what she logs.", voice: "Her follicles, her hormone level, her next scan. All of it comes from what she's logged." },
      { scroll: 520 },
      { say: "Her mood all week, her sleep, her cycle stats.", voice: "Her mood through the week, how she's sleeping, and how her cycle is going." },
      { scroll: 600 },
      { top: true },
    ],
  },
  {
    id: "quick", title: "Logging in seconds", sub: "Dose, mood, symptoms, weight", phase: "stimulation",
    steps: [
      { say: "8 AM. She has just taken her tablet. One tap on +.", voice: "It's eight in the morning, and she's just taken her tablet. She taps the plus button." },
      { tap: { label: "Quick log" }, after: 1200 },
      { say: "She ticks off the dose…", voice: "She ticks off her dose," },
      { tap: { text: "Progynova", in: "dialog" } },
      { say: "…how she feels…", voice: "picks how she's feeling," },
      { tap: { label: "Hopeful", in: "dialog" } },
      { tap: { text: "Anxious", in: "dialog" } },
      { say: "…what her body is doing…", voice: "notes what her body is telling her," },
      { tap: { text: "Bloating", in: "dialog" } },
      { say: "…and her weight, because a sudden gain can be an early sign of OHSS.", voice: "and adds her weight. A sudden gain can be an early warning sign, so Bloom keeps an eye on it." },
      { type: { id: "ql-weight" }, text: "62.3" },
      { tap: { text: "Save", exact: true, in: "dialog" }, after: 2200 },
      { say: "Done in under 20 seconds.", voice: "And that's it. Done in under twenty seconds." },
    ],
  },
  {
    id: "meds", title: "Her medications", sub: "Prescription, doses and history", phase: "stimulation",
    steps: [
      { tap: MORE, after: 1000 },
      { tap: { text: "Medications", in: "main" }, after: 1300 },
      { say: "Today's doses: what is done, and what is still due tonight.", voice: "Here are today's medicines. What she's already taken, and what's still to come tonight." },
      { scroll: 300 },
      { say: "Her clinic adds the trigger shot. She enters it from her prescription.", voice: "Her clinic has just added the trigger shot, so she copies it in, straight from her prescription." },
      { tap: { text: "My medications", in: "main" } },
      { tap: { text: "Add a medication", in: "main" }, after: 1100 },
      { type: { id: "mf-name" }, text: "Ovitrelle" },
      { type: { id: "mf-dose" }, text: "250 mcg" },
      { tap: { text: "Injection", exact: true, in: "dialog" } },
      { type: { sel: "input[type=time]", in: "dialog" }, text: "21:30" },
      { type: { id: "mf-start" }, text: inDays(2) },
      { type: { id: "mf-end" }, text: inDays(2) },
      { tap: { text: "Save", exact: true, in: "dialog" }, after: 1600 },
      { say: "Every dose she has taken is kept in her history.", voice: "And every dose she's ever taken is kept safely in her history." },
      { tap: { text: "History", exact: true, in: "main" }, after: 1400 },
      { scroll: 400 },
    ],
  },
  {
    id: "reminders", title: "Reminders", sub: "Before every dose and visit", phase: "stimulation",
    steps: [
      { tap: BACK, after: 900 },
      { tap: { text: "Reminders", in: "main" }, after: 1300 },
      { say: "A reminder before every dose, and an hour before every appointment.", voice: "Bloom gently reminds her before every dose, and an hour before every appointment." },
      { say: "She wants 15 minutes' warning before each injection.", voice: "She'd like a fifteen minute heads-up before each injection." },
      { tap: { text: "15 min", exact: true, in: "main" } },
      { scroll: 420 },
      { say: "Coming up: tonight's doses, tomorrow's scan, and her new trigger shot.", voice: "And here's what's coming up. Tonight's doses, tomorrow's scan, and her new trigger shot." },
      { scroll: 380, after: 2200 },
    ],
  },
  {
    id: "appts", title: "Appointments", sub: "Scans, retrieval, transfer, test", phase: "stimulation",
    steps: [
      { tap: BACK, after: 900 },
      { tap: { text: "Appointments", in: "main" }, after: 1300 },
      { say: "Every clinic visit in one place, with a countdown and how to prepare.", voice: "All her clinic visits live in one place, with a countdown, and little tips on how to prepare." },
      { scroll: 520 },
      { say: "The nurse asks for an extra blood test. She adds it.", voice: "Her nurse asks for an extra blood test, so she adds it in." },
      { tap: { text: "Add an appointment", in: "main" }, after: 1100 },
      { tap: { text: "Blood test", exact: true, in: "dialog" } },
      { type: { id: "af-date" }, text: inDays(1) },
      { type: { id: "af-time" }, text: "07:30" },
      { type: { id: "af-clinic" }, text: "Emirates Fertility Centre" },
      { tap: { text: "Save", exact: true, in: "dialog" }, after: 1500 },
      { say: "Scan, trigger, egg retrieval, transfer and pregnancy test: all ahead of her.", voice: "The scan, the trigger, egg retrieval, transfer, and the pregnancy test. Her whole road ahead, laid out clearly." },
      { scroll: 420, after: 2200 },
    ],
  },
  {
    id: "checkin", title: "Her mood, every day", sub: "The daily check-in", phase: "stimulation",
    steps: [
      { tap: { text: "Check-in", exact: true, in: "nav" }, after: 1200 },
      { say: "Evening. One minute to record how she really is.", voice: "In the evening, she takes just one minute to note how she's really doing." },
      { tap: { text: "Okay", exact: true, in: "main" } },
      { tap: { text: "Hopeful", exact: true, in: "main", nth: 1 } },
      { tap: { text: "Overwhelmed", exact: true, in: "main" } },
      { say: "Anxiety and hope, from 1 to 5.", voice: "How anxious she feels, and how hopeful." },
      { tap: { label: "Anxiety level 4" } },
      { tap: { label: "Hopefulness 4" } },
      { tap: { text: "Bloating", exact: true, in: "main" } },
      { tap: { text: "Fatigue", exact: true, in: "main" } },
      { say: "Her weight, watched daily for OHSS.", voice: "Her weight, which Bloom watches every day." },
      { type: { sel: "input[type=number]", in: "main" }, text: "62.4" },
      { say: "And a private note, just for her.", voice: "And a private little note, just for herself." },
      { type: { sel: "textarea", in: "main" }, text: "Scan tomorrow at 8. Nervous, but the follicles are growing." },
      { tap: { text: "Save today check-in", in: "main" }, after: 2200 },
    ],
  },
  {
    id: "results", title: "Results and her doctor", sub: "Charts and the cycle report", phase: "stimulation",
    steps: [
      { tap: MORE, after: 1000 },
      { tap: { text: "Charts & Trends", in: "main" }, after: 1400 },
      { say: "After each scan she logs her results. Bloom turns them into trends.", voice: "After each scan, she adds her results, and Bloom turns them into simple trends she can follow." },
      { scroll: 450 },
      { scroll: 450 },
      { tap: BACK, after: 900 },
      { tap: { text: "My Cycle Report", in: "main" }, after: 1500 },
      { say: "Her whole cycle on one page, ready to share with her doctor.", voice: "Her whole cycle, on a single page, ready to share with her doctor." },
      { scroll: 500 },
      { scroll: 600 },
      { scroll: 600 },
    ],
  },
  {
    id: "nora", title: "Nora, her AI companion", sub: "Live answers about her own cycle", phase: "stimulation",
    steps: [
      { tap: { text: "Nora AI", exact: true, in: "nav" }, after: 1300 },
      { say: "11 PM, and she's worried. She asks Nora.", voice: "It's eleven at night, and she's worried. So she asks Nora." },
      { tap: { text: "Am I at risk for OHSS?", in: "main" } },
      { say: "Nora answers live, using Sarah's own numbers, and points her back to her clinic.", voice: "Nora answers right away, using Sarah's own numbers, and always guides her back to her clinic." },
      { nora: true },
      { type: { sel: "textarea", in: "main" }, text: "I'm scared about the egg retrieval. What will it feel like?" },
      { tap: { label: "Send" } },
      { nora: true, read: 6000 },
    ],
  },
  {
    id: "retrieval", title: "Egg retrieval", sub: "Recovery and what comes next", phase: "stimulation",
    steps: [
      { say: "Retrieval day. Eleven eggs. She moves Bloom to the next stage.", voice: "It's retrieval day. Eleven eggs! She moves Bloom on to the next stage.", hold: 2200 },
    ].concat(changePhase("Post Retrieval"), [
      { tap: HOME, after: 1300 },
      { say: "Home moves on with her, to the next stage of her cycle.", voice: "And her home screen moves on right along with her." },
      { tap: { text: "Insights", exact: true, in: "nav" }, after: 1300 },
      { say: "Her reading moves on too: embryo quality now, and what comes next.", voice: "So does what she reads. Now it's about her embryos, and what comes next." },
      { scroll: 500 },
      { say: "She logs how she feels after the procedure.", voice: "She notes how she's feeling after the procedure." },
      { tap: { label: "Quick log" }, after: 1200 },
      { tap: { label: "Low", in: "dialog" } },
      { tap: { text: "Cramping", in: "dialog" } },
      { tap: { text: "Fatigue", in: "dialog" } },
      { tap: { text: "Save", exact: true, in: "dialog" }, after: 2000 },
    ]),
  },
  {
    id: "transfer", title: "Embryo transfer", sub: "Calm before the big day", phase: "retrieval",
    steps: [
      { say: "Five days later, her embryo is ready for transfer.", voice: "Five days later, her embryo is ready for transfer." },
    ].concat(changePhase("Pre Transfer"), [
      { tap: MORE, after: 1000 },
      { tap: { text: "Wellbeing", in: "main" }, after: 1300 },
      { say: "She's nervous. One calm minute: breathe in as the circle grows, out as it shrinks.", voice: "She's nervous. So she takes one calm minute. Breathing in as the circle grows, and out as it shrinks." },
      { tap: { text: "Start", exact: true, in: "main" }, after: 9000 },
      { say: "Then movement, breathwork and meditation picked for how she feels.", voice: "Then, gentle movement, breathing and meditation, chosen for exactly how she feels." },
      { tap: { text: "I feel nervous", in: "main" }, after: 1300 },
      { scroll: 380, after: 2000 },
    ]),
  },
  {
    id: "wait", title: "The two-week wait", sub: "Day by day, until the test", phase: "transfer",
    steps: [
      { say: "Transfer done. Now the hardest part: two weeks of waiting.", voice: "The transfer is done. And now comes the hardest part. Two weeks of waiting." },
    ].concat(changePhase("Two Week Wait"), [
      { tap: MORE, after: 1000 },
      { tap: { text: "Two Week Wait", in: "main" }, after: 1300 },
      { say: "Day 9 after transfer: what is happening in her body today.", voice: "Day nine after transfer. Bloom explains what's happening inside her body today." },
      { tap: { text: "9", exact: true, in: "main" } },
      { scroll: 380 },
      { say: "Some thoughts are only hers. Secret Space is encrypted with her own passphrase.", voice: "Some thoughts are just for her. Her Secret Space is locked with her own passphrase, so nobody else can read it." },
      { tap: BACK, after: 900 },
      { tap: { text: "Secret Space", in: "main" }, after: 1300 },
      { type: { id: "sp-pass" }, text: "only-mine-2026" },
      { type: { id: "sp-pass2" }, text: "only-mine-2026" },
      { tap: { text: "Create my Secret Space" }, after: 2600 },
      { type: { sel: "textarea", in: "main" }, text: "I'm scared to hope. I keep checking for symptoms." },
      { tap: { label: "Send" }, after: 2600 },
      { say: "And other women in the same wait, anonymously.", voice: "And she's not alone. Other women are in the very same wait, sharing anonymously." },
      { tap: BACK, after: 900 },
      { tap: { text: "Community", in: "main" }, after: 1200 },
      { tap: { text: "Two Week Wait", in: "main" }, after: 1300 },
      { type: { sel: "textarea", in: "main" }, text: "Day 9 past transfer. No symptoms at all. Is that normal for anyone else?" },
      { tap: { label: "Send" }, after: 2400 },
    ]),
  },
  {
    id: "positive", title: "Result: pregnant", sub: "Week by week, with her partner", phase: "tww",
    steps: [
      { say: "Test day. The blood test is positive.", voice: "Test day. And the blood test is positive." },
      { tap: HOME, after: 900 },
      { tap: { text: "Change phase", in: "main" }, after: 1300 },
      { tap: { text: "I'm pregnant", in: "main" }, after: 1500 },
      { say: "Bloom carries on with her, week by week.", voice: "Bloom carries on with her, week by week." },
      { tap: { text: "Next", in: "main" } },
      { tap: { text: "Next", in: "main" }, after: 1400 },
      { scroll: 400 },
      { tap: MORE, after: 1000 },
      { tap: { text: "Partner Space", in: "main" }, after: 1300 },
      { say: "She brings her husband in. He joins with her code.", voice: "She invites her husband to join. He just uses her code." },
      { scroll: 300 },
      { tap: { text: "simulate partner joining", in: "main" }, after: 1600 },
      { say: "She decides exactly what he sees. Never her journal or her chats.", voice: "She decides exactly what he can see. Never her journal, and never her chats." },
      { tap: { label: "Medication times (not doses)" } },
      { say: "He gets a tip each day on how to support her.", voice: "And each day, he gets a little tip on how to support her." },
      { scroll: 450, after: 2400 },
    ],
  },
  {
    id: "failed", title: "Result: not this time", sub: "Where other apps go quiet", phase: "tww",
    steps: [
      { say: "But most IVF cycles don't work the first time. This is where Bloom stays.", voice: "But the truth is, most IVF cycles don't work the first time. And this is where Bloom stays by her side.", hold: 2400 },
      { tap: MORE, after: 1000 },
      { tap: { text: "After a Failed Cycle", in: "main" }, after: 1400 },
      { say: "Gentle next steps, at her own pace.", voice: "Gentle next steps, at her own pace." },
      { scroll: 420 },
      { say: "Questions for her follow-up with her doctor, copied in one tap.", voice: "Questions to ask her doctor at the follow-up, copied with one tap." },
      { scroll: 380 },
      { tap: { text: "Copy questions", in: "main" } },
      { tap: { text: "Coaching", in: "main" }, after: 1400 },
      { say: "Real support from a person: Tatiana, a certified life coach she can contact directly.", voice: "Real support, from a real person. Tatiana, a certified life coach she can contact directly." },
      { scroll: 450 },
      { scroll: 450 },
      { tap: { text: "Nora AI", exact: true, in: "nav" }, after: 1200 },
      { tap: { text: "New chat", exact: true, in: "main" }, after: 900 },
      { say: "At midnight, she talks to Nora.", voice: "Late that night, she talks to Nora." },
      { type: { sel: "textarea", in: "main" }, text: "Our transfer didn't work. I don't know how to feel." },
      { tap: { label: "Send" } },
      { nora: true, read: 6000 },
      { say: "And other women who have been there.", voice: "And she finds other women who've been there too." },
      { tap: MORE, after: 1000 },
      { tap: { text: "Community", in: "main" }, after: 1200 },
      { tap: { text: "Failed Cycle", in: "main" }, after: 1300 },
      { type: { sel: "textarea", in: "main" }, text: "Our first transfer didn't work. How did you find the strength to try again?" },
      { tap: { label: "Send" }, after: 2200 },
      { say: "When she's ready, she plans her next cycle, with everything from this one saved.", voice: "And when she's ready, she plans her next cycle, with everything from this one saved." },
    ].concat(changePhase("Planning"), [
      { tap: HOME, after: 2200 },
    ]),
  },
  {
    id: "privacy", title: "Privacy and Arabic", sub: "Her data, her language", phase: "planning",
    steps: [
      { tap: MORE, after: 1000 },
      { tap: { text: "Privacy Centre", in: "main" }, after: 1300 },
      { say: "Her data stays hers. Showing the app to someone? One switch hides her name.", voice: "Her data always stays hers. And if she's showing the app to someone, one switch hides her name." },
      { tap: { label: "Anonymous mode" }, after: 1200 },
      { scroll: 450 },
      { tap: { label: "Anonymous mode" }, after: 900 },
      { tap: HOME, after: 900 },
      { tap: { text: "Change phase", in: "main" }, after: 1200 },
      { say: "Bloom speaks Arabic, right to left, with Nora too.", voice: "Bloom also speaks Arabic, fully right to left, and so does Nora." },
      { tap: { text: "العربية", in: "main" }, after: 900 },
      { tap: { sel: "nav button", nth: 0 }, after: 2600 },
      { scroll: 500, after: 2000 },
      { run: function (app) { app.setLang("en"); app.go("home"); } },
      { say: "That's Bloom: one companion from the first injection to the result, and beyond.", voice: "That's Bloom. One gentle companion, from the very first injection, to the result, and beyond.", hold: 3500 },
    ],
  },
];

export function sceneIndex(id) {
  for (var i = 0; i < SCENES.length; i++) if (SCENES[i].id === id) return i;
  return 0;
}
