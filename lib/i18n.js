"use client";
// Bloom i18n: English, Arabic (RTL) and French. Arabic addresses the user in the feminine.
// Missing keys fall back to English, then to the key itself.
import { createContext, createElement, useContext, useEffect, useState } from "react";
import { store } from "./store";

export var LANGS = [
  { id: "en", label: "English",  dir: "ltr", locale: "en-GB" },
  { id: "ar", label: "العربية",  dir: "rtl", locale: "ar-AE-u-nu-latn" },
  { id: "fr", label: "Français", dir: "ltr", locale: "fr-FR" },
];

var en = {
  "app.tagline": "Your IVF companion",
  "app.notAlone": "You are not alone in this journey",
  "lang": "Language",
  "common.back": "Back",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.day": "Day {n}",

  "tab.home": "Home", "tab.checkin": "Check-in", "tab.nora": "Nora AI", "tab.insights": "Insights", "tab.more": "More",

  "greet.morning": "Good morning", "greet.afternoon": "Good afternoon", "greet.evening": "Good evening",
  "home.stimulation": "Stimulation",
  "home.currentPhase": "Current phase",
  "home.toRetrieval": "~{n} days to retrieval",
  "home.protocol": "{p} Protocol",
  "journey.stim": "Stims", "journey.retrieval": "Retrieval", "journey.embryo": "Embryos", "journey.tww": "2WW",
  "home.follicles": "Follicles", "home.mature": "{n} mature", "home.e2": "E2 pg/mL", "home.nextScan": "Next Scan", "home.tomorrow": "Tomorrow",
  "home.week": "Your week",
  "home.streak": "{n}-day check-in streak",
  "home.startStreak": "Start your streak today",
  "home.checkedIn": "Checked in today ✓ Your flower is growing.",
  "home.checkInCta": "Check in to grow a new petal. Takes 1 minute.",
  "home.today": "Today",
  "home.follicleMap": "Follicle Map",
  "home.scan": "Day {n} scan",
  "home.rightOvary": "Right ovary", "home.leftOvary": "Left ovary",
  "home.filled": "Filled = mature (≥{mm}mm)",
  "home.medsToday": "Medications Today",
  "home.log": "Log →",
  "med.done": "Done ✓", "med.missed": "Missed", "med.pending": "Pending",

  "phase.stimulation": "Stimulation", "phase.tww": "Two Week Wait", "phase.retrieval": "Post Retrieval", "phase.transfer": "Pre Transfer", "phase.planning": "Planning",
  "phase.stimulation.d": "Daily injections, monitoring scans", "phase.tww.d": "After transfer, waiting for beta", "phase.retrieval.d": "Eggs retrieved, waiting for embryos",
  "phase.transfer.d": "Preparing for embryo transfer", "phase.planning.d": "Planning my first or next cycle",

  "mood.0": "Hard", "mood.1": "Low", "mood.2": "Okay", "mood.3": "Hopeful", "mood.4": "Good",
  "sym.Bloating": "Bloating", "sym.Cramping": "Cramping", "sym.Headache": "Headache", "sym.Nausea": "Nausea", "sym.Breast tenderness": "Breast tenderness",
  "sym.Hot flashes": "Hot flashes", "sym.Fatigue": "Fatigue", "sym.Injection site pain": "Injection site pain", "sym.Back pain": "Back pain",
  "sym.Mood swings": "Mood swings", "sym.Spotting": "Spotting", "sym.Insomnia": "Insomnia",

  "ql.aria": "Quick log",
  "ql.title": "Quick log",
  "ql.sub": "Tap what applies. Everything is optional.",
  "ql.doses": "Doses",
  "ql.allDone": "All of today's doses are logged ✓",
  "ql.mood": "Mood", "ql.symptoms": "Symptoms", "ql.weight": "Weight (OHSS watch)",
  "ql.saved": "Logged. A new petal for your flower ✦",
  "ql.doseLogged": "{med} logged ✓",
  "ohss.title": "OHSS alert: +{n} kg since your last weigh-in",
  "ohss.body": "A gain of 2 kg or more in 24 hours can be a sign of OHSS. Please call your clinic today, especially if you feel short of breath or very bloated.",
  "ohss.call": "I'll call my clinic",

  "ci.title": "How are you today?", "ci.sub": "Takes about 1 minute",
  "ci.mood": "Overall mood", "ci.anxiety": "Anxiety level", "ci.hope": "Hopefulness", "ci.symptoms": "Symptoms today",
  "ci.ohss": "OHSS Watch · Daily Weight",
  "ci.ohssNote": "⚠ With {n} follicles, track daily. Alert if +2kg in 24hrs.",
  "ci.last": "Last: {w}",
  "ci.journal": "Journal note", "ci.journalPh": "How are you really feeling today?",
  "ci.save": "Save today check-in", "ci.recent": "Recent check-ins",
  "ci.pickMood": "Pick how you are feeling to save your check-in.",
  "ci.saved": "Check-in saved", "ci.savedSub": "Every data point helps us understand your journey better.", "ci.again": "Check in again",
  "ci.anxietyShort": "Anxiety {n}/5", "ci.hopeShort": "Hope {n}/5",

  "auth.signup": "Sign Up", "auth.login": "Sign In", "auth.name": "Your name", "auth.email": "Email", "auth.password": "Password",
  "auth.pwPh": "At least 8 characters", "auth.create": "Create Account", "auth.busy": "One moment…",
  "auth.toLogin": "Already have an account? Switch to Sign In", "auth.toSignup": "New to Bloom? Switch to Sign Up",
  "auth.demo": "✦ Try the demo as Sarah", "auth.private": "Your data is private and never sold.",
  "auth.errName": "Please enter your name", "auth.errFields": "Please enter email and password", "auth.errEmail": "Please enter a valid email",
  "auth.errNetwork": "Something went wrong. Please check your connection and try again.",

  "onb.welcome": "Welcome, {name} 💜",
  "onb.intro": "Bloom is your personal IVF companion. We will track your cycle, guide you through every phase, and be here when the anxiety peaks.",
  "onb.f1": "Live follicle map and hormone trends", "onb.f2": "Nora AI — your IVF guide", "onb.f3": "Daily check-ins and symptom tracking",
  "onb.f4": "Secret Space for the hard feelings", "onb.f5": "Partner mode to keep them in the loop",
  "onb.clinic": "Your clinic", "onb.clinicQ": "Where are you doing your IVF?", "onb.clinicPh": "e.g. Emirates Fertility Centre", "onb.clinicHint": "This helps Bloom personalize your experience",
  "onb.protocol": "Your protocol", "onb.protocolQ": "What protocol are you on?", "onb.notSure": "Not sure yet",
  "onb.phase": "Your current phase", "onb.phaseQ": "Where are you in your cycle right now?",
  "onb.day": "Your stim day", "onb.dayQ": "What day of stimulation are you on?", "onb.dayLabel": "Day of Stimulation",
  "onb.therapy": "One free session. Mandatory.",
  "onb.therapyBody": "Every woman who joins Bloom gets one free session with an IVF-specialist therapist. We made it mandatory because most women who need it would never book it on their own.",
  "onb.therapyRole": "Reproductive Psychiatry · 12 years IVF support", "onb.therapyNext": "Next available: Tomorrow 2:00 PM",
  "onb.book": "Book my free session", "onb.booked": "Booked ✓ Tomorrow 2:00 PM", "onb.later": "You can also book later from the Therapy screen",
  "onb.ready": "Bloom is ready!", "onb.readyBody": "Your cycle is set up. Nora is ready to guide you. You are not alone in this journey.",
  "onb.sumName": "Name", "onb.sumClinic": "Clinic", "onb.sumProtocol": "Protocol", "onb.sumPhase": "Phase", "onb.sumDay": "Stim Day",
  "onb.sumTherapy": "Free therapy", "onb.sumBooked": "Booked ✓", "onb.sumLater": "Book later",
  "onb.open": "Open Bloom ✦", "onb.start": "Get Started →", "onb.continue": "Continue →",

  "more.title": "More in Bloom", "more.sub": "All features", "more.edit": "Edit →", "more.glance": "At a glance",
  "more.name": "Name", "more.phase": "Phase", "more.protocol": "Protocol", "more.follicles": "Follicles", "more.e2": "E2 today",
  "more.hidden": "Hidden", "more.plan": "Your plan: {p}", "more.stimDay": "Stimulation Day {n}", "more.follicleVal": "{t} ({m} mature)",
  "sec.report": "My Cycle Report", "sec.report.d": "Download and share with clinic",
  "sec.medications": "Medications", "sec.medications.d": "Injection tracker and log",
  "sec.appointments": "Appointments", "sec.appointments.d": "Scans, retrieval, transfer",
  "sec.charts": "Charts & Trends", "sec.charts.d": "Hormone trends, follicle progress",
  "sec.tww": "Two Week Wait", "sec.tww.d": "Countdown and daily science",
  "sec.therapy": "Therapy & Coaching", "sec.therapy.d": "Book IVF-specialist therapists",
  "sec.videos": "Wellbeing Videos", "sec.videos.d": "Movement, breathwork, meditation",
  "sec.community": "Community", "sec.community.d": "Anonymous rooms by IVF phase",
  "sec.failed": "After a Failed Cycle", "sec.failed.d": "Grief support and next steps",
  "sec.partner": "Partner Space", "sec.partner.d": "Invite and connect your partner",
  "sec.pregnant": "Pregnancy Journey", "sec.pregnant.d": "Week-by-week pregnancy guide",
  "sec.secret": "Secret Space", "sec.secret.d": "Encrypted journal, only you can read",
  "sec.reminders": "Reminders", "sec.reminders.d": "Dose and appointment alerts",
  "sec.privacy": "Privacy Centre", "sec.privacy.d": "App lock, anonymous mode, your data",
  "sec.upgrade": "Upgrade to Bloom+", "sec.upgrade.d": "Unlock all features",

  "nora.status": "Online · Knows your cycle", "nora.newChat": "New chat", "nora.ph": "Ask Nora anything...",
  "nora.notDoctor": "Nora is not a doctor. Always confirm medical decisions with your clinic.",
  "nora.demo": "Demo mode · add ANTHROPIC_API_KEY for live Nora",
  "nora.welcome": "Hi {name}. I am Nora, your IVF companion.\n\nYou are on Stimulation Day {day} with 11 follicles and E2 at {e2}. Things look really promising.\n\nHow are you feeling today?",
  "nora.s1": "What does my E2 mean?", "nora.s2": "Am I at risk for OHSS?", "nora.s3": "When is my trigger shot?", "nora.s4": "I am scared about retrieval",
  "nora.error": "Something went wrong. Please try again.",

  "ins.title": "Insights", "ins.personal": "Personalized to {phase}", "ins.board": "Every article is reviewed by our Medical Review Board",
  "ins.popular": "Most popular", "ins.forYou": "For you today", "ins.read": "✓ Read", "ins.video": "▶ Video", "ins.gotIt": "Got it",
  "ins.sources": "Sources", "ins.general": "General information only. Please confirm anything medical with your clinic.",
  "ins.enOnly": "This article is currently available in English.",
  "cat.all": "All", "cat.mental": "Mental Health", "cat.nutrition": "Nutrition", "cat.science": "IVF Science", "cat.intimacy": "Intimacy", "cat.movement": "Movement",

  "story.today": "Today for you", "story.tap": "Tap to continue", "story.close": "Close story",
  "why.logged": "Because you logged {s}", "why.anxiety": "Because anxiety was high", "why.hard": "Because yesterday was hard",
  "review.by": "Medically reviewed by {name} · {date}",
};

