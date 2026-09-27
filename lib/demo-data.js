// Seeded demo content for the Bloom demo persona (Sarah, Stim Day 7, Antagonist).

export var DEMO_USER = {
  id: "demo",
  name: "Sarah",
  email: "sarah@bloomivf.app",
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
    body: "Focus on omega-3s from salmon and walnuts, antioxidants from berries and dark greens, and protein from eggs and legumes.\n\nDuring stimulation, extra protein and fluids can ease bloating. Avoid alcohol, trans fats and more than 200 mg caffeine per day." },
  { id: 4, cat: "mental", type: "video", title: "You do not have to stay positive", tag: "Real Talk", color: "#F5EEF8", textColor: "#8B7AC5", popular: true,
    body: "Forced positivity can actually increase stress. What helps is emotional processing and realistic optimism.\n\nIt is okay to be scared. Your feelings are not sabotaging your cycle." },
  { id: 5, cat: "intimacy", type: "article", title: "Is sex safe during stimulation?", tag: "Intimacy", color: "#FEF0F2", textColor: "#E07A8A", popular: false,
    body: "During stimulation your ovaries are enlarged and sensitive. Many clinics advise avoiding penetrative sex from around Day 3 onward to lower the risk of ovarian torsion.\n\nEmotional intimacy, touch and time together are encouraged throughout. Ask your clinic what applies to you." },
  { id: 6, cat: "movement", type: "video", title: "Gentle yoga for stimulation day", tag: "Movement", color: "#EDFAF8", textColor: "#4ABFB0", popular: true,
    body: "Gentle movement during stimulation can ease bloating and anxiety. Avoid inversions, deep twists and anything high-impact.\n\nThis 8-minute session is designed for the stimulation phase: slow breathing, supported hip openers and a long rest." },
  { id: 7, cat: "science", type: "article", title: "What your E2 number is telling you", tag: "IVF Science", color: "#F0EBE8", textColor: "#9B6DC5", popular: false,
    body: "Estradiol (E2) is made by your growing follicles. A rough rule of thumb is 150 to 300 pg/mL per mature follicle.\n\nYour clinic watches the trend, not a single number, to time your trigger shot and to watch for OHSS." },
  { id: 8, cat: "nutrition", type: "article", title: "Hydration and OHSS", tag: "Nutrition", color: "#FEF9EE", textColor: "#C49A3C", popular: false,
    body: "With many follicles, aim for 2 to 3 litres of fluid a day, including electrolyte drinks, and salty snacks if your clinic agrees.\n\nCall your clinic straight away if you gain more than 2 kg in 24 hours, feel very short of breath, or pass very little urine." },
  { id: 9, cat: "intimacy", type: "article", title: "Staying close when IVF takes over", tag: "Intimacy", color: "#FEF0F2", textColor: "#E07A8A", popular: false,
    body: "IVF can turn intimacy into a schedule. Protect one evening a week with no IVF talk at all.\n\nSmall rituals, like your partner doing the evening injection with you, can make the process something you share instead of something you carry alone." },
  { id: 10, cat: "movement", type: "article", title: "Walking: the underrated IVF exercise", tag: "Movement", color: "#EDFAF8", textColor: "#4ABFB0", popular: false,
    body: "A 20-minute walk lowers cortisol, helps digestion and eases bloating, without stressing your ovaries.\n\nKeep it conversational pace. If walking becomes painful, stop and let your clinic know." },
];

export var VIDEO_MOODS = ["I feel anxious", "I feel scared", "I feel hopeful", "I need rest", "I can't cope", "I need peace", "I feel bloated", "I am grieving", "I want to help", "I feel nervous"];

export var VIDEO_CATS = [
  { id: "movement",   label: "Gentle Movement",   color: "#4ABFB0", mark: "◎" },
  { id: "breath",     label: "Breathwork",        color: "#9B6DC5", mark: "◌" },
  { id: "meditation", label: "Meditation",        color: "#8B7AC5", mark: "☽" },
  { id: "nutrition",  label: "Nutrition",         color: "#C49A3C", mark: "✺" },
  { id: "emotional",  label: "Emotional Support", color: "#E07A8A", mark: "♡" },
];

