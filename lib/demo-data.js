// Seeded demo content for the Bloom demo persona (Sarah, Stim Day 7, Antagonist).

export var DEMO_USER = {
  id: "demo",
  name: "Sarah",
  email: "sarah@bloomivfcompanion.com",
  password: "bloomdemo",
  clinic: "Emirates Fertility Centre",
  doctor: "Dr. Leila Haddad",
  protocol: "Antagonist",
  phase: "stimulation",
  stimDay: 7,
  follicles: 11,
  e2: 1840,
  onboarded: true,
};

export var COLORS = {
  accent: "#9B6DC5", rose: "#E07A8A", teal: "#4ABFB0", gold: "#C49A3C",
  muted: "#7A6880", dim: "#C5B8CC", text: "#1A1014", lavender: "#8B7AC5", sky: "#5BADD4", peach: "#FDBA74",
};

export var PHASES = [
  { id: "stimulation", label: "Stimulation",    icon: "💉", desc: "Daily injections, monitoring scans" },
  { id: "tww",         label: "Two Week Wait",  icon: "⏳", desc: "After transfer, waiting for beta" },
  { id: "retrieval",   label: "Post Retrieval", icon: "🥚", desc: "Eggs retrieved, waiting for embryos" },
  { id: "transfer",    label: "Pre Transfer",   icon: "💜", desc: "Preparing for embryo transfer" },
  { id: "planning",    label: "Planning",       icon: "📋", desc: "Planning my first or next cycle" },
];

export function phaseLabel(id) {
  var p = PHASES.find(function (x) { return x.id === id; });
  return p ? p.label : "Stimulation";
}

export var FOLLICLES = {
  right: [18, 16, 15, 14, 12, 11],
  left:  [17, 16, 14, 13, 12],
};
export var MATURE_MM = 16;

export var MEDS = [
  { id: "gonal",     name: "Gonal-F",    dose: "225 IU",  time: "9:00 PM", type: "injection", freq: "Once daily, evening", startDay: 1, color: "#9B6DC5", nextDose: "Tonight 9:00 PM", taken: true },
  { id: "cetrotide", name: "Cetrotide",  dose: "0.25 mg", time: "8:00 AM", type: "injection", freq: "Once daily, morning", startDay: 5, color: "#E07A8A", nextDose: "Tomorrow 8:00 AM", taken: true },
  { id: "progynova", name: "Progynova",  dose: "2 mg",    time: "8AM/8PM", type: "oral",      freq: "Twice daily",         startDay: 1, color: "#C49A3C", nextDose: "Tonight 8:00 PM", taken: false },
  { id: "folic",     name: "Folic Acid", dose: "400 mcg", time: "8:00 AM", type: "oral",      freq: "Once daily",          startDay: 1, color: "#4ABFB0", nextDose: "Tomorrow 8:00 AM", taken: true },
];

export var INJECTION_TIPS = [
  "Rotate sites every day: left belly, right belly, then thighs.",
  "Let the pen reach room temperature for 10 minutes to reduce sting.",
  "Ice the skin for 30 seconds before injecting.",
  "Inject at least 5 cm away from your belly button.",
];

// dayOffset is days from today; hour/minute is the local appointment time.
export var APPOINTMENTS = [
  { id: 1, type: "Monitoring Scan",     label: "Tomorrow",    dayOffset: 1,  hour: 8,  minute: 0,  time: "8:00 AM",     location: "Emirates Fertility Centre", doctor: "Dr. Leila Haddad", color: "#9B6DC5" },
  { id: 2, type: "Trigger Shot Timing", label: "In 2 days",   dayOffset: 2,  hour: 18, minute: 0,  time: "Clinic call", location: "Phone consultation",        doctor: "Nurse Amira Saleh", color: "#E07A8A" },
  { id: 3, type: "Egg Retrieval",       label: "In ~4 days",  dayOffset: 4,  hour: 7,  minute: 30, time: "7:30 AM",     location: "Emirates Fertility Centre", doctor: "Dr. Leila Haddad", color: "#C49A3C" },
  { id: 4, type: "Embryo Transfer",     label: "In ~9 days",  dayOffset: 9,  hour: 10, minute: 0,  time: "10:00 AM",    location: "Emirates Fertility Centre", doctor: "Dr. Omar Farouk", color: "#4ABFB0" },
  { id: 5, type: "Beta HCG Test",       label: "In ~23 days", dayOffset: 23, hour: 8,  minute: 0,  time: "8:00 AM",     location: "Lab",                       doctor: "Clinic laboratory", color: "#9B6DC5" },
];

