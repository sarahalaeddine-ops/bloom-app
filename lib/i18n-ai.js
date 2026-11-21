// Strings for the More menu by stage (more.forNow etc.), Nora inside the screens (lib/ai-tasks.js) and voice typing (lib/dictation.js):
// Today with Nora (nb.*), Tell Nora in Check-in (tl.*), Read my results (rr.*), Prepare with Nora
// (prep.*), the microphone (mic.*) and shared AI messages (ai.*). Merged into DICTS by
// lib/i18n.js; tests/i18n.test.mjs keeps en/ar/fr in step. Arabic addresses the user in the
// feminine; French uses "vous".

export var AI_EN = {
  "more.forNow": "For you now · {phase}", "more.everything": "Everything else", "more.changeStage": "Change stage",
  "priv.voiceLabel": "Voice typing: ",
  "priv.voiceBody": "when you tap the microphone, your speech is turned into text: in the Bloom app by your phone's speech recognition (Apple's on iPhone, Google's on Android), on the website by your browser's (Chrome and Edge use Google's or Microsoft's, Safari uses Apple's). That includes Secret Space: your words are encrypted once saved, but the speech service hears them while you speak. Bloom never records or keeps the audio; only the text you see is kept.",
  "mic.start": "Speak instead of typing", "mic.stop": "Stop listening",
  "mic.err.denied": "Allow the microphone to speak", "mic.err.no-speech": "I didn't hear anything",
  "mic.err.network": "Voice typing isn't working right now", "mic.err.unsupported": "Voice typing isn't available here",

  "ai.needsConsent": "Turn on Nora AI in the Privacy Centre to use this.",
  "ai.notMedical": "Written by Nora (AI). Not medical advice: always check with your clinic.",
  "ai.unavailable": "Nora can't do this right now. Please try again later.",
  "ai.busy": "Nora is a little busy. Please try again in a minute.",

  "nb.title": "Today with Nora", "nb.refresh": "Ask Nora for a new briefing", "nb.tip": "Tip:",
  "nb.writing": "Nora is writing your briefing…", "nb.ask": "Talk to Nora",
  "nb.dosesLeft": "{n} doses still to take today", "nb.dosesDone": "All today's doses are logged",
  "nb.noDoses": "No doses in your plan today", "nb.next": "Next: {a}, {when}",
  "nb.lastMood": "Your last check-in: {m}", "nb.noCheckin": "No check-in yet: tell Nora how you feel",

  "tl.title": "Tell Nora how you feel",
  "tl.sub": "Write or say it in your own words. Nora fills in your check-in below for you to check.",
  "tl.ph": "e.g. Tired and bloated today, a bit teary after the injection",
  "tl.fill": "Fill in my check-in", "tl.reading": "Nora is reading…",
  "tl.filled": "I've filled in what you told me below. Check it, change anything, then save.",
  "tl.nothing": "I couldn't find anything to fill in. You can choose below.",
  "tl.urgentTitle": "Please contact your clinic now",
  "tl.urgentBody": "What you describe can need a doctor today. Call your clinic's emergency line, or your local emergency number if you can't reach them or feel very unwell.",
  "tl.privacy": "Nora (Anthropic's AI) reads what you write here to fill in your check-in. It isn't saved as a note.",

  "rr.cta": "Read my results from a photo", "rr.reading": "Nora is reading your results…",
  "rr.privacy": "Take a photo of your clinic's results sheet or choose a PDF. Nora (Anthropic's AI) reads the numbers; Bloom doesn't keep the photo. You can cover your name first.",
  "rr.check": "Nora filled these in. Check every number against your sheet before you save.",
  "rr.converted": "Some values were in other units and have been converted (E2 to pg/mL, progesterone to ng/mL).",
  "rr.unitUnknown": "I couldn't see the unit for a value, so I left it empty. Please type it in.",
  "rr.err.size": "That file is too big. Please choose a photo or a PDF under 3 MB.",
  "rr.err.type": "Please choose a photo or a PDF.",
  "rr.err.consent": "Turn on Nora AI in the Privacy Centre to read results from a photo.",
  "rr.err.busy": "Nora is a little busy. Please try again in a minute.",
  "rr.err.unavailable": "Nora can't read results right now. Please type them in.",
  "rr.err.unreadable": "I couldn't read clear results in that file. Please type them in.",

  "prep.cta": "Prepare with Nora", "prep.loading": "Nora is preparing…",
  "prep.questions": "Questions you could ask", "prep.summary": "Your last few days, to show your doctor",
  "prep.again": "Write it again",
};

