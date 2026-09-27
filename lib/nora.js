// Shared Nora prompt + offline demo replies (used by the API route).

var LANG_NAMES = { ar: "Arabic (warm Modern Standard Arabic, addressing the user in the feminine)", fr: "French (use vous)" };

export function buildSystemPrompt(user, lang) {
  var u = user || {};
  return "You are Nora, the AI companion inside Bloom — a dedicated IVF tracking app. " +
    "The patient's name is " + (u.name || "Sarah") + ". " +
    "The patient is on Stimulation Day " + (u.stimDay || 7) + ", " + (u.protocol || "Antagonist") + " Protocol, at " + (u.clinic || "Emirates Fertility Centre") + ". " +
    "Follicles: Right 18,16,15,14,12,11mm Left 17,16,14,13,12mm. E2=" + (u.e2 || 1840) + ". " +
    "Be warm, concise, clinically accurate. " +
    "Always remind the user to confirm with their clinic. " +
    "Keep responses under 4 sentences." +
    (LANG_NAMES[lang] ? " Always reply in " + LANG_NAMES[lang] + ", even if the user writes in another language." : "");
}

var REPLIES = [
  { k: ["e2", "estradiol", "estrogen", "oestrogen"],
    a: "Your E2 of 1,840 pg/mL is made by your growing follicles, and with 11 follicles that is right in the expected range (roughly 150–300 per mature follicle). It is rising nicely from Day 5, which tells your team the stimulation is working. Please confirm the details with your clinic at tomorrow's scan." },
  { k: ["ohss", "hyperstimulation", "swollen", "weight"],
    a: "With 11 follicles and E2 at 1,840 you are being watched closely, but you are not in a high-risk range right now. Keep drinking 2–3 litres a day, weigh yourself each morning in Check-in, and call your clinic straight away if you gain more than 2 kg in 24 hours, feel short of breath or pass very little urine. Please confirm your personal risk with your clinic." },
  { k: ["trigger"],
    a: "Your lead follicles are 18 and 17 mm, and triggers are usually given when two or three reach about 17–20 mm, so it is likely in the next 1–3 days. Your clinic will call with the exact time after tomorrow's 8 AM scan, and the timing matters to the minute. Please confirm with your clinic." },
  { k: ["scared", "afraid", "retrieval", "nervous", "terrified"],
    a: "It is completely normal to feel scared about retrieval, and you are not alone in that. You will be sedated, the procedure takes about 20 minutes, and most women feel crampy and tired afterwards rather than in real pain. Would it help to talk through what the day will look like? Your clinic can also walk you through their exact process." },
  { k: ["follicle", "mature", "size", "egg"],
    a: "You have 11 follicles, and 4 are already mature at 16 mm or more (18, 17, 16, 16). The others are catching up at 11–15 mm, which is exactly why stimulation continues a little longer. Your clinic will confirm the plan at your next scan." },
  { k: ["bloat", "cramp", "pain"],
    a: "Bloating and mild cramping are very common around stim Day 7 as your ovaries grow. Warm, salty, protein-rich meals, lots of fluids and gentle walks can help. If the pain becomes sharp, one-sided or severe, contact your clinic immediately." },
  { k: ["inject", "needle", "gonal", "cetrotide", "missed"],
    a: "Tonight's Gonal-F is at 9:00 PM and Cetrotide is tomorrow at 8:00 AM. Rotating sites and icing the skin first can make it easier. If you ever miss or are late with a dose, call your clinic's nurse line before taking anything extra." },
];