export var PREP_TIPS = [
  "Drink a glass of water an hour before your scan",
  "Wear comfortable, two-piece clothing",
  "Bring your medication list and dose log",
  "Arrive 10 minutes early for bloods",
];

// Hormone levels across scan days. E2 pg/mL, LH IU/L, P4 ng/mL.
export var HORMONES = [
  { day: 1, e2: 42,   lh: 5.1, p4: 0.3, leadFollicle: 8,  count: 14 },
  { day: 3, e2: 186,  lh: 4.2, p4: 0.4, leadFollicle: 10, count: 13 },
  { day: 5, e2: 640,  lh: 3.1, p4: 0.5, leadFollicle: 13, count: 12 },
  { day: 7, e2: 1840, lh: 1.9, p4: 0.7, leadFollicle: 18, count: 11 },
];

export var MOODS = [
  { mark: "🥺", l: "Hard",    c: "#E07A8A" },
  { mark: "😔", l: "Low",     c: "#C49A3C" },
  { mark: "😶", l: "Okay",    c: "#7A6880" },
  { mark: "🌱", l: "Hopeful", c: "#9B6DC5" },
  { mark: "🌸", l: "Good",    c: "#4ABFB0" },
];

export var SYMPTOMS = ["Bloating", "Cramping", "Headache", "Nausea", "Breast tenderness", "Hot flashes", "Fatigue", "Injection site pain", "Back pain", "Mood swings", "Spotting", "Insomnia"];

function daysAgo(n) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export var SEED_CHECKINS = [
  { date: daysAgo(1), stimDay: 6, mood: 3, anxiety: 3, hope: 4, symptoms: ["Bloating", "Fatigue"], weight: 62.1, note: "Scan went well. Trying to stay calm." },
  { date: daysAgo(2), stimDay: 5, mood: 2, anxiety: 4, hope: 3, symptoms: ["Headache", "Injection site pain"], weight: 61.8, note: "" },
  { date: daysAgo(3), stimDay: 4, mood: 1, anxiety: 4, hope: 2, symptoms: ["Mood swings"], weight: 61.7, note: "Hard day. Cried after the injection." },
  { date: daysAgo(4), stimDay: 3, mood: 3, anxiety: 3, hope: 4, symptoms: [], weight: 61.6, note: "" },
];

export var CATS = [
  { id: "all",       label: "All",           mark: "✦", color: "#9B6DC5", art: "bloom" },
  { id: "mental",    label: "Mental Health", mark: "◑", color: "#8B7AC5", art: "heart" },
  { id: "nutrition", label: "Nutrition",     mark: "✺", color: "#C49A3C", art: "plate" },
  { id: "science",   label: "IVF Science",   mark: "◈", color: "#9B6DC5", art: "embryo" },
  { id: "intimacy",  label: "Intimacy",      mark: "◇", color: "#E07A8A", art: "couple" },
  { id: "movement",  label: "Movement",      mark: "◎", color: "#4ABFB0", art: "leaf" },
];

