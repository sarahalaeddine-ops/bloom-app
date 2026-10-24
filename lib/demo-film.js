// The investor demo film: Sarah (34, Dubai, first IVF cycle) uses Bloom from her injections to the
// result, played by lib/autoplay.js on the real app. Every scene is real taps and typing.
// `say` lines are short subtitles. Investor-facing, so English only.
//
// Targets are button text, aria-labels or field ids (see lib/autoplay.js find()). If the app's
// wording changes, update the text here; tests/demo-film.test.mjs checks the script's shape.

function inDays(n) {
  var d = new Date();
  d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

var MORE = { text: "More", exact: true, in: "nav" };
var BACK = { text: "Back", in: "main" };

export var STORY = "Sarah is 34, lives in Dubai and is on her first IVF cycle. Watch her use Bloom from her injections to the result, whichever way it goes.";

export var SCENES = [
  {
    id: "home", title: "Meet Sarah", sub: "Day 7 of her injections", phase: "stimulation",
    steps: [
      { say: "Meet Sarah. She's 34, in Dubai, on day 7 of her first IVF cycle.", hold: 2600 },
      { say: "Bloom shows her where she is in the whole cycle, and what today means." },
      { scroll: 420 },
      { say: "Her follicles, hormone level and next scan come from what she logs." },
      { scroll: 520 },
      { say: "Every number on this page comes from her own entries." },
      { scroll: 600 },
      { top: true },
    ],
  },
  {
    id: "quick", title: "Logging in seconds", sub: "The + button", phase: "stimulation",
    steps: [
      { say: "8 AM. She has just taken her tablet. One tap on +." },
      { tap: { label: "Quick log" }, after: 1200 },
      { say: "She ticks off the dose…" },
      { tap: { text: "Progynova", in: "dialog" } },
      { say: "…how she feels…" },
      { tap: { label: "Hopeful", in: "dialog" } },
      { tap: { text: "Anxious", in: "dialog" } },
      { say: "…what her body is doing…" },
      { tap: { text: "Bloating", in: "dialog" } },
      { say: "…and her morning weight, because sudden gains can signal OHSS." },
      { type: { id: "ql-weight" }, text: "62.3" },
      { tap: { text: "Save", exact: true, in: "dialog" }, after: 2200 },
      { say: "Done in under 20 seconds." },
    ],
  },
  {
    id: "meds", title: "Her medications", sub: "Prescription, doses and history", phase: "stimulation",
    steps: [
      { tap: MORE, after: 1000 },
      { tap: { text: "Medications", in: "main" }, after: 1300 },
      { say: "Today's doses: what is done, and what is still due tonight." },
      { scroll: 300 },
      { say: "Her clinic adds the trigger shot to her plan. She enters it herself." },
      { tap: { text: "My medications", in: "main" } },
      { tap: { text: "Add a medication", in: "main" }, after: 1100 },
      { say: "Exactly as written on her prescription." },
      { type: { id: "mf-name" }, text: "Ovitrelle" },
      { type: { id: "mf-dose" }, text: "250 mcg" },
      { tap: { text: "Injection", exact: true, in: "dialog" } },
      { type: { sel: "input[type=time]", in: "dialog" }, text: "21:30" },
      { type: { id: "mf-start" }, text: inDays(2) },
      { type: { id: "mf-end" }, text: inDays(2) },
      { tap: { text: "Save", exact: true, in: "dialog" }, after: 1600 },
      { say: "Bloom will remind her before the dose. Every dose she logs is kept in History." },
      { tap: { text: "History", exact: true, in: "main" }, after: 1400 },
      { scroll: 400 },
    ],
  },
  {
    id: "appts", title: "Appointments", sub: "Scans, retrieval, transfer, test", phase: "stimulation",
    steps: [
      { tap: BACK, after: 900 },
      { tap: { text: "Appointments", in: "main" }, after: 1300 },
      { say: "Every clinic visit in one place, with a countdown and how to prepare." },
      { scroll: 520 },
      { say: "The nurse asks for an extra blood test. She adds it." },
      { tap: { text: "Add an appointment", in: "main" }, after: 1100 },
      { tap: { text: "Blood test", exact: true, in: "dialog" } },
      { type: { id: "af-date" }, text: inDays(1) },
      { type: { id: "af-time" }, text: "07:30" },
      { type: { id: "af-clinic" }, text: "Emirates Fertility Centre" },
      { tap: { text: "Save", exact: true, in: "dialog" }, after: 1500 },
      { say: "Scan, trigger shot, egg retrieval, embryo transfer and pregnancy test: all ahead of her." },
      { scroll: 420, after: 2200 },
    ],
  },
  {
    id: "checkin", title: "Daily check-in", sub: "How she really is", phase: "stimulation",
    steps: [
      { tap: { text: "Check-in", exact: true, in: "nav" }, after: 1200 },
      { say: "Evening. One minute to record how she really is." },
      { tap: { text: "Okay", exact: true, in: "main" } },
      { tap: { text: "Hopeful", exact: true, in: "main", nth: 1 } },
      { tap: { text: "Overwhelmed", exact: true, in: "main" } },
      { say: "Anxiety and hope, from 1 to 5." },
      { tap: { label: "Anxiety level 4" } },
      { tap: { label: "Hopefulness 4" } },
      { tap: { text: "Bloating", exact: true, in: "main" } },
      { tap: { text: "Fatigue", exact: true, in: "main" } },
      { say: "Her weight, watched daily for OHSS." },
      { type: { sel: "input[type=number]", in: "main" }, text: "62.4" },
      { say: "And a private note, just for her." },
      { type: { sel: "textarea", in: "main" }, text: "Scan tomorrow at 8. Nervous, but the follicles are growing." },
      { tap: { text: "Save today check-in", in: "main" }, after: 2200 },
    ],
  },
  {
    id: "results", title: "Results and her doctor", sub: "Charts and the cycle report", phase: "stimulation",
    steps: [
      { tap: MORE, after: 1000 },
      { tap: { text: "Charts & Trends", in: "main" }, after: 1400 },
      { say: "After each scan she logs her results. Bloom turns them into trends." },
      { scroll: 450 },
      { scroll: 450 },
      { tap: BACK, after: 900 },
      { tap: { text: "My Cycle Report", in: "main" }, after: 1500 },
      { say: "Her whole cycle on one page, ready to share with her doctor." },
      { scroll: 500 },
      { scroll: 600 },
      { scroll: 600 },
    ],
  },
  {
    id: "nora", title: "Nora, her AI companion", sub: "Live answers about her own cycle", phase: "stimulation",
    steps: [
      { tap: { text: "Nora AI", exact: true, in: "nav" }, after: 1300 },
      { say: "11 PM, and she's worried. She asks Nora." },
      { tap: { text: "Am I at risk for OHSS?", in: "main" } },
      { say: "Nora answers live, using Sarah's own numbers, and points her back to her clinic." },
      { nora: true },
      { type: { sel: "textarea", in: "main" }, text: "I'm scared about the egg retrieval. What will it feel like?" },
      { tap: { label: "Send" } },
      { nora: true, read: 6000 },
    ],
  },
  {
    id: "wait", title: "The two-week wait", sub: "After the embryo transfer", phase: "stimulation",
    steps: [
      { tap: { text: "Home", exact: true, in: "nav" }, after: 1000 },
      { tap: { text: "Change phase", in: "main" }, after: 1300 },
      { say: "Retrieval and transfer are done. She moves Bloom to the two-week wait." },
      { tap: { text: "Two Week Wait", exact: true, in: "main" }, after: 1400 },
      { tap: { text: "Home", exact: true, in: "nav" }, after: 1500 },
      { say: "The whole app follows her into the new phase." },
      { tap: MORE, after: 1000 },
      { tap: { text: "Two Week Wait", in: "main" }, after: 1300 },
      { say: "Day 9 after transfer: what is happening in her body today." },
      { tap: { text: "9", exact: true, in: "main" } },
      { scroll: 380, after: 2400 },
    ],
  },
  {
    id: "positive", title: "A positive result", sub: "Into pregnancy, with her partner", phase: "tww",
    steps: [
      { tap: { text: "Home", exact: true, in: "nav" }, after: 1000 },
      { tap: { text: "Change phase", in: "main" }, after: 1300 },
      { say: "Beta day. The blood test is positive." },
      { tap: { text: "I'm pregnant", in: "main" }, after: 1500 },
      { say: "Bloom carries on with her, week by week." },
      { tap: { text: "Next", in: "main" } },
      { tap: { text: "Next", in: "main" }, after: 1400 },
      { scroll: 400 },
      { tap: MORE, after: 1000 },
      { tap: { text: "Partner Space", in: "main" }, after: 1300 },
      { say: "She brings her husband in. She decides what he sees." },
      { tap: { text: "simulate partner joining", in: "main" }, after: 1600 },
      { scroll: 450, after: 2200 },
    ],
  },
  {
    id: "failed", title: "When a cycle fails", sub: "Where other apps go quiet", phase: "tww",
    steps: [
      { tap: MORE, after: 1000 },
      { tap: { text: "After a Failed Cycle", in: "main" }, after: 1400 },
      { say: "But most IVF cycles don't work the first time. This is where Bloom stays." },
      { scroll: 420 },
      { say: "Questions to take to her follow-up with her doctor, copied in one tap." },
      { scroll: 380 },
      { tap: { text: "Copy", in: "main" } },
      { tap: { text: "Coaching", in: "main" }, after: 1400 },
      { say: "Real support: a certified coach, alongside her clinic." },
      { scroll: 450 },
      { tap: BACK, after: 900 },
      { tap: { text: "Community", in: "main" }, after: 1200 },
      { say: "And women who understand, anonymously." },
      { tap: { text: "Failed Cycle", in: "main" }, after: 1300 },
      { type: { sel: "textarea", in: "main" }, text: "Our first transfer didn't work. How did you find the strength to try again?" },
      { tap: { label: "Send" }, after: 2400 },
    ],
  },
  {
    id: "privacy", title: "Privacy and Arabic", sub: "Her data, her language", phase: "planning",
    steps: [
      { tap: MORE, after: 1000 },
      { tap: { text: "Privacy Centre", in: "main" }, after: 1300 },
      { say: "Her data stays hers. Showing the app to someone? One switch hides her name." },
      { tap: { label: "Anonymous mode" }, after: 1200 },
      { scroll: 450 },
      { tap: { label: "Anonymous mode" }, after: 900 },
      { tap: { text: "Home", exact: true, in: "nav" }, after: 900 },
      { tap: { text: "Change phase", in: "main" }, after: 1200 },
      { say: "Bloom speaks Arabic, right to left, with Nora too." },
      { tap: { text: "العربية", in: "main" }, after: 900 },
      { tap: { sel: "nav button", nth: 0 }, after: 2600 },
      { scroll: 500, after: 2000 },
      { run: function (app) { app.setLang("en"); app.go("home"); } },
      { say: "That's Bloom: one companion from the first injection to the result, and beyond.", hold: 3500 },
    ],
  },
];

export function sceneIndex(id) {
  for (var i = 0; i < SCENES.length; i++) if (SCENES[i].id === id) return i;
  return 0;
}