export var VIDEOS = [
  { id: 1,  cat: "movement",   title: "Gentle yoga for stimulation",       phase: "Stimulation", duration: "8 min",  moods: ["I feel bloated", "I feel anxious"], q: "gentle yoga ivf stimulation" },
  { id: 2,  cat: "breath",     title: "4-7-8 breathing before injections", phase: "Stimulation", duration: "5 min",  moods: ["I feel nervous", "I feel scared"], q: "4 7 8 breathing anxiety" },
  { id: 3,  cat: "meditation", title: "Body scan for the two week wait",   phase: "TWW",         duration: "12 min", moods: ["I feel anxious", "I need peace"], q: "two week wait meditation ivf" },
  { id: 4,  cat: "nutrition",  title: "What to eat when you feel bloated", phase: "Stimulation", duration: "6 min",  moods: ["I feel bloated"], q: "ivf bloating nutrition" },
  { id: 5,  cat: "emotional",  title: "When the cycle doesn't work",       phase: "After a failed cycle", duration: "10 min", moods: ["I am grieving", "I can't cope"], q: "ivf failed cycle grief support" },
  { id: 6,  cat: "breath",     title: "Box breathing for scan day",        phase: "Any phase",   duration: "4 min",  moods: ["I feel nervous", "I feel anxious"], q: "box breathing calm" },
  { id: 7,  cat: "meditation", title: "Sleep meditation for IVF nights",   phase: "Any phase",   duration: "20 min", moods: ["I need rest", "I need peace"], q: "sleep meditation fertility" },
  { id: 8,  cat: "movement",   title: "Restorative stretch after retrieval", phase: "Post Retrieval", duration: "7 min", moods: ["I need rest"], q: "restorative stretch after egg retrieval" },
  { id: 9,  cat: "emotional",  title: "Holding hope without fear",         phase: "TWW",         duration: "9 min",  moods: ["I feel hopeful", "I feel scared"], q: "hope and fear ivf journey" },
  { id: 10, cat: "emotional",  title: "How partners can help today",       phase: "Any phase",   duration: "6 min",  moods: ["I want to help"], q: "how partners support ivf" },
];

export var ROOMS = [
  { id: "stim",    name: "Stimulation",     color: "#9B6DC5", members: 124, desc: "Injections, scans and follicle counts" },
  { id: "tww",     name: "Two Week Wait",   color: "#E07A8A", members: 89,  desc: "Symptom spotting and holding on" },
  { id: "retr",    name: "After Retrieval", color: "#C49A3C", members: 56,  desc: "Fertilisation reports and embryo updates" },
  { id: "failed",  name: "Failed Cycle",    color: "#5BADD4", members: 43,  desc: "A soft place to land" },
  { id: "success", name: "IVF Success",     color: "#4ABFB0", members: 201, desc: "Pregnancy after IVF" },
  { id: "general", name: "General",         color: "#7A6880", members: 312, desc: "Everything else" },
];

export var ROOM_PROMPTS = ["How are you feeling today?", "What helped you most this week?", "Any tips for injections?", "Sending love to everyone here"];

export var FLOWERS = ["Sunflower", "Rose", "Lily", "Peony", "Orchid", "Jasmine", "Magnolia", "Tulip", "Lotus", "Iris"];

export var ROOM_MESSAGES = {
  stim: [
    { id: 1, flower: "Sunflower", text: "Day 8 here. Bloating is real but my lead follicle is 17mm!", ago: "12m", likes: 9 },
    { id: 2, flower: "Rose", text: "Anyone else find Cetrotide stings more than Gonal-F? Ice helped me a lot.", ago: "34m", likes: 14 },
    { id: 3, flower: "Lily", text: "First cycle, first scan tomorrow. Terrified and excited.", ago: "1h", likes: 21 },
  ],
  tww: [
    { id: 1, flower: "Peony", text: "5dp5dt and trying so hard not to test early.", ago: "8m", likes: 17 },
    { id: 2, flower: "Orchid", text: "Progesterone symptoms are exactly like pregnancy symptoms. Cruel.", ago: "40m", likes: 25 },
  ],
  retr: [
    { id: 1, flower: "Jasmine", text: "14 eggs retrieved, 9 fertilised! Waiting for day 5 now.", ago: "20m", likes: 33 },
    { id: 2, flower: "Tulip", text: "Recovery tip: heat pad + electrolytes + Netflix.", ago: "2h", likes: 12 },
  ],
  failed: [
    { id: 1, flower: "Magnolia", text: "BFN yesterday. I don't know how to feel. Just needed to say it somewhere.", ago: "1h", likes: 41 },
    { id: 2, flower: "Iris", text: "Magnolia, I was there 3 months ago. It gets softer. We are here with you.", ago: "55m", likes: 38 },
  ],
  success: [
    { id: 1, flower: "Lotus", text: "12 weeks today after 3 rounds. Never give up on yourselves.", ago: "3h", likes: 88 },
  ],
  general: [
    { id: 1, flower: "Sunflower", text: "How do you all answer 'when are you having kids?' at family dinners?", ago: "30m", likes: 19 },
    { id: 2, flower: "Rose", text: "I just say 'we're working on it' and change the subject to dessert.", ago: "25m", likes: 27 },
  ],
};