// Offline replies in Arabic and French, matched by the same topics (in that language or English).
var REPLIES_I18N = {
  ar: [
    { k: ["e2", "إستراديول", "استراديول", "الإستروجين", "هرمون"], a: "مستوى E2 لديكِ 1,840 pg/mL تفرزه البصيلات النامية، ومع 11 بصيلة فهو ضمن المعدل المتوقع (حوالي 150–300 لكل بصيلة ناضجة). ارتفاعه منذ اليوم الخامس يخبر فريقكِ أن التنشيط يعمل. يُرجى تأكيد التفاصيل مع عيادتكِ في فحص الغد." },
    { k: ["ohss", "فرط", "انتفاخ شديد", "وزن"], a: "مع 11 بصيلة ومستوى E2 عند 1,840 تتم متابعتكِ عن قرب، لكنكِ لستِ في نطاق خطر مرتفع الآن. اشربي 2–3 لترات يوميًا، وسجّلي وزنكِ كل صباح، واتصلي بعيادتكِ فورًا إذا زاد وزنكِ أكثر من 2 كغ خلال 24 ساعة أو شعرتِ بضيق في التنفس أو قلّ البول كثيرًا. يُرجى تأكيد درجة الخطر مع عيادتكِ." },
    { k: ["trigger", "التفجير", "تفجير"], a: "أكبر بصيلاتكِ 18 و17 ملم، وعادةً تُعطى إبرة التفجير عندما تصل بصيلتان أو ثلاث إلى 17–20 ملم تقريبًا، لذا غالبًا خلال 1–3 أيام. ستتصل بكِ العيادة بالموعد الدقيق بعد فحص الغد، والتوقيت مهم بالدقيقة. يُرجى التأكيد مع عيادتكِ." },
    { k: ["خائفة", "خوف", "قلقة", "سحب", "متوترة"], a: "من الطبيعي تمامًا أن تخافي من سحب البويضات، ولستِ وحدكِ في هذا. ستكونين تحت التخدير، والإجراء يستغرق حوالي 20 دقيقة، وتشعر معظم النساء بعده بتقلصات وتعب أكثر من الألم. هل يساعدكِ أن نتحدث عن تفاصيل ذلك اليوم؟ يمكن لعيادتكِ أيضًا شرح خطواتها." },
    { k: ["بصيلة", "بصيلات", "ناضجة", "بويضة", "حجم"], a: "لديكِ 11 بصيلة، 4 منها ناضجة بحجم 16 ملم أو أكثر (18، 17، 16، 16). البقية تلحق بها بين 11 و15 ملم، ولهذا يستمر التنشيط قليلًا. ستؤكد عيادتكِ الخطة في الفحص القادم." },
    { k: ["انتفاخ", "تقلص", "ألم"], a: "الانتفاخ والتقلصات الخفيفة شائعة جدًا حول اليوم السابع من التنشيط لأن المبيضين يكبران. الوجبات الدافئة الغنية بالبروتين والسوائل الكثيرة والمشي الخفيف قد تساعد. إذا أصبح الألم حادًا أو في جهة واحدة أو شديدًا، اتصلي بعيادتكِ فورًا." },
    { k: ["حقنة", "حقن", "إبرة", "gonal", "cetrotide", "نسيت"], a: "جرعة Gonal-F الليلة الساعة 9:00 مساءً، وCetrotide غدًا الساعة 8:00 صباحًا. تغيير مكان الحقن ووضع الثلج قبلها قد يسهّل الأمر. إذا فاتتكِ جرعة أو تأخرتِ، اتصلي بممرضة العيادة قبل أخذ أي جرعة إضافية." },
  ],
  fr: [
    { k: ["e2", "œstradiol", "oestradiol", "estradiol"], a: "Votre E2 de 1 840 pg/mL est produit par vos follicules en croissance, et avec 11 follicules il se situe dans la fourchette attendue (environ 150 à 300 par follicule mature). Sa hausse depuis le jour 5 montre à votre équipe que la stimulation fonctionne. Confirmez les détails avec votre clinique lors de l'écho de demain." },
    { k: ["hso", "ohss", "hyperstimulation", "poids"], a: "Avec 11 follicules et un E2 à 1 840, vous êtes surveillée de près, mais vous n'êtes pas dans une zone à haut risque pour l'instant. Buvez 2 à 3 litres par jour, pesez-vous chaque matin et appelez immédiatement votre clinique si vous prenez plus de 2 kg en 24 heures, êtes essoufflée ou urinez très peu. Confirmez votre risque personnel avec votre clinique." },
    { k: ["déclenchement", "declenchement", "trigger"], a: "Vos follicules principaux mesurent 18 et 17 mm, et le déclenchement se fait en général quand deux ou trois atteignent environ 17 à 20 mm, donc probablement dans 1 à 3 jours. Votre clinique vous donnera l'heure exacte après l'écho de demain, et le timing compte à la minute près. Confirmez avec votre clinique." },
    { k: ["peur", "angoisse", "ponction", "stressée"], a: "C'est tout à fait normal d'avoir peur de la ponction, et vous n'êtes pas seule. Vous serez sous sédation, l'intervention dure environ 20 minutes et la plupart des femmes ressentent ensuite surtout des crampes et de la fatigue plutôt qu'une vraie douleur. Voulez-vous qu'on parle du déroulé de la journée ? Votre clinique peut aussi vous expliquer son protocole." },
    { k: ["follicule", "mature", "taille", "ovocyte"], a: "Vous avez 11 follicules, dont 4 déjà matures à 16 mm ou plus (18, 17, 16, 16). Les autres rattrapent leur retard entre 11 et 15 mm, c'est pourquoi la stimulation continue encore un peu. Votre clinique confirmera le plan à la prochaine écho." },
    { k: ["ballonn", "crampe", "douleur"], a: "Les ballonnements et de légères crampes sont très fréquents vers le jour 7 de stimulation, car les ovaires grossissent. Des repas chauds, salés et riches en protéines, beaucoup d'eau et de petites marches peuvent aider. Si la douleur devient vive, d'un seul côté ou intense, contactez immédiatement votre clinique." },
    { k: ["injection", "piqûre", "aiguille", "gonal", "cetrotide", "oublié"], a: "Le Gonal-F de ce soir est à 21 h et le Cetrotide demain à 8 h. Alterner les sites et refroidir la peau avant peut aider. Si vous oubliez ou retardez une dose, appelez l'infirmière de votre clinique avant de prendre quoi que ce soit en plus." },
  ],
};