var ar = {
  "app.tagline": "رفيقتك في رحلة أطفال الأنابيب",
  "app.notAlone": "لستِ وحدكِ في هذه الرحلة",
  "lang": "اللغة",
  "common.back": "رجوع", "common.save": "حفظ", "common.cancel": "إلغاء", "common.day": "اليوم {n}",

  "tab.home": "الرئيسية", "tab.checkin": "تسجيل يومي", "tab.nora": "نورا", "tab.insights": "معرفة", "tab.more": "المزيد",

  "greet.morning": "صباح الخير", "greet.afternoon": "مساء الخير", "greet.evening": "مساء الخير",
  "home.stimulation": "التنشيط", "home.currentPhase": "المرحلة الحالية",
  "home.toRetrieval": "حوالي {n} أيام حتى سحب البويضات",
  "home.protocol": "بروتوكول {p}",
  "journey.stim": "التنشيط", "journey.retrieval": "السحب", "journey.embryo": "الأجنة", "journey.tww": "الانتظار",
  "home.follicles": "بصيلات", "home.mature": "{n} ناضجة", "home.e2": "E2 pg/mL", "home.nextScan": "الفحص القادم", "home.tomorrow": "غدًا",
  "home.week": "أسبوعكِ",
  "home.streak": "{n} أيام متتالية من التسجيل",
  "home.startStreak": "ابدئي سلسلتكِ اليوم",
  "home.checkedIn": "سجّلتِ اليوم ✓ زهرتكِ تنمو.",
  "home.checkInCta": "سجّلي لتنمو بتلة جديدة. دقيقة واحدة فقط.",
  "home.today": "اليوم",
  "home.follicleMap": "خريطة البصيلات", "home.scan": "فحص اليوم {n}",
  "home.rightOvary": "المبيض الأيمن", "home.leftOvary": "المبيض الأيسر",
  "home.filled": "الممتلئة = ناضجة (≥{mm} ملم)",
  "home.medsToday": "أدوية اليوم", "home.log": "تسجيل ←",
  "med.done": "تم ✓", "med.missed": "فائتة", "med.pending": "بانتظار",

  "phase.stimulation": "التنشيط", "phase.tww": "انتظار الأسبوعين", "phase.retrieval": "بعد سحب البويضات", "phase.transfer": "قبل الإرجاع", "phase.planning": "التخطيط",
  "phase.stimulation.d": "حقن يومية وفحوصات متابعة", "phase.tww.d": "بعد الإرجاع، بانتظار تحليل الحمل", "phase.retrieval.d": "تم سحب البويضات، بانتظار الأجنة",
  "phase.transfer.d": "الاستعداد لإرجاع الأجنة", "phase.planning.d": "أخطط لدورتي الأولى أو التالية",

  "mood.0": "صعب", "mood.1": "منخفض", "mood.2": "لا بأس", "mood.3": "متفائلة", "mood.4": "جيد",
  "sym.Bloating": "انتفاخ", "sym.Cramping": "تقلصات", "sym.Headache": "صداع", "sym.Nausea": "غثيان", "sym.Breast tenderness": "ألم في الثدي",
  "sym.Hot flashes": "هبّات ساخنة", "sym.Fatigue": "إرهاق", "sym.Injection site pain": "ألم مكان الحقن", "sym.Back pain": "ألم الظهر",
  "sym.Mood swings": "تقلّب المزاج", "sym.Spotting": "تنقيط", "sym.Insomnia": "أرق",

  "ql.aria": "تسجيل سريع", "ql.title": "تسجيل سريع", "ql.sub": "اختاري ما ينطبق. كل شيء اختياري.",
  "ql.doses": "الجرعات", "ql.allDone": "سُجّلت كل جرعات اليوم ✓",
  "ql.mood": "المزاج", "ql.symptoms": "الأعراض", "ql.weight": "الوزن (مراقبة فرط التنشيط)",
  "ql.saved": "تم التسجيل. بتلة جديدة لزهرتكِ ✦", "ql.doseLogged": "تم تسجيل {med} ✓",
  "ohss.title": "تنبيه فرط تنشيط المبيض: +{n} كغ منذ آخر وزن",
  "ohss.body": "زيادة 2 كغ أو أكثر خلال 24 ساعة قد تكون علامة على فرط تنشيط المبيض. يُرجى الاتصال بعيادتكِ اليوم، خاصة إذا شعرتِ بضيق في التنفس أو انتفاخ شديد.",
  "ohss.call": "سأتصل بعيادتي",

  "ci.title": "كيف حالكِ اليوم؟", "ci.sub": "دقيقة واحدة تقريبًا",
  "ci.mood": "المزاج العام", "ci.anxiety": "مستوى القلق", "ci.hope": "الأمل", "ci.symptoms": "أعراض اليوم",
  "ci.ohss": "مراقبة فرط التنشيط · الوزن اليومي",
  "ci.ohssNote": "⚠ مع {n} بصيلة، سجّلي وزنكِ يوميًا. تنبيه عند زيادة 2 كغ خلال 24 ساعة.",
  "ci.last": "الأخير: {w}",
  "ci.journal": "ملاحظة يومية", "ci.journalPh": "كيف تشعرين حقًا اليوم؟",
  "ci.save": "حفظ تسجيل اليوم", "ci.recent": "التسجيلات الأخيرة",
  "ci.pickMood": "اختاري شعوركِ لحفظ التسجيل.",
  "ci.saved": "تم حفظ التسجيل", "ci.savedSub": "كل معلومة تساعدنا على فهم رحلتكِ بشكل أفضل.", "ci.again": "تسجيل مرة أخرى",
  "ci.anxietyShort": "القلق {n}/5", "ci.hopeShort": "الأمل {n}/5",

  "auth.signup": "إنشاء حساب", "auth.login": "تسجيل الدخول", "auth.name": "اسمكِ", "auth.email": "البريد الإلكتروني", "auth.password": "كلمة المرور",
  "auth.pwPh": "8 أحرف على الأقل", "auth.create": "إنشاء الحساب", "auth.busy": "لحظة من فضلكِ…",
  "auth.toLogin": "لديكِ حساب؟ سجّلي الدخول", "auth.toSignup": "جديدة في Bloom؟ أنشئي حسابًا",
  "auth.demo": "✦ جرّبي النسخة التجريبية باسم سارة", "auth.private": "بياناتكِ خاصة ولا تُباع أبدًا.",
  "auth.errName": "يُرجى إدخال اسمكِ", "auth.errFields": "يُرجى إدخال البريد وكلمة المرور", "auth.errEmail": "يُرجى إدخال بريد إلكتروني صحيح",
  "auth.errNetwork": "حدث خطأ. تحققي من الاتصال وحاولي مرة أخرى.",

  "onb.welcome": "أهلًا {name} 💜",
  "onb.intro": "Bloom رفيقتكِ الشخصية في رحلة أطفال الأنابيب. نتابع دورتكِ، ونرشدكِ في كل مرحلة، ونكون معكِ حين يشتد القلق.",
  "onb.f1": "خريطة حيّة للبصيلات ومنحنيات الهرمونات", "onb.f2": "نورا — مرشدتكِ الذكية", "onb.f3": "تسجيل يومي ومتابعة الأعراض",
  "onb.f4": "مساحة سرّية للمشاعر الصعبة", "onb.f5": "وضع الشريك لإبقائه على اطلاع",
  "onb.clinic": "عيادتكِ", "onb.clinicQ": "أين تُجرين عملية أطفال الأنابيب؟", "onb.clinicPh": "مثال: مركز الإمارات للخصوبة", "onb.clinicHint": "يساعد هذا Bloom على تخصيص تجربتكِ",
  "onb.protocol": "بروتوكولكِ", "onb.protocolQ": "ما البروتوكول الذي تتبعينه؟", "onb.notSure": "لستُ متأكدة بعد",
  "onb.phase": "مرحلتكِ الحالية", "onb.phaseQ": "أين أنتِ في دورتكِ الآن؟",
  "onb.day": "يوم التنشيط", "onb.dayQ": "في أي يوم من التنشيط أنتِ؟", "onb.dayLabel": "يوم التنشيط",
  "onb.therapy": "جلسة مجانية. إلزامية.",
  "onb.therapyBody": "كل امرأة تنضم إلى Bloom تحصل على جلسة مجانية مع معالِجة متخصصة في أطفال الأنابيب. جعلناها إلزامية لأن معظم من يحتجن إليها لن يحجزنها بأنفسهن.",
  "onb.therapyRole": "الطب النفسي الإنجابي · 12 عامًا في دعم أطفال الأنابيب", "onb.therapyNext": "أقرب موعد: غدًا 2:00 مساءً",
  "onb.book": "احجزي جلستي المجانية", "onb.booked": "تم الحجز ✓ غدًا 2:00 مساءً", "onb.later": "يمكنكِ الحجز لاحقًا من شاشة العلاج",
  "onb.ready": "Bloom جاهز!", "onb.readyBody": "تم إعداد دورتكِ. نورا جاهزة لإرشادكِ. لستِ وحدكِ في هذه الرحلة.",
  "onb.sumName": "الاسم", "onb.sumClinic": "العيادة", "onb.sumProtocol": "البروتوكول", "onb.sumPhase": "المرحلة", "onb.sumDay": "يوم التنشيط",
  "onb.sumTherapy": "جلسة مجانية", "onb.sumBooked": "تم الحجز ✓", "onb.sumLater": "الحجز لاحقًا",
  "onb.open": "افتحي Bloom ✦", "onb.start": "لنبدأ ←", "onb.continue": "متابعة ←",

  "more.title": "المزيد في Bloom", "more.sub": "كل الميزات", "more.edit": "تعديل ←", "more.glance": "نظرة سريعة",
  "more.name": "الاسم", "more.phase": "المرحلة", "more.protocol": "البروتوكول", "more.follicles": "البصيلات", "more.e2": "E2 اليوم",
  "more.hidden": "مخفي", "more.plan": "خطتكِ: {p}", "more.stimDay": "التنشيط اليوم {n}", "more.follicleVal": "{t} ({m} ناضجة)",
  "sec.report": "تقرير دورتي", "sec.report.d": "حمّليه وشاركيه مع العيادة",
  "sec.medications": "الأدوية", "sec.medications.d": "متابعة الحقن والسجل",
  "sec.appointments": "المواعيد", "sec.appointments.d": "الفحوصات والسحب والإرجاع",
  "sec.charts": "الرسوم البيانية", "sec.charts.d": "منحنيات الهرمونات وتقدم البصيلات",
  "sec.tww": "انتظار الأسبوعين", "sec.tww.d": "عدّ تنازلي ومعلومة كل يوم",
  "sec.therapy": "العلاج والإرشاد", "sec.therapy.d": "احجزي مع معالِجات متخصصات",
  "sec.videos": "فيديوهات العافية", "sec.videos.d": "حركة وتنفس وتأمل",
  "sec.community": "المجتمع", "sec.community.d": "غرف مجهولة حسب المرحلة",
  "sec.failed": "بعد دورة غير ناجحة", "sec.failed.d": "دعم في الحزن والخطوات التالية",
  "sec.partner": "مساحة الشريك", "sec.partner.d": "ادعي شريككِ وتواصلا",
  "sec.pregnant": "رحلة الحمل", "sec.pregnant.d": "دليل الحمل أسبوعًا بأسبوع",
  "sec.secret": "المساحة السرّية", "sec.secret.d": "يوميات مشفّرة لا يقرؤها سواكِ",
  "sec.reminders": "التذكيرات", "sec.reminders.d": "تنبيهات الجرعات والمواعيد",
  "sec.privacy": "مركز الخصوصية", "sec.privacy.d": "قفل التطبيق، الوضع المجهول، بياناتكِ",
  "sec.upgrade": "الترقية إلى Bloom+", "sec.upgrade.d": "افتحي كل الميزات",

  "nora.status": "متصلة · تعرف دورتكِ", "nora.newChat": "محادثة جديدة", "nora.ph": "اسألي نورا أي شيء...",
  "nora.notDoctor": "نورا ليست طبيبة. تأكدي دائمًا من القرارات الطبية مع عيادتكِ.",
  "nora.demo": "وضع تجريبي · أضيفي ANTHROPIC_API_KEY لتفعيل نورا",
  "nora.welcome": "أهلًا {name}. أنا نورا، رفيقتكِ في رحلة أطفال الأنابيب.\n\nأنتِ في اليوم {day} من التنشيط، مع 11 بصيلة ومستوى E2 عند {e2}. الأمور تبدو مبشّرة جدًا.\n\nكيف تشعرين اليوم؟",
  "nora.s1": "ماذا يعني مستوى E2 لديّ؟", "nora.s2": "هل أنا معرّضة لفرط التنشيط؟", "nora.s3": "متى إبرة التفجير؟", "nora.s4": "أنا خائفة من سحب البويضات",
  "nora.error": "حدث خطأ. حاولي مرة أخرى.",

  "ins.title": "معرفة", "ins.personal": "مخصّص لـ {phase}", "ins.board": "كل مقال يراجعه مجلسنا الطبي",
  "ins.popular": "الأكثر قراءة", "ins.forYou": "لكِ اليوم", "ins.read": "✓ مقروء", "ins.video": "▶ فيديو", "ins.gotIt": "فهمت",
  "ins.sources": "المصادر", "ins.general": "معلومات عامة فقط. تأكدي من أي أمر طبي مع عيادتكِ.",
  "ins.enOnly": "هذا المقال متوفر حاليًا باللغة الإنجليزية.",
  "cat.all": "الكل", "cat.mental": "الصحة النفسية", "cat.nutrition": "التغذية", "cat.science": "علم أطفال الأنابيب", "cat.intimacy": "العلاقة الحميمة", "cat.movement": "الحركة",

  "story.today": "لكِ اليوم", "story.tap": "اضغطي للمتابعة", "story.close": "إغلاق القصة",
  "why.logged": "لأنكِ سجّلتِ {s}", "why.anxiety": "لأن القلق كان مرتفعًا", "why.hard": "لأن الأمس كان صعبًا",
  "review.by": "راجعته طبيًا {name} · {date}",
};