export var ARTICLES = [
  { id: 1, cat: "mental", type: "article", title: "The anxiety is not in your head", tag: "Mental Health", color: "#EDE8F5", textColor: "#8B7AC5", popular: true,
    body: "Studies show IVF patients experience anxiety comparable to people facing a serious illness. Not because they are fragile, but because the stakes feel existential.\n\nYour nervous system is responding rationally to uncertainty, hormones and hope all at once. This is not weakness.\n\nTry naming the feeling out loud, then one thing you can control today: a walk, a meal, an early night." },
  { id: 2, cat: "science", type: "video", title: "What makes a quality blastocyst?", tag: "IVF Science", color: "#F0EBE8", textColor: "#9B6DC5", popular: true,
    body: "Blastocysts are graded on expansion from 1 to 6, where 4 to 6 is preferred. The inner cell mass and trophectoderm are each graded A, B or C, where A is best.\n\n4AA or 5AA is top quality. But 3BB blastocysts lead to healthy pregnancies regularly. A grade is a description, not a destiny." },
  { id: 3, cat: "nutrition", type: "article", title: "The IVF fertility plate", tag: "Nutrition", color: "#FEF9EE", textColor: "#C49A3C", popular: false,
    body: "Focus on omega-3s from salmon and walnuts, antioxidants from berries and dark greens, and protein from eggs and legumes.\n\nDuring stimulation, extra protein and fluids can ease bloating. Avoid alcohol, trans fats and more than 200 mg caffeine per day. Ask your clinic what suits you." },
  { id: 4, cat: "mental", type: "video", title: "You do not have to stay positive", tag: "Real Talk", color: "#F5EEF8", textColor: "#8B7AC5", popular: true,
    body: "Forced positivity can actually increase stress. What helps is emotional processing and realistic optimism.\n\nIt is okay to be scared. Your feelings are not sabotaging your cycle." },
  { id: 5, cat: "intimacy", type: "article", title: "Is sex safe during stimulation?", tag: "Intimacy", color: "#FEF0F2", textColor: "#E07A8A", popular: false,
    body: "During stimulation your ovaries are enlarged and sensitive. Many clinics advise avoiding penetrative sex from around Day 3 onward to lower the risk of ovarian torsion.\n\nEmotional intimacy, touch and time together are encouraged throughout. Ask your clinic what applies to you." },
  { id: 6, cat: "movement", type: "video", title: "Gentle yoga for stimulation day", tag: "Movement", color: "#EDFAF8", textColor: "#4ABFB0", popular: true,
    body: "Gentle movement during stimulation can ease bloating and anxiety. Avoid inversions, deep twists and anything high-impact.\n\nThis 8-minute session is designed for the stimulation phase: slow breathing, supported hip openers and a long rest. Stop if anything hurts and tell your clinic." },
  { id: 7, cat: "science", type: "article", title: "What your E2 number is telling you", tag: "IVF Science", color: "#F0EBE8", textColor: "#9B6DC5", popular: false,
    body: "Estradiol (E2) is made by your growing follicles. A rough rule of thumb is 150 to 300 pg/mL per mature follicle.\n\nYour clinic watches the trend, not a single number, to time your trigger shot and to watch for OHSS. Ask your clinic what your numbers mean for you." },
  { id: 8, cat: "nutrition", type: "article", title: "Hydration and OHSS", tag: "Nutrition", color: "#FEF9EE", textColor: "#C49A3C", popular: false,
    body: "With many follicles, aim for 2 to 3 litres of fluid a day, including electrolyte drinks, and salty snacks if your clinic agrees.\n\nCall your clinic straight away if you gain more than 2 kg in 24 hours, feel very short of breath, or pass very little urine." },
  { id: 9, cat: "intimacy", type: "article", title: "Staying close when IVF takes over", tag: "Intimacy", color: "#FEF0F2", textColor: "#E07A8A", popular: false,
    body: "IVF can turn intimacy into a schedule. Protect one evening a week with no IVF talk at all.\n\nSmall rituals, like your partner doing the evening injection with you, can make the process something you share instead of something you carry alone." },
  { id: 10, cat: "movement", type: "article", title: "Walking: the underrated IVF exercise", tag: "Movement", color: "#EDFAF8", textColor: "#4ABFB0", popular: false,
    body: "A 20-minute walk lowers cortisol, helps digestion and eases bloating, without stressing your ovaries.\n\nKeep it conversational pace. If walking becomes painful, stop and let your clinic know." },
];