export var AI_AR = {
  "more.forNow": "لكِ الآن · {phase}", "more.everything": "كل الميزات الأخرى", "more.changeStage": "تغيير المرحلة",
  "priv.voiceLabel": "الكتابة بالصوت: ",
  "priv.voiceBody": "عندما تضغطين على الميكروفون، يتحوّل كلامكِ إلى نص: في تطبيق Bloom عبر خدمة التعرّف على الكلام في هاتفكِ (Apple على iPhone، وGoogle على Android)، وعلى الموقع عبر متصفحكِ (يستخدم Chrome وEdge خدمة Google أو Microsoft، ويستخدم Safari خدمة Apple). ويشمل ذلك المساحة السرية: تُشفَّر كلماتكِ بعد الحفظ، لكن خدمة الكلام تسمعها أثناء حديثكِ. لا يسجّل Bloom الصوت ولا يحتفظ به أبدًا؛ يُحفظ النص الذي ترينه فقط.",
  "mic.start": "تحدّثي بدل الكتابة", "mic.stop": "إيقاف الاستماع",
  "mic.err.denied": "اسمحي باستخدام الميكروفون للتحدث", "mic.err.no-speech": "لم أسمع شيئًا",
  "mic.err.network": "الكتابة بالصوت لا تعمل الآن", "mic.err.unsupported": "الكتابة بالصوت غير متاحة هنا",

  "ai.needsConsent": "فعّلي نورا بالذكاء الاصطناعي من مركز الخصوصية لاستخدام هذه الميزة.",
  "ai.notMedical": "كتبتها نورا (ذكاء اصطناعي). ليست نصيحة طبية: تأكدي دائمًا مع عيادتكِ.",
  "ai.unavailable": "لا تستطيع نورا القيام بذلك الآن. يُرجى المحاولة لاحقًا.",
  "ai.busy": "نورا مشغولة قليلًا. يُرجى المحاولة بعد دقيقة.",

  "nb.title": "يومكِ مع نورا", "nb.refresh": "اطلبي من نورا ملخصًا جديدًا", "nb.tip": "نصيحة:",
  "nb.writing": "نورا تكتب ملخص يومكِ…", "nb.ask": "تحدّثي مع نورا",
  "nb.dosesLeft": "{n} جرعات متبقية اليوم", "nb.dosesDone": "سُجّلت كل جرعات اليوم",
  "nb.noDoses": "لا جرعات في خطتكِ اليوم", "nb.next": "التالي: {a}، {when}",
  "nb.lastMood": "آخر تسجيل لكِ: {m}", "nb.noCheckin": "لا تسجيل بعد: أخبري نورا بما تشعرين",

  "tl.title": "أخبري نورا بما تشعرين",
  "tl.sub": "اكتبيه أو قوليه بكلماتكِ. تملأ نورا تسجيلكِ في الأسفل لتراجعيه.",
  "tl.ph": "مثلًا: متعبة ومنتفخة اليوم، وبكيت قليلًا بعد الحقنة",
  "tl.fill": "املئي تسجيلي", "tl.reading": "نورا تقرأ…",
  "tl.filled": "ملأتُ في الأسفل ما أخبرتِني به. راجعيه وغيّري ما تريدين، ثم احفظي.",
  "tl.nothing": "لم أجد ما أملؤه. يمكنكِ الاختيار في الأسفل.",
  "tl.urgentTitle": "يُرجى الاتصال بعيادتكِ الآن",
  "tl.urgentBody": "ما تصفينه قد يحتاج إلى طبيب اليوم. اتصلي بخط الطوارئ في عيادتكِ، أو برقم الطوارئ المحلي إذا لم تتمكني من الوصول إليهم أو شعرتِ بتعب شديد.",
  "tl.privacy": "تقرأ نورا (الذكاء الاصطناعي من Anthropic) ما تكتبينه هنا لتملأ تسجيلكِ. لا يُحفظ كملاحظة.",

  "rr.cta": "اقرئي نتائجي من صورة", "rr.reading": "نورا تقرأ نتائجكِ…",
  "rr.privacy": "صوّري ورقة نتائج عيادتكِ أو اختاري ملف PDF. تقرأ نورا (الذكاء الاصطناعي من Anthropic) الأرقام، ولا يحتفظ Bloom بالصورة. يمكنكِ تغطية اسمكِ أولًا.",
  "rr.check": "ملأت نورا هذه القيم. طابقي كل رقم مع ورقتكِ قبل الحفظ.",
  "rr.converted": "بعض القيم كانت بوحدات أخرى وتم تحويلها (E2 إلى pg/mL، والبروجسترون إلى ng/mL).",
  "rr.unitUnknown": "لم أرَ وحدة إحدى القيم، فتركتها فارغة. يُرجى كتابتها.",
  "rr.err.size": "الملف كبير جدًا. اختاري صورة أو ملف PDF أصغر من 3 ميغابايت.",
  "rr.err.type": "يُرجى اختيار صورة أو ملف PDF.",
  "rr.err.consent": "فعّلي نورا بالذكاء الاصطناعي من مركز الخصوصية لقراءة النتائج من صورة.",
  "rr.err.busy": "نورا مشغولة قليلًا. يُرجى المحاولة بعد دقيقة.",
  "rr.err.unavailable": "لا تستطيع نورا قراءة النتائج الآن. يُرجى كتابتها.",
  "rr.err.unreadable": "لم أتمكن من قراءة نتائج واضحة في هذا الملف. يُرجى كتابتها.",

  "prep.cta": "استعدّي مع نورا", "prep.loading": "نورا تُحضّر…",
  "prep.questions": "أسئلة يمكنكِ طرحها", "prep.summary": "أيامكِ الأخيرة، لتعرضيها على طبيبكِ",
  "prep.again": "اكتبيها من جديد",
};