var fr = {
  "app.tagline": "Votre compagne FIV",
  "app.notAlone": "Vous n'êtes pas seule dans ce parcours",
  "lang": "Langue",
  "common.back": "Retour", "common.save": "Enregistrer", "common.cancel": "Annuler", "common.day": "Jour {n}",

  "tab.home": "Accueil", "tab.checkin": "Suivi", "tab.nora": "Nora IA", "tab.insights": "Conseils", "tab.more": "Plus",

  "greet.morning": "Bonjour", "greet.afternoon": "Bon après-midi", "greet.evening": "Bonsoir",
  "home.stimulation": "Stimulation", "home.currentPhase": "Phase actuelle",
  "home.toRetrieval": "~{n} jours avant la ponction",
  "home.protocol": "Protocole {p}",
  "journey.stim": "Stimulation", "journey.retrieval": "Ponction", "journey.embryo": "Embryons", "journey.tww": "Attente",
  "home.follicles": "Follicules", "home.mature": "{n} matures", "home.e2": "E2 pg/mL", "home.nextScan": "Prochaine écho", "home.tomorrow": "Demain",
  "home.week": "Votre semaine",
  "home.streak": "{n} jours de suivi d'affilée",
  "home.startStreak": "Commencez votre série aujourd'hui",
  "home.checkedIn": "Suivi fait aujourd'hui ✓ Votre fleur grandit.",
  "home.checkInCta": "Faites votre suivi pour un nouveau pétale. 1 minute.",
  "home.today": "Auj.",
  "home.follicleMap": "Carte des follicules", "home.scan": "Écho du jour {n}",
  "home.rightOvary": "Ovaire droit", "home.leftOvary": "Ovaire gauche",
  "home.filled": "Plein = mature (≥{mm} mm)",
  "home.medsToday": "Traitements du jour", "home.log": "Noter →",
  "med.done": "Fait ✓", "med.missed": "Oublié", "med.pending": "À faire",

  "phase.stimulation": "Stimulation", "phase.tww": "Attente de deux semaines", "phase.retrieval": "Après la ponction", "phase.transfer": "Avant le transfert", "phase.planning": "Préparation",
  "phase.stimulation.d": "Injections quotidiennes, échographies", "phase.tww.d": "Après le transfert, en attente de la bêta", "phase.retrieval.d": "Ovocytes prélevés, en attente des embryons",
  "phase.transfer.d": "Préparation au transfert d'embryon", "phase.planning.d": "Je prépare mon premier ou prochain cycle",

  "mood.0": "Difficile", "mood.1": "Bas", "mood.2": "Ça va", "mood.3": "Pleine d'espoir", "mood.4": "Bien",
  "sym.Bloating": "Ballonnements", "sym.Cramping": "Crampes", "sym.Headache": "Maux de tête", "sym.Nausea": "Nausées", "sym.Breast tenderness": "Seins sensibles",
  "sym.Hot flashes": "Bouffées de chaleur", "sym.Fatigue": "Fatigue", "sym.Injection site pain": "Douleur au point d'injection", "sym.Back pain": "Mal de dos",
  "sym.Mood swings": "Sautes d'humeur", "sym.Spotting": "Saignements légers", "sym.Insomnia": "Insomnie",

  "ql.aria": "Saisie rapide", "ql.title": "Saisie rapide", "ql.sub": "Touchez ce qui s'applique. Tout est facultatif.",
  "ql.doses": "Doses", "ql.allDone": "Toutes les doses du jour sont notées ✓",
  "ql.mood": "Humeur", "ql.symptoms": "Symptômes", "ql.weight": "Poids (surveillance HSO)",
  "ql.saved": "C'est noté. Un nouveau pétale pour votre fleur ✦", "ql.doseLogged": "{med} noté ✓",
  "ohss.title": "Alerte HSO : +{n} kg depuis la dernière pesée",
  "ohss.body": "Une prise de 2 kg ou plus en 24 heures peut être un signe d'hyperstimulation ovarienne. Appelez votre clinique aujourd'hui, surtout si vous êtes essoufflée ou très ballonnée.",
  "ohss.call": "J'appelle ma clinique",

  "ci.title": "Comment allez-vous aujourd'hui ?", "ci.sub": "Environ 1 minute",
  "ci.mood": "Humeur générale", "ci.anxiety": "Niveau d'anxiété", "ci.hope": "Espoir", "ci.symptoms": "Symptômes du jour",
  "ci.ohss": "Surveillance HSO · Poids quotidien",
  "ci.ohssNote": "⚠ Avec {n} follicules, pesez-vous chaque jour. Alerte si +2 kg en 24 h.",
  "ci.last": "Dernier : {w}",
  "ci.journal": "Note du jour", "ci.journalPh": "Comment vous sentez-vous vraiment ?",
  "ci.save": "Enregistrer le suivi du jour", "ci.recent": "Suivis récents",
  "ci.pickMood": "Choisissez votre humeur pour enregistrer le suivi.",
  "ci.saved": "Suivi enregistré", "ci.savedSub": "Chaque donnée nous aide à mieux comprendre votre parcours.", "ci.again": "Refaire un suivi",
  "ci.anxietyShort": "Anxiété {n}/5", "ci.hopeShort": "Espoir {n}/5",

  "auth.signup": "S'inscrire", "auth.login": "Se connecter", "auth.name": "Votre prénom", "auth.email": "E-mail", "auth.password": "Mot de passe",
  "auth.pwPh": "8 caractères minimum", "auth.create": "Créer mon compte", "auth.busy": "Un instant…",
  "auth.toLogin": "Déjà un compte ? Se connecter", "auth.toSignup": "Nouvelle sur Bloom ? S'inscrire",
  "auth.demo": "✦ Essayer la démo avec Sarah", "auth.private": "Vos données sont privées et ne sont jamais vendues.",
  "auth.errName": "Veuillez saisir votre prénom", "auth.errFields": "Veuillez saisir l'e-mail et le mot de passe", "auth.errEmail": "Veuillez saisir un e-mail valide",
  "auth.errNetwork": "Une erreur est survenue. Vérifiez votre connexion et réessayez.",

  "onb.welcome": "Bienvenue, {name} 💜",
  "onb.intro": "Bloom est votre compagne FIV personnelle. Nous suivons votre cycle, vous guidons à chaque étape et sommes là quand l'anxiété monte.",
  "onb.f1": "Carte des follicules et courbes hormonales", "onb.f2": "Nora IA — votre guide FIV", "onb.f3": "Suivi quotidien des symptômes",
  "onb.f4": "Espace secret pour les émotions difficiles", "onb.f5": "Mode partenaire pour le tenir informé",
  "onb.clinic": "Votre clinique", "onb.clinicQ": "Où faites-vous votre FIV ?", "onb.clinicPh": "ex. Emirates Fertility Centre", "onb.clinicHint": "Cela aide Bloom à personnaliser votre expérience",
  "onb.protocol": "Votre protocole", "onb.protocolQ": "Quel protocole suivez-vous ?", "onb.notSure": "Je ne sais pas encore",
  "onb.phase": "Votre phase actuelle", "onb.phaseQ": "Où en êtes-vous dans votre cycle ?",
  "onb.day": "Votre jour de stimulation", "onb.dayQ": "À quel jour de stimulation êtes-vous ?", "onb.dayLabel": "Jour de stimulation",
  "onb.therapy": "Une séance offerte. Obligatoire.",
  "onb.therapyBody": "Chaque femme qui rejoint Bloom reçoit une séance gratuite avec une thérapeute spécialisée en FIV. Elle est obligatoire, car la plupart de celles qui en ont besoin ne la réserveraient jamais d'elles-mêmes.",
  "onb.therapyRole": "Psychiatrie reproductive · 12 ans d'accompagnement FIV", "onb.therapyNext": "Prochain créneau : demain 14 h",
  "onb.book": "Réserver ma séance offerte", "onb.booked": "Réservé ✓ Demain 14 h", "onb.later": "Vous pourrez aussi réserver plus tard dans Thérapie",
  "onb.ready": "Bloom est prêt !", "onb.readyBody": "Votre cycle est configuré. Nora est prête à vous guider. Vous n'êtes pas seule dans ce parcours.",
  "onb.sumName": "Prénom", "onb.sumClinic": "Clinique", "onb.sumProtocol": "Protocole", "onb.sumPhase": "Phase", "onb.sumDay": "Jour de stim.",
  "onb.sumTherapy": "Séance offerte", "onb.sumBooked": "Réservée ✓", "onb.sumLater": "Plus tard",
  "onb.open": "Ouvrir Bloom ✦", "onb.start": "Commencer →", "onb.continue": "Continuer →",

  "more.title": "Plus dans Bloom", "more.sub": "Toutes les fonctionnalités", "more.edit": "Modifier →", "more.glance": "En un coup d'œil",
  "more.name": "Prénom", "more.phase": "Phase", "more.protocol": "Protocole", "more.follicles": "Follicules", "more.e2": "E2 du jour",
  "more.hidden": "Masqué", "more.plan": "Votre offre : {p}", "more.stimDay": "Stimulation jour {n}", "more.follicleVal": "{t} ({m} matures)",
  "sec.report": "Mon rapport de cycle", "sec.report.d": "À télécharger et partager",
  "sec.medications": "Traitements", "sec.medications.d": "Suivi et journal des injections",
  "sec.appointments": "Rendez-vous", "sec.appointments.d": "Échos, ponction, transfert",
  "sec.charts": "Courbes", "sec.charts.d": "Hormones et follicules",
  "sec.tww": "Attente de 2 semaines", "sec.tww.d": "Compte à rebours et science du jour",
  "sec.therapy": "Thérapie & coaching", "sec.therapy.d": "Thérapeutes spécialisées FIV",
  "sec.videos": "Vidéos bien-être", "sec.videos.d": "Mouvement, respiration, méditation",
  "sec.community": "Communauté", "sec.community.d": "Salons anonymes par étape",
  "sec.failed": "Après un échec", "sec.failed.d": "Soutien et prochaines étapes",
  "sec.partner": "Espace partenaire", "sec.partner.d": "Invitez votre partenaire",
  "sec.pregnant": "Grossesse", "sec.pregnant.d": "Guide semaine par semaine",
  "sec.secret": "Espace secret", "sec.secret.d": "Journal chiffré, lisible par vous seule",
  "sec.reminders": "Rappels", "sec.reminders.d": "Alertes doses et rendez-vous",
  "sec.privacy": "Confidentialité", "sec.privacy.d": "Verrou, mode anonyme, vos données",
  "sec.upgrade": "Passer à Bloom+", "sec.upgrade.d": "Toutes les fonctionnalités",

  "nora.status": "En ligne · Connaît votre cycle", "nora.newChat": "Nouvelle discussion", "nora.ph": "Posez votre question à Nora...",
  "nora.notDoctor": "Nora n'est pas médecin. Confirmez toujours les décisions médicales avec votre clinique.",
  "nora.demo": "Mode démo · ajoutez ANTHROPIC_API_KEY pour activer Nora",
  "nora.welcome": "Bonjour {name}. Je suis Nora, votre compagne FIV.\n\nVous êtes au jour {day} de stimulation avec 11 follicules et un E2 à {e2}. Tout cela est très encourageant.\n\nComment vous sentez-vous aujourd'hui ?",
  "nora.s1": "Que signifie mon E2 ?", "nora.s2": "Suis-je à risque d'HSO ?", "nora.s3": "Quand aura lieu mon déclenchement ?", "nora.s4": "J'ai peur de la ponction",
  "nora.error": "Une erreur est survenue. Réessayez.",

  "ins.title": "Conseils", "ins.personal": "Personnalisé pour : {phase}", "ins.board": "Chaque article est relu par notre comité médical",
  "ins.popular": "Les plus lus", "ins.forYou": "Pour vous aujourd'hui", "ins.read": "✓ Lu", "ins.video": "▶ Vidéo", "ins.gotIt": "Compris",
  "ins.sources": "Sources", "ins.general": "Informations générales uniquement. Confirmez tout point médical avec votre clinique.",
  "ins.enOnly": "Cet article est pour l'instant disponible en anglais.",
  "cat.all": "Tout", "cat.mental": "Santé mentale", "cat.nutrition": "Nutrition", "cat.science": "Science FIV", "cat.intimacy": "Intimité", "cat.movement": "Mouvement",

  "story.today": "Pour vous aujourd'hui", "story.tap": "Touchez pour continuer", "story.close": "Fermer",
  "why.logged": "Car vous avez noté : {s}", "why.anxiety": "Car votre anxiété était élevée", "why.hard": "Car hier était difficile",
  "review.by": "Relu médicalement par {name} · {date}",
};