var DEFAULT_I18N = {
  ar: "شكرًا لأنكِ أخبرتِني. كل ما تشعرين به الآن مفهوم في هذه المرحلة من دورتكِ، ولستِ مضطرة لحمله وحدكِ. هل تخبرينني بالمزيد حتى أستطيع مساعدتكِ؟ لأي أمر طبي، يُرجى التأكد مع عيادتكِ.",
  fr: "Merci de me le dire. Ce que vous ressentez est tout à fait compréhensible à ce stade de votre cycle, et vous n'avez pas à le porter seule. Pouvez-vous m'en dire un peu plus pour que je puisse vous aider ? Pour toute question médicale, confirmez avec votre clinique.",
};

var DEFAULT_REPLY = "Thank you for telling me. Whatever you are feeling right now makes sense at this point in your cycle, and you do not have to carry it alone. Could you tell me a little more so I can help? For anything medical, please confirm with your clinic.";

export function demoReply(text, lang) {
  var t = (text || "").toLowerCase();
  function match(list) {
    return list.find(function (r) { return r.k.some(function (k) { return t.indexOf(k) !== -1; }); });
  }
  var local = REPLIES_I18N[lang];
  if (local) {
    var hitLocal = match(local);
    if (hitLocal) return hitLocal.a;
    // An English keyword still maps to the same topic in the user's language.
    var idx = REPLIES.indexOf(match(REPLIES));
    return idx !== -1 && local[idx] ? local[idx].a : DEFAULT_I18N[lang];
  }
  var hit = match(REPLIES);
  return hit ? hit.a : DEFAULT_REPLY;
}