export var AI_FR = {
  "more.forNow": "Pour vous maintenant · {phase}", "more.everything": "Tout le reste", "more.changeStage": "Changer d'étape",
  "priv.voiceLabel": "Dictée : ",
  "priv.voiceBody": "quand vous touchez le micro, votre voix est transformée en texte : dans l'application Bloom par la reconnaissance vocale de votre téléphone (celle d'Apple sur iPhone, de Google sur Android), sur le site par votre navigateur (Chrome et Edge utilisent celle de Google ou de Microsoft, Safari celle d'Apple). Cela vaut aussi pour l'Espace secret : vos mots sont chiffrés une fois enregistrés, mais le service vocal les entend pendant que vous parlez. Bloom n'enregistre ni ne garde jamais l'audio ; seul le texte que vous voyez est conservé.",
  "mic.start": "Parler au lieu d'écrire", "mic.stop": "Arrêter l'écoute",
  "mic.err.denied": "Autorisez le micro pour parler", "mic.err.no-speech": "Je n'ai rien entendu",
  "mic.err.network": "La dictée ne fonctionne pas pour le moment", "mic.err.unsupported": "La dictée n'est pas disponible ici",

  "ai.needsConsent": "Activez Nora IA dans le Centre de confidentialité pour utiliser cette fonction.",
  "ai.notMedical": "Rédigé par Nora (IA). Ce n'est pas un avis médical : vérifiez toujours auprès de votre clinique.",
  "ai.unavailable": "Nora ne peut pas le faire pour le moment. Réessayez plus tard.",
  "ai.busy": "Nora est un peu occupée. Réessayez dans une minute.",

  "nb.title": "Aujourd'hui avec Nora", "nb.refresh": "Demander un nouveau point à Nora", "nb.tip": "Conseil :",
  "nb.writing": "Nora prépare votre point du jour…", "nb.ask": "Parler à Nora",
  "nb.dosesLeft": "{n} prises restantes aujourd'hui", "nb.dosesDone": "Toutes les prises du jour sont notées",
  "nb.noDoses": "Aucune prise prévue aujourd'hui", "nb.next": "Prochain : {a}, {when}",
  "nb.lastMood": "Votre dernier suivi : {m}", "nb.noCheckin": "Pas encore de suivi : dites à Nora comment vous allez",

  "tl.title": "Dites à Nora comment vous allez",
  "tl.sub": "Écrivez-le ou dites-le avec vos mots. Nora remplit votre suivi ci-dessous pour que vous le vérifiiez.",
  "tl.ph": "ex. Fatiguée et ballonnée aujourd'hui, un peu émue après l'injection",
  "tl.fill": "Remplir mon suivi", "tl.reading": "Nora lit…",
  "tl.filled": "J'ai rempli ci-dessous ce que vous m'avez dit. Vérifiez, modifiez si besoin, puis enregistrez.",
  "tl.nothing": "Je n'ai rien trouvé à remplir. Vous pouvez choisir ci-dessous.",
  "tl.urgentTitle": "Contactez votre clinique maintenant",
  "tl.urgentBody": "Ce que vous décrivez peut nécessiter un médecin aujourd'hui. Appelez la ligne d'urgence de votre clinique, ou le numéro d'urgence local si vous ne pouvez pas la joindre ou si vous vous sentez très mal.",
  "tl.privacy": "Nora (l'IA d'Anthropic) lit ce que vous écrivez ici pour remplir votre suivi. Ce n'est pas enregistré comme note.",

  "rr.cta": "Lire mes résultats sur une photo", "rr.reading": "Nora lit vos résultats…",
  "rr.privacy": "Photographiez la feuille de résultats de votre clinique ou choisissez un PDF. Nora (l'IA d'Anthropic) lit les valeurs ; Bloom ne garde pas la photo. Vous pouvez masquer votre nom avant.",
  "rr.check": "Nora a rempli ces valeurs. Comparez chaque nombre avec votre feuille avant d'enregistrer.",
  "rr.converted": "Certaines valeurs étaient dans d'autres unités et ont été converties (E2 en pg/mL, progestérone en ng/mL).",
  "rr.unitUnknown": "Je n'ai pas vu l'unité d'une valeur, je l'ai donc laissée vide. Saisissez-la vous-même.",
  "rr.err.size": "Ce fichier est trop lourd. Choisissez une photo ou un PDF de moins de 3 Mo.",
  "rr.err.type": "Choisissez une photo ou un PDF.",
  "rr.err.consent": "Activez Nora IA dans le Centre de confidentialité pour lire des résultats sur une photo.",
  "rr.err.busy": "Nora est un peu occupée. Réessayez dans une minute.",
  "rr.err.unavailable": "Nora ne peut pas lire de résultats pour le moment. Saisissez-les vous-même.",
  "rr.err.unreadable": "Je n'ai pas pu lire de résultats clairs dans ce fichier. Saisissez-les vous-même.",

  "prep.cta": "Préparer avec Nora", "prep.loading": "Nora prépare…",
  "prep.questions": "Questions à poser", "prep.summary": "Vos derniers jours, à montrer à votre médecin",
  "prep.again": "Réécrire",
};