// Wellbeing videos. Moods, categories and titles are i18n keys ("vid.mood.<id>", "vid.cat.<id>",
// "vid.<id>"); phase is an i18n key; q is the YouTube search the card opens (kept in English:
// most matching videos are in English, and the screen says so).
export var VIDEO_MOODS = ["anxious", "scared", "hopeful", "rest", "cope", "peace", "bloated", "grieving", "help", "nervous"];

export var VIDEO_CATS = [
  { id: "movement",   color: "#4ABFB0", mark: "◎" },
  { id: "breath",     color: "#9B6DC5", mark: "◌" },
  { id: "meditation", color: "#8B7AC5", mark: "☽" },
  { id: "nutrition",  color: "#C49A3C", mark: "✺" },
  { id: "emotional",  color: "#E07A8A", mark: "♡" },
];

export var VIDEOS = [
  { id: 1,  cat: "movement",   phase: "phase.stimulation", min: 8,  moods: ["bloated", "anxious"],  q: "gentle yoga ivf stimulation" },
  { id: 2,  cat: "breath",     phase: "phase.stimulation", min: 5,  moods: ["nervous", "scared"],   q: "4 7 8 breathing anxiety" },
  { id: 3,  cat: "meditation", phase: "phase.tww",         min: 12, moods: ["anxious", "peace"],    q: "two week wait meditation ivf" },
  { id: 4,  cat: "nutrition",  phase: "phase.stimulation", min: 6,  moods: ["bloated"],             q: "ivf bloating nutrition" },
  { id: 5,  cat: "emotional",  phase: "sec.failed",        min: 10, moods: ["grieving", "cope"],    q: "ivf failed cycle grief support" },
  { id: 6,  cat: "breath",     phase: "vid.anyPhase",      min: 4,  moods: ["nervous", "anxious"],  q: "box breathing calm" },
  { id: 7,  cat: "meditation", phase: "vid.anyPhase",      min: 20, moods: ["rest", "peace"],       q: "sleep meditation fertility" },
  { id: 8,  cat: "movement",   phase: "phase.retrieval",   min: 7,  moods: ["rest"],                q: "restorative stretch after egg retrieval" },
  { id: 9,  cat: "emotional",  phase: "phase.tww",         min: 9,  moods: ["hopeful", "scared"],   q: "hope and fear ivf journey" },
  { id: 10, cat: "emotional",  phase: "vid.anyPhase",      min: 6,  moods: ["help"],                q: "how partners support ivf" },
];

// Community rooms. Names, descriptions, prompts and flower names are i18n keys (lib/i18n-more.js:
// "cm.room.<id>", "cm.room.<id>.d", "cm.prompt<n>", "flower.<Name>").
// members: seeded demo numbers, shown only where seeded posts are (lib/community.js).
export var ROOMS = [
  { id: "stim",    color: "#9B6DC5", members: 124 },
  { id: "tww",     color: "#E07A8A", members: 89 },
  { id: "retr",    color: "#C49A3C", members: 56 },
  { id: "failed",  color: "#5BADD4", members: 43 },
  { id: "success", color: "#4ABFB0", members: 201 },
  { id: "general", color: "#7A6880", members: 312 },
];

export var ROOM_PROMPTS = ["cm.prompt1", "cm.prompt2", "cm.prompt3", "cm.prompt4"];

export var FLOWERS = ["Sunflower", "Rose", "Lily", "Peony", "Orchid", "Jasmine", "Magnolia", "Tulip", "Lotus", "Iris"];