export var THERAPISTS = [
  { id: 1, name: "Dr. Sarah Mitchell", title: "Reproductive Psychiatry", years: 12, next: "Tomorrow 2:00 PM", price: "Free first session", color: "#9B6DC5", initials: "SM", langs: "English" },
  { id: 2, name: "Dr. Nadia Rahman",   title: "Fertility Counselling",   years: 9,  next: "Thursday 11:00 AM", price: "$80 / session", color: "#4ABFB0", initials: "NR", langs: "English, Arabic" },
  { id: 3, name: "Emma Clarke, MSc",   title: "IVF Coaching",            years: 6,  next: "Friday 6:00 PM",    price: "$60 / session", color: "#E07A8A", initials: "EC", langs: "English, French" },
  { id: 4, name: "Dr. Yasmin Aziz",    title: "Grief & Loss Therapy",    years: 15, next: "Monday 9:30 AM",    price: "$90 / session", color: "#C49A3C", initials: "YA", langs: "English, Arabic" },
];

// Two Week Wait daily science: day = days past a 5-day blastocyst transfer.
export var TWW_DAYS = [
  { day: 1,  title: "Hatching begins", body: "Your blastocyst starts to hatch out of its shell (the zona pellucida)." },
  { day: 2,  title: "Attaching", body: "The blastocyst begins to attach to the lining of your uterus." },
  { day: 3,  title: "Burrowing in", body: "Implantation deepens as the embryo embeds into the endometrium." },
  { day: 4,  title: "Implantation continues", body: "The cells that will become the placenta begin to form." },
  { day: 5,  title: "Implantation complete", body: "The cells that will become the baby are developing. hCG production starts." },
  { day: 6,  title: "hCG rising", body: "hCG enters the bloodstream, roughly doubling every 48 to 72 hours." },
  { day: 7,  title: "Growing quietly", body: "Symptoms now are mostly from progesterone support, not pregnancy. Both look identical." },
  { day: 8,  title: "Halfway", body: "hCG keeps rising. Home tests are still unreliable. Be gentle with yourself." },
  { day: 9,  title: "Holding on", body: "No symptoms is normal. Many women with a positive beta felt nothing at all." },
  { day: 10, title: "Almost there", body: "hCG may be detectable in blood. Your clinic's beta test is the one to trust." },
  { day: 11, title: "One more breath", body: "Plan something kind for yourself on beta day, whatever the result." },
  { day: 12, title: "Beta tomorrow", body: "Keep taking all medications until your clinic tells you otherwise." },
  { day: 13, title: "Beta day", body: "Your beta hCG blood test day. Whatever it says, you did everything you could." },
];

export var PREGNANCY_WEEKS = [
  { week: 4,  size: "a poppy seed",   emoji: "·",  body: "Your beta was positive. The embryo is implanted and hCG is doubling." },
  { week: 5,  size: "a sesame seed",  emoji: "•",  body: "The gestational sac is forming. Your clinic will repeat your beta." },
  { week: 6,  size: "a lentil",       emoji: "●",  body: "Your first scan may show a heartbeat flicker. A huge milestone." },
  { week: 7,  size: "a blueberry",    emoji: "🫐", body: "Arm and leg buds are forming. Keep taking your progesterone." },
  { week: 8,  size: "a raspberry",    emoji: "🍓", body: "Fingers and toes are beginning. Many IVF clinics graduate you around now." },
  { week: 10, size: "a strawberry",   emoji: "🍓", body: "All vital organs are formed. Your OB takes over your care." },
  { week: 12, size: "a lime",         emoji: "🍋", body: "End of the first trimester. Nuchal scan time." },
  { week: 16, size: "an avocado",     emoji: "🥑", body: "You might feel the first flutters soon." },
  { week: 20, size: "a banana",       emoji: "🍌", body: "Halfway. The anatomy scan checks your baby head to toe." },
  { week: 28, size: "an aubergine",   emoji: "🍆", body: "Third trimester. Baby can open their eyes." },
  { week: 36, size: "a papaya",       emoji: "🥭", body: "Nearly there. Time to pack the hospital bag." },
  { week: 40, size: "a watermelon",   emoji: "🍉", body: "Due date. After everything, here you are." },
];