export var DICTS = { en: en, ar: ar, fr: fr };

export function translate(lang, key, vars) {
  var s = (DICTS[lang] && DICTS[lang][key]) || en[key] || key;
  if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
  return s;
}

export function langInfo(lang) {
  return LANGS.find(function (l) { return l.id === lang; }) || LANGS[0];
}

function initialLang() {
  var saved = store.get("lang", null);
  if (saved && DICTS[saved]) return saved;
  if (typeof navigator !== "undefined") {
    var n = (navigator.language || "en").slice(0, 2);
    if (DICTS[n]) return n;
  }
  return "en";
}

var LangContext = createContext({ lang: "en", setLang: function () {} });

export function LangProvider({ children }) {
  var [lang, setLangState] = useState("en");

  useEffect(function () {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- language is read from storage/navigator after hydration
    setLangState(initialLang());
  }, []);

  useEffect(function () {
    var info = langInfo(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = info.dir;
  }, [lang]);

  function setLang(l) {
    store.set("lang", l);
    setLangState(l);
  }

  return createElement(LangContext.Provider, { value: { lang: lang, setLang: setLang } }, children);
}

export function useT() {
  var ctx = useContext(LangContext);
  var info = langInfo(ctx.lang);
  return {
    lang: ctx.lang,
    dir: info.dir,
    locale: info.locale,
    setLang: ctx.setLang,
    t: function (key, vars) { return translate(ctx.lang, key, vars); },
  };
}