// SEEDED DEMO POSTS (founder decision 2026-09-29): shown only to the demo user on the web, never
// to real accounts or in the native app (lib/community.js). Delete this block to remove them.
// Text is the i18n key "cm.p.<room>.<id>"; agoMin is how long ago the post was written.
export var ROOM_MESSAGES = {
  stim: [
    { id: 1, seed: true, flower: "Sunflower", agoMin: 12, likes: 9 },
    { id: 2, seed: true, flower: "Rose", agoMin: 34, likes: 14 },
    { id: 3, seed: true, flower: "Lily", agoMin: 60, likes: 21 },
  ],
  tww: [
    { id: 1, seed: true, flower: "Peony", agoMin: 8, likes: 17 },
    { id: 2, seed: true, flower: "Orchid", agoMin: 40, likes: 25 },
  ],
  retr: [
    { id: 1, seed: true, flower: "Jasmine", agoMin: 20, likes: 33 },
    { id: 2, seed: true, flower: "Tulip", agoMin: 120, likes: 12 },
  ],
  failed: [
    { id: 1, seed: true, flower: "Magnolia", agoMin: 60, likes: 41 },
    { id: 2, seed: true, flower: "Iris", agoMin: 55, likes: 38 },
  ],
  success: [
    { id: 1, seed: true, flower: "Lotus", agoMin: 180, likes: 88 },
  ],
  general: [
    { id: 1, seed: true, flower: "Sunflower", agoMin: 30, likes: 19 },
    { id: 2, seed: true, flower: "Rose", agoMin: 25, likes: 27 },
  ],
};

// Coaching & support (More → Coaching & support, onboarding "Meet a coach"). Real professionals
// only, the same for the demo and for real accounts. Every fact below is published by the person
// herself (sources listed); the founder reports written permission to list her, including the
// photo and phone number (docs/sa6/app-store.md). Never add prices, availability, reviews,
// ratings or specialisms that she has not published. Text is i18n keys (lib/i18n-more.js,
// "coach.<key>.*"); the name stays in Latin script in every language.
//
// photo: optional square image under public/ (>= 400x400). If it is missing or fails to load,
// the card shows the initials avatar instead (components/ui/CoachAvatar.jsx).
export var COACHES = [
  {
    id: "tatiana-kutteh",
    key: "tk",
    name: "Tatiana F. Kutteh",
    initials: "TK",
    color: "#4ABFB0",
    photo: "/coaches/tatiana-kutteh.jpg",
    website: "https://tatianakutteh.com",
    instagram: "https://www.instagram.com/tatianakutteh/",
    phone: "+961 3 382 730",
    tel: "+9613382730",
    whatsapp: "https://wa.me/9613382730",
    topics: ["topic1", "topic2", "topic3", "topic4"],
    formats: ["fmt1", "fmt2", "fmt3", "fmt4"],
    background: ["edu1", "icf", "nlp", "edu2", "edu3"],
    sources: ["https://www.tatianakutteh.com/about.php", "https://tatianakutteh.com/", "https://www.instagram.com/tatianakutteh/ (bio, supplied by the founder)"],
    verified: "2026-09-29",
  },
];

// Two Week Wait daily science: day = days past a 5-day blastocyst transfer.
// Text is i18n keys "tww.d<day>.t" (title) and "tww.d<day>.b" (body) in lib/i18n-more.js.
export var TWW_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(function (d) { return { day: d }; });

// Pregnancy after IVF, week by week. Text is i18n keys "preg.w<week>.size" and "preg.w<week>.body".
export var PREGNANCY_WEEKS = [
  { week: 4,  emoji: "·" },
  { week: 5,  emoji: "•" },
  { week: 6,  emoji: "●" },
  { week: 7,  emoji: "🫐" },
  { week: 8,  emoji: "🍓" },
  { week: 10, emoji: "🍓" },
  { week: 12, emoji: "🍋" },
  { week: 16, emoji: "🥑" },
  { week: 20, emoji: "🍌" },
  { week: 28, emoji: "🍆" },
  { week: 36, emoji: "🥭" },
  { week: 40, emoji: "🍉" },
];

// After a Failed Cycle: steps "fail.s<n>.t" / "fail.s<n>.b" and follow-up questions "fail.q<n>".
export var FAILED_STEPS = [1, 2, 3, 4];
export var WTF_QUESTIONS = [1, 2, 3, 4, 5];