export var FAILED_STEPS = [
  { title: "Let yourself grieve", body: "A failed cycle is a real loss. You are allowed to be devastated, angry or numb. There is no timeline." },
  { title: "Ask for a follow-up (WTF) appointment", body: "Most clinics offer a review. Bring questions: embryo quality, lining, protocol changes, testing options." },
  { title: "Take a break if you need it", body: "Many women wait one to three cycles before trying again, for body and heart." },
  { title: "Talk to someone who knows", body: "A free session with an IVF-specialist therapist is always available to you in Bloom." },
];

export var WTF_QUESTIONS = [
  "What do you think happened this cycle?",
  "Would you change my protocol or doses next time?",
  "Should we consider PGT-A testing of embryos?",
  "Is there any testing for me or my partner you'd recommend?",
  "How long should we wait before the next cycle?",
];

export var PARTNER_FEATURES = [
  { mark: "◐", title: "Her cycle phase", desc: "Where she is and what it means", color: "#9B6DC5" },
  { mark: "◔", title: "Upcoming appointments", desc: "Scans, retrieval and transfer dates", color: "#E07A8A" },
  { mark: "♡", title: "How to support her today", desc: "Daily tips matched to her phase", color: "#4ABFB0" },
  { mark: "◈", title: "IVF explained", desc: "Plain-language guides for partners", color: "#C49A3C" },
];

export var PARTNER_TIPS = [
  { title: "Do tonight's injection together", body: "Gonal-F is at 9:00 PM. Prepare the pen, hold her hand, and stay for the whole thing." },
  { title: "Handle dinner", body: "Bloating peaks now. Something warm, salty and protein-rich helps. No need to ask, just do it." },
  { title: "Ask how she feels, not how many follicles", body: "Try: 'How are you really doing today?' and then just listen." },
];

export var PARTNER_SEES = ["Cycle phase and stim day", "Upcoming appointments", "Medication times (not doses)", "Daily support tips"];

export var PARTNER_FAQ = [
  { q: "Can my partner see my journal or Secret Space?", a: "Never. Secret Space, check-in notes and Nora chats are only visible to you." },
  { q: "Can I disconnect at any time?", a: "Yes. Disconnecting instantly removes all access. They are not notified with any details." },
  { q: "Does my partner need to pay?", a: "No. Partner access is included free with every Bloom account." },
  { q: "What if we are not together in person?", a: "Partner Space works anywhere. Many partners use it while travelling for work." },
];

export var SECRET_REPLIES = [
  "I hear you. What you are feeling is completely valid. You are not alone in this. 💜",
  "That is such a human thing to feel. Nobody here will judge you for it.",
  "Thank you for saying it out loud. Carrying it silently is exhausting.",
  "You are allowed to feel this and still be a good, loving person.",
  "That sounds so heavy. Be as gentle with yourself as you would be with a friend.",
];

export var SECRET_PROMPTS = ["I resent friends who got pregnant easily", "I Googled success rates at 3am again", "I am terrified this will never work"];

export var FREE_TIER = ["Basic cycle tracking", "5 Nora messages / day", "3 articles / week", "Onboarding + free therapy session"];

export var PLANS = [
  { id: "plus", name: "Bloom+", monthly: "$19.99", annual: "$129", color: "#9B6DC5",
    features: ["Unlimited Nora AI", "Full Insights library", "Wellbeing Videos", "Community chat", "Two Week Wait mode", "Cycle Report download", "Partner Space", "Check-in history and trends"] },
  { id: "pro", name: "Bloom Pro", monthly: "$29.99", annual: "$199", color: "#E07A8A", popular: true,
    features: ["Everything in Bloom+", "Secret Space", "Unlimited therapy booking", "Priority Nora responses", "Multi-cycle tracking", "Custom medication schedules", "Early access to new features", "Bloom Pro badge in Community"] },
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

// Medical Review Board. DEMO PLACEHOLDERS: these reviewers are fictional and must be
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
  return { reviewer: REVIEW_BOARD.find(function (r) { return r.id === id; }), date: "Aug 2026", sources: SOURCES[cat] || SOURCES.story };
}
