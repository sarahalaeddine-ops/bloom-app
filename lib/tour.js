// Investor tour: a guided walk through Bloom using the demo persona (Sarah, 34, first IVF cycle,
// antagonist protocol). Each step moves the real app to a screen (tab, More section, phase,
// language, quick log) and explains what it shows and how she records things there.
// Investor-facing, so English only.

export var STORY = "Sarah is 34, lives in Dubai and is on her first IVF cycle. Follow her from the first injections to the result, whichever way it goes.";

export var CHAPTERS = [
  {
    id: "stims",
    title: "Documenting her day",
    sub: "Injections, symptoms and feelings, in seconds",
    steps: [
      {
        tab: "home", phase: "stimulation",
        title: "Meet Sarah: day 7 of injections",
        body: "Home shows where she is in the whole cycle: the ring runs from stimulation to retrieval, embryos and the two-week wait. The tiles below (follicles, E2 hormone level, next scan) are built from what she has logged, and the cards are picked for today: she logged bloating, so Bloom explains bloating.",
        log: "Nothing to type here. Home is the summary of everything she records.",
      },
      {
        tab: "home", quick: true,
        title: "The + button: log anything in seconds",
        body: "One tap from any screen. She ticks off a dose the moment she injects, picks how she feels, taps symptoms and adds her weight. She can fill in a missed day up to six days back.",
        log: "Tap a dose to mark it taken, tap a mood face, tap symptoms, then save.",
      },
      {
        tab: "more", section: "medications",
        title: "Every injection, on time",
        body: "Today's doses in order, with what is done and what is still due. History shows every dose she has taken, and 'My medications' is her prescription exactly as her clinic gave it: drug, dose, times, days and end date. Injection tips sit underneath for the hard moments.",
        log: "She enters her prescription once under 'My medications'. After that, one tap per dose, with the injection site and a note if she wants.",
        tip: "Tap 'History', then 'My medications'.",
      },
      {
        tab: "more", section: "reminders",
        title: "Reminders she can trust",
        body: "A reminder before every dose (on time, or 5, 15 or 30 minutes early) and an hour before each appointment. Dose alarms can also go into her phone's calendar, so they ring even offline.",
        log: "Turn reminders on once. Bloom schedules them from her medications and appointments.",
      },
      {
        tab: "checkin",
        title: "The daily check-in: how she really is",
        body: "About a minute a day: overall mood, feelings, anxiety and hope scores, symptoms and a private journal note. During stimulation it also watches her weight, because a quick gain can be an early sign of OHSS, a complication of IVF.",
        log: "Tap a mood, the feelings that fit, the symptoms she has, her weight, then 'Save today check-in'.",
        tip: "Scroll down to see her recent check-ins.",
      },
    ],
  },
  {
    id: "clinic",
    title: "Appointments, scans and her clinic",
    sub: "Everything her clinic tells her, in one place",
    steps: [
      {
        tab: "more", section: "appointments",
        title: "Her whole calendar of clinic visits",
        body: "A countdown to the next appointment with how to prepare, then everything ahead: monitoring scan, trigger shot call, egg retrieval, embryo transfer and the pregnancy blood test. Estimated dates are marked with ~ until her clinic confirms them.",
        log: "'+ Add an appointment': type, date, time and clinic. Each one can be added to her phone's calendar.",
      },
      {
        tab: "more", section: "charts",
        title: "Her results, as a picture",
        body: "After each scan she logs her follicle sizes and E2 level. Bloom turns them into trends: E2 by day, the lead follicle growing towards the usual trigger zone, and her mood and weight from the check-ins.",
        log: "'Log a scan result' after each clinic visit: follicle sizes per ovary, plus E2 if she has it.",
        tip: "Tap a point on a chart to see its value.",
      },
      {
        tab: "more", section: "report",
        title: "One tap: a report for her doctor",
        body: "Her whole cycle on one page: hormones by day, the follicle map, every medication and how many doses she took, plus upcoming appointments. She can print it or share it with her clinic instead of scrolling through notes in the waiting room.",
        log: "Created automatically from everything she logged.",
      },
    ],
  },
  {
    id: "nora",
    title: "Nora, her AI companion",
    sub: "Answers at 2 AM, grounded in her own cycle",
    steps: [
      {
        tab: "nora",
        title: "Nora knows her cycle",
        body: "Nora already knows she is on day 7 with 11 follicles and an E2 of 1,840, so the answers are about Sarah, not about IVF in general. She explains, reassures and helps Sarah prepare questions for her clinic.",
        log: "She simply types, or taps a suggested question.",
        tip: "Tap 'Am I at risk for OHSS?' or 'I am scared about retrieval'.",
      },
      {
        tab: "nora",
        title: "Safe by design",
        body: "Nora never diagnoses or changes a dose; she always sends medical decisions back to the clinic. Warning signs such as heavy bleeding, severe pain, OHSS symptoms or thoughts of self-harm get an immediate referral to the clinic or emergency services, in English, Arabic or French. What Nora receives is disclosed in the Privacy Centre.",
        log: "Nothing to set up.",
        tip: "Type 'I'm bleeding heavily' to see the emergency response.",
      },
      {
        tab: "insights",
        title: "Learning, matched to her day",
        body: "Articles and short videos picked for where she is right now (today: E2, hydration, gentle movement), plus what's coming next. Every article is reviewed by Bloom's Medical Review Board.",
        log: "Nothing to log. It follows her phase automatically.",
      },
    ],
  },
  {
    id: "wait",
    title: "The two-week wait",
    sub: "After the embryo transfer",
    steps: [
      {
        tab: "home", phase: "tww",
        title: "Phase change: embryo transferred",
        body: "Retrieval and transfer are done. Sarah moves Bloom to the two-week wait and the whole app follows: Home, insights, Nora and the community rooms all adapt to this phase.",
        log: "'Change phase' on Home: one tap.",
      },
      {
        tab: "more", section: "tww",
        title: "Day by day, one breath at a time",
        body: "Days since transfer, the countdown to her blood test, and what is happening in her body today. Gentle rules for the hardest wait: keep taking every medication, home tests can mislead, no symptoms is normal.",
        log: "She picks which day she is on. Medications and check-ins carry on as before.",
      },
      {
        tab: "more", section: "videos",
        title: "Support for her mind",
        body: "Movement, breathwork and meditation made for IVF, chosen by how she feels right now ('I feel anxious', 'I need rest', 'I am grieving'), with a one-minute guided breath.",
        log: "She can save favourites.",
      },
    ],
  },
  {
    id: "positive",
    title: "A positive result",
    sub: "From the blood test into pregnancy",
    steps: [
      {
        tab: "more", section: "pregnant", phase: "tww",
        title: "She's pregnant: week by week",
        body: "When the blood test is positive, Bloom carries on with her into pregnancy: baby's size, what happens each week, and the first heartbeat scan. It also acknowledges that pregnancy after IVF can feel frightening too.",
        log: "'Change phase' then 'I'm pregnant'. She moves week by week.",
      },
      {
        tab: "more", section: "partner",
        title: "Bringing her partner in",
        body: "Her partner sees her phase, upcoming appointments and a daily tip on how to support her today. She decides what is shared: never her journal, Secret Space or Nora chats.",
        log: "She shares a pairing code over WhatsApp, and her partner joins.",
        tip: "Tap 'Demo: simulate partner joining' to see their view.",
      },
    ],
  },
  {
    id: "failed",
    title: "When a cycle fails",
    sub: "Where most apps go quiet, Bloom stays",
    steps: [
      {
        tab: "more", section: "failed",
        title: "A soft place to land",
        body: "Most IVF cycles do not end in pregnancy. Bloom offers gentle next steps (grieve, book a follow-up, take a break, lean on someone) and a list of questions for the review with her doctor: what happened, protocol changes, testing options.",
        log: "She copies the questions with one tap and takes them to her follow-up.",
      },
      {
        tab: "more", section: "coaching",
        title: "Real people, not just an app",
        body: "Coaching with Tatiana F. Kutteh, a certified life and relationship coach, for emotional support alongside the clinic. It is clearly labelled as coaching, not medical or psychological treatment, with crisis guidance on the same page.",
        log: "She contacts Tatiana directly by phone or WhatsApp, for one-to-one, couples or group coaching.",
      },
      {
        tab: "more", section: "community",
        title: "Women who understand",
        body: "Anonymous rooms for each phase, including one for a failed cycle. Only her flower name is shown, and the house rule is no medical advice. The demo shows sample rooms.",
        log: "She posts under her flower name.",
      },
      {
        tab: "more", section: "secret",
        title: "Secret Space: only for her",
        body: "A private journal locked with her own passphrase and encrypted on her phone. Nobody else can read it, including Bloom.",
        log: "She sets a passphrase once, then writes freely.",
      },
      {
        tab: "more", section: "profile", phase: "planning",
        title: "Ready for the next cycle",
        body: "When she is ready, she moves Bloom to 'Planning' and starts again, with everything from this cycle still saved for her doctor.",
        log: "'Your Bloom journey': tap the phase she is in.",
      },
    ],
  },
  {
    id: "trust",
    title: "Privacy and the region",
    sub: "Health data handled with care",
    steps: [
      {
        tab: "more", section: "privacy", phase: "stimulation",
        title: "Her data, her rules",
        body: "Anonymous mode for shared screens, a PIN app lock, a full download of her data and a plain list of what Bloom holds and what goes to the AI provider. Her health data is never sold or used for advertising.",
        log: "Switches she turns on or off at any time.",
      },
      {
        tab: "home", lang: "ar",
        title: "Built for the region: Arabic",
        body: "The whole app, including Nora, works in Arabic, right to left, with Arabic typography and wording that speaks to her directly. French is available too.",
        log: "She picks her language in her profile.",
      },
      {
        tab: "home", lang: "en",
        title: "That's Bloom",
        body: "One companion for the whole IVF journey: what she takes, what her clinic tells her, how she feels, and the people around her, from the first injection to the result and beyond.",
        log: "Close the tour and explore freely, or pick another scenario from the menu.",
      },
    ],
  },
];

// All steps in order, each tagged with its chapter.
export var STEPS = CHAPTERS.reduce(function (all, ch, ci) {
  return all.concat(ch.steps.map(function (s, si) {
    return Object.assign({ chapter: ch.id, chapterIndex: ci, chapterTitle: ch.title, stepInChapter: si, chapterSize: ch.steps.length }, s);
  }));
}, []);

export function firstStepOf(chapterId) {
  for (var i = 0; i < STEPS.length; i++) if (STEPS[i].chapter === chapterId) return i;
  return 0;
}

// The screen state a step needs. Phase and language carry forward from earlier steps so jumping
// into the middle of the tour shows the app as it would be at that point in the story.
export function stateAt(index) {
  var phase = "stimulation";
  var lang = "en";
  for (var i = 0; i <= index && i < STEPS.length; i++) {
    if (STEPS[i].phase) phase = STEPS[i].phase;
    if (STEPS[i].lang) lang = STEPS[i].lang;
  }
  var s = STEPS[index] || STEPS[0];
  return { tab: s.tab, section: s.section || null, quick: !!s.quick, phase: phase, lang: lang };
}