// Partner Space. Text is i18n keys "partner.f<n>" / "partner.f<n>.d", "partner.tip<n>" /
// "partner.tip<n>.d", "partner.sees<n>" and "partner.faq<n>" / "partner.faq<n>.a".
export var PARTNER_FEATURES = [
  { n: 1, mark: "◐", color: "#9B6DC5" },
  { n: 2, mark: "◔", color: "#E07A8A" },
  { n: 3, mark: "♡", color: "#4ABFB0" },
  { n: 4, mark: "◈", color: "#C49A3C" },
];
export var PARTNER_TIPS = [1, 2, 3];
export var PARTNER_SEES = [1, 2, 3, 4];
export var PARTNER_FAQ = [1, 2, 3, 4];

// Secret Space canned replies and starter prompts: i18n keys.
export var SECRET_REPLIES = ["secret.reply1", "secret.reply2", "secret.reply3", "secret.reply4", "secret.reply5"];
export var SECRET_PROMPTS = ["secret.prompt1", "secret.prompt2", "secret.prompt3"];

// Upgrade (web only, demo paywall). Feature names are i18n keys.
export var FREE_TIER = ["up.free1", "up.free2", "up.free3", "up.free4"];

export var PLANS = [
  { id: "plus", name: "Bloom+", monthly: "$19.99", annual: "$129", color: "#9B6DC5",
    features: ["up.f1", "up.f2", "up.f3", "up.f4", "up.f5", "up.f6", "up.f7", "up.f8"] },
  { id: "pro", name: "Bloom Pro", monthly: "$29.99", annual: "$199", color: "#E07A8A", popular: true,
    features: ["up.p1", "up.p2", "up.p3", "up.p4", "up.p5", "up.p6", "up.p7"] },
];

// Daily stories on Home (inspired by Flo's "My daily insights"). Tap-through cards.
export var STORIES = [
  { id: "today", title: "Your stim day, explained", art: "egg", phases: ["stimulation"], color: "#F3ECFA", ink: "#7C3AED", slides: [
    "Mid-stims, follicles usually grow about 1–2 mm a day.",
    "Your clinic is watching for a lead group around 17–20 mm before planning the trigger.",
    "E2 rises as follicles grow. A higher number usually just means more follicles are working.",
    "Every body responds differently. Please confirm your own plan with your clinic.",
  ] },
  { id: "bloat", title: "Feeling bloated?", art: "drop", symptoms: ["Bloating", "Cramping"], phases: ["stimulation", "retrieval"], color: "#FCEEF0", ink: "#C0485C", slides: [
    "Bloating is very common in the second half of stims as your ovaries get bigger.",
    "Small salty snacks, plenty of fluids and loose clothes can help you feel more comfortable.",
    "Call your clinic if you gain 2 kg or more in a day, feel short of breath or can't keep fluids down.",
  ] },
  { id: "sleep", title: "Wind down tonight", art: "moon", symptoms: ["Insomnia", "Mood swings"], anxious: true, color: "#EEF0FA", ink: "#5B4B9A", slides: [
    "Injection nights can leave your mind racing. Try a 4-7-8 breath: in for 4, hold for 7, out for 8.",
    "Put your meds out before dinner so you aren't thinking about them in bed.",
    "Nora is here at 3am too, if you need someone to talk to.",
  ] },
  { id: "you", title: "You're doing this", art: "heart", lowMood: true, color: "#E8F7F5", ink: "#2E8C80", slides: [
    "Seven days of injections, scans and waiting rooms. That takes real strength.",
    "It's okay to feel hopeful and scared on the same day.",
    "You are not alone in this journey. ✦",
  ] },
  { id: "embryos", title: "Embryo day by day", art: "embryo", phases: ["retrieval", "transfer"], color: "#F3ECFA", ink: "#7C3AED", slides: [
    "Day 1: your lab checks which eggs fertilised. Some attrition from here on is completely normal.",
    "Day 3: embryos usually have 6–8 cells. Many clinics now grow them on to Day 5.",
    "Day 5–6: a blastocyst forms. Grades describe how it looks, not what it will become.",
    "Your embryologist will talk you through your numbers. Please confirm next steps with your clinic.",
  ] },
  { id: "tww", title: "Surviving the 2WW", art: "moon", phases: ["tww"], color: "#EEF0FA", ink: "#5B4B9A", slides: [
    "Progesterone can cause bloating, sore breasts and cramps, the same as early pregnancy. Symptoms (or none) don't tell you the result.",
    "Testing early can mislead you, especially if you had a trigger shot. Your clinic's beta date is the one to trust.",
    "Plan small, kind things for each day. Nora and your community room are here whenever you need them.",
  ] },
];

// Rank stories for this user: phase match, then what they logged last.
export function storiesFor(user, lastCheckin) {
  var phase = user.phase || "stimulation";
  var c = lastCheckin || { symptoms: [] };
  return STORIES
    .filter(function (s) { return !s.phases || s.phases.includes(phase); })
    .map(function (s) {
      var why = null;
      var score = 0;
      var hit = (s.symptoms || []).find(function (x) { return c.symptoms.includes(x); });
      if (hit) { score += 3; why = { k: "why.logged", s: hit }; }
      if (s.anxious && c.anxiety >= 4) { score += 2; why = why || { k: "why.anxiety" }; }
      if (s.lowMood && c.mood <= 1) { score += 2; why = why || { k: "why.hard" }; }
      if (s.phases) score += 1;
      return { ...s, why: why, score: score };
    })
    .sort(function (a, b) { return b.score - a.score; });
}

// Medical Review Board (roles are i18n keys "rb.role.<id>"; date is year-month, formatted in her
// language by components/ui/Reviewed.jsx). DEMO PLACEHOLDERS: these reviewers are fictional and must be
// replaced with Bloom's real, credentialed board (with consent) before launch.
export var REVIEW_BOARD = [
  { id: "rei",   name: "Dr. Hana Mansour",  role: "Reproductive endocrinologist", creds: "MD, FRCOG", color: "#9B6DC5" },
  { id: "psy",   name: "Dr. Yasmin Rahal",  role: "Clinical psychologist, fertility counselling", creds: "PhD", color: "#8B7AC5" },
  { id: "rd",    name: "Leena Farah",       role: "Registered dietitian", creds: "MSc, RD", color: "#C49A3C" },
  { id: "nurse", name: "Maya Qasim",        role: "IVF nurse specialist", creds: "RN, BSc", color: "#4ABFB0" },
];

var REVIEWER_FOR = { science: "rei", mental: "psy", intimacy: "psy", nutrition: "rd", movement: "nurse", story: "rei" };

// General references by category (organisations and guideline titles only).
export var SOURCES = {
  science:   ["ESHRE guideline: Ovarian stimulation for IVF/ICSI", "HFEA (UK fertility regulator): patient information on IVF", "ASRM patient education resources"],
  mental:    ["ESHRE guideline: Routine psychosocial care in infertility and medically assisted reproduction", "HFEA: emotional support and counselling"],
  intimacy:  ["ESHRE guideline: Routine psychosocial care in infertility and medically assisted reproduction", "ASRM patient education resources"],
  nutrition: ["WHO: Healthy diet fact sheet", "ASRM patient education resources"],
  movement:  ["WHO guidelines on physical activity and sedentary behaviour", "ASRM patient education resources"],
  story:     ["ESHRE guideline: Ovarian stimulation for IVF/ICSI", "HFEA (UK fertility regulator): patient information on IVF"],
};

export function reviewFor(cat) {
  var id = REVIEWER_FOR[cat] || "rei";
  return { reviewer: REVIEW_BOARD.find(function (r) { return r.id === id; }), date: "2026-08", sources: SOURCES[cat] || SOURCES.story };
}
