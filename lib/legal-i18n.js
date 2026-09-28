// Public pages linked from the app and the store listings: privacy policy, support, account deletion.
// DRAFT pending legal review (docs/sa6/app-store.md, "Legal items"). Items in [square brackets] must be
// completed or confirmed by the founder and a lawyer before the store submission. The Arabic and
// French versions follow the English and need a professional review too.
// Shape per language: { common, privacy, support, deletion }; each document is { title, intro,
// sections: [{ h, p: [paragraph, ...] }] }. tests/legal-i18n.test.mjs keeps the languages in step.

var en = {
  common: {
    draft: "DRAFT pending legal review. This text is not final.",
    updated: "Last updated: 28 September 2026",
    home: "Bloom",
    contact: "Contact",
    langLabel: "Language",
    links: { privacy: "Privacy policy", support: "Help and support", deletion: "Delete your account" },
  },
  privacy: {
    title: "Privacy policy",
    intro: "Bloom is an IVF companion. You trust us with some of the most personal information there is, so this page explains in plain words what Bloom collects, why, who helps us run it, and how you stay in control.",
    sections: [
      { h: "Who we are", p: [
        "Bloom is provided by [legal entity name, registered address, company number] (\"Bloom\", \"we\"). We decide how your data is used (we are the data controller).",
        "Questions about privacy: support@bloomivfcompanion.com.",
      ] },
      { h: "What Bloom collects", p: [
        "Account: your email address and password (the password is handled by our authentication provider; we never see it in plain text).",
        "What you enter: your name, clinic, protocol, cycle phase and day, daily check-ins (mood, anxiety, hope, symptoms, weight, notes), medication and scan logs, appointments, your chats with Nora and your reminder settings.",
        "Secret Space: encrypted on your device with a passphrase only you know. We cannot read it.",
        "Your consent choices, with the version and the time you made them.",
        "Kept only on your phone and never sent to us: your app-lock PIN, whether biometric unlock is on, and your language. Face ID and fingerprint data stay inside your phone's operating system; Bloom never receives them.",
        "We do not use advertising or analytics trackers, and we do not collect your location, contacts or photos.",
      ] },
      { h: "How we use it", p: [
        "Only to run Bloom for you: show your cycle, remind you of doses and appointments, sync your data between your devices, and let Nora answer your questions.",
        "We never sell your data, never use it for advertising, and never use it to make decisions about employment, insurance or credit.",
      ] },
      { h: "Your consent", p: [
        "Health data is special-category data. We process it only with your explicit consent, which you give in two separate choices: syncing your data to your Bloom account (cloud), and sending your messages to Nora's AI provider.",
        "Both are off until you turn them on. You can change either at any time in More → Privacy Centre. Without cloud sync your data stays on your phone; without AI consent Nora answers with offline replies.",
      ] },
      { h: "Who helps us run Bloom", p: [
        "Supabase: account sign-in and the database that stores your synced data (only with your cloud consent).",
        "Anthropic: generates Nora's replies (only with your AI consent). For each message it receives your message, the recent conversation (up to 20 turns), your first name (not in anonymous mode) and your cycle context. It never receives Secret Space. [Confirm Anthropic's data retention and no-training terms before launch.]",
        "Vercel: hosts the Bloom website and servers. Server logs record technical events and token counts, never the content of your messages.",
        "Google Fonts: serves Bloom's fonts, which shows your IP address to Google.",
        "Apple and Google deliver the app and its updates. Reminders are scheduled on your phone and do not pass through our servers.",
      ] },
      { h: "Where your data is stored", p: [
        "Our providers may store or process data outside your country, including in [Supabase region] and the United States. [Describe the safeguards used, for example standard contractual clauses, and the position for users in the UAE, after legal review.]",
      ] },
      { h: "How long we keep it", p: [
        "We keep your synced data until you delete your account. Deleting it removes your account and synced data from our database straight away. [Confirm backup retention, for example up to 30 days.]",
        "Data kept only on your phone stays there until you delete it in Bloom or uninstall the app.",
      ] },
      { h: "Your rights and choices", p: [
        "Download a copy of your data: More → Privacy Centre → Download my data.",
        "Correct your details: More → My Profile.",
        "Delete your account and all your data: More → Privacy Centre → Delete all my data. You can also ask us on the web without the app: bloomivfcompanion.com/delete-account.",
        "Withdraw consent at any time in the Privacy Centre, without affecting anything done before.",
        "You can complain to a data protection authority, for example the UAE Data Office or the supervisory authority where you live in the EU.",
      ] },
      { h: "How we protect it", p: [
        "Encryption in transit (HTTPS), database rules so each account can only reach its own data, end-to-end encryption for Secret Space, an optional app lock with Face ID or fingerprint, and your health data is kept out of phone backups to iCloud or Google.",
      ] },
      { h: "Medical information", p: [
        "Bloom and Nora support you alongside your clinic. They do not give medical advice, diagnose or change your treatment. Always check with your doctor or clinic before making medical decisions. In an emergency, contact your clinic or local emergency services.",
      ] },
      { h: "Age", p: [
        "Bloom is for adults aged 18 and over.",
      ] },
      { h: "Changes to this policy", p: [
        "If we change how we use your data, we will update this page and, where the change affects your consent, ask you again in the app.",
      ] },
    ],
  },
  support: {
    title: "Help and support",
    intro: "We are a small team and we read every message. Write to us and we will reply as soon as we can, usually within two working days.",
    sections: [
      { h: "Contact us", p: ["Email: support@bloomivfcompanion.com. Please don't include medical details you don't need to share."] },
      { h: "In an emergency", p: ["Bloom can't respond to emergencies. If you have severe pain, heavy bleeding, trouble breathing, fainting or a high fever, contact your clinic or local emergency services now."] },
      { h: "Delete my account", p: ["In the app: More → Privacy Centre → Delete all my data. Without the app: see bloomivfcompanion.com/delete-account."] },
      { h: "I forgot my app PIN", p: ["On the lock screen tap \"Forgot PIN?\" and sign out. Sign back in with your email and password; your synced data comes back and you can set a new PIN."] },
      { h: "Reminders don't arrive", p: ["Check that notifications are allowed for Bloom in your phone's Settings, and that reminders are on in More → Reminders. On Android, battery saving can delay reminders by a few minutes."] },
      { h: "Nora gives short offline answers", p: ["Nora uses AI only when you are signed in and have allowed it in More → Privacy Centre. Otherwise she answers with offline replies."] },
    ],
  },
  deletion: {
    title: "Delete your Bloom account",
    intro: "You can delete your Bloom account and all the data linked to it at any time.",
    sections: [
      { h: "In the app (fastest)", p: ["Open Bloom → More → Privacy Centre → Delete all my data, then confirm. Your account, your synced data and the data on that phone are deleted straight away."] },
      { h: "Without the app", p: ["Email support@bloomivfcompanion.com from the email address of your Bloom account with the subject \"Delete my Bloom account\". We will confirm it is you and delete your account within [30] days."] },
      { h: "What is deleted", p: ["Your sign-in, profile, check-ins, logs, Nora chats, Secret Space and consent records. We keep nothing unless the law requires it. [Confirm any legal retention and backup period.]"] },
    ],
  },
};

var ar = {
  common: {
    draft: "مسودة بانتظار المراجعة القانونية. هذا النص ليس نهائيًا.",
    updated: "آخر تحديث: 28 سبتمبر 2026",
    home: "Bloom",
    contact: "تواصلي معنا",
    langLabel: "اللغة",
    links: { privacy: "سياسة الخصوصية", support: "المساعدة والدعم", deletion: "حذف حسابكِ" },
  },
  privacy: {
    title: "سياسة الخصوصية",
    intro: "Bloom رفيقتكِ في رحلة أطفال الأنابيب. تأتمنيننا على بعض أكثر المعلومات خصوصية، لذا نشرح هنا بكلمات بسيطة ما يجمعه Bloom ولماذا، ومن يساعدنا في تشغيله، وكيف تبقين متحكمة ببياناتكِ.",
    sections: [
      { h: "من نحن", p: [
        "يقدّم Bloom [اسم الكيان القانوني، العنوان المسجّل، رقم الشركة] (\"Bloom\" أو \"نحن\"). نحن من يقرّر كيفية استخدام بياناتكِ (المتحكّم في البيانات).",
        "للأسئلة المتعلقة بالخصوصية: support@bloomivfcompanion.com.",
      ] },
      { h: "ما الذي يجمعه Bloom", p: [
        "الحساب: بريدكِ الإلكتروني وكلمة المرور (يتولاها مزوّد تسجيل الدخول؛ لا نراها أبدًا كنص واضح).",
        "ما تُدخلينه: اسمكِ، عيادتكِ، البروتوكول، مرحلة الدورة ويومها، التسجيلات اليومية (المزاج، القلق، الأمل، الأعراض، الوزن، الملاحظات)، سجلات الأدوية والفحوص، المواعيد، محادثاتكِ مع نورا وإعدادات التذكير.",
        "المساحة السرية: مشفّرة على جهازكِ بعبارة مرور لا يعرفها غيركِ. لا يمكننا قراءتها.",
        "خيارات موافقتكِ، مع رقم الإصدار ووقت اختياركِ.",
        "يبقى على هاتفكِ فقط ولا يُرسل إلينا أبدًا: رمز قفل التطبيق، وإعداد الفتح بالقياسات الحيوية، ولغتكِ. بيانات Face ID وبصمة الإصبع تبقى داخل نظام تشغيل هاتفكِ ولا يتلقاها Bloom أبدًا.",
        "لا نستخدم أدوات إعلانات أو تتبّع تحليلي، ولا نجمع موقعكِ أو جهات اتصالكِ أو صوركِ.",
      ] },
      { h: "كيف نستخدمها", p: [
        "فقط لتشغيل Bloom لكِ: عرض دورتكِ، تذكيركِ بالجرعات والمواعيد، مزامنة بياناتكِ بين أجهزتكِ، وتمكين نورا من الإجابة عن أسئلتكِ.",
        "لا نبيع بياناتكِ أبدًا، ولا نستخدمها للإعلانات، ولا لاتخاذ قرارات تتعلق بالتوظيف أو التأمين أو الائتمان.",
      ] },
      { h: "موافقتكِ", p: [
        "البيانات الصحية فئة خاصة من البيانات. لا نعالجها إلا بموافقتكِ الصريحة، التي تمنحينها عبر خيارين منفصلين: مزامنة بياناتكِ مع حسابكِ في Bloom (السحابة)، وإرسال رسائلكِ إلى مزوّد الذكاء الاصطناعي لنورا.",
        "كلاهما متوقف حتى تفعّليه. يمكنكِ تغيير أيّ منهما في أي وقت من المزيد ← مركز الخصوصية. دون المزامنة تبقى بياناتكِ على هاتفكِ؛ ودون موافقة الذكاء الاصطناعي تجيب نورا بردود دون اتصال.",
      ] },
      { h: "من يساعدنا في تشغيل Bloom", p: [
        "Supabase: تسجيل الدخول وقاعدة البيانات التي تحفظ بياناتكِ المتزامنة (فقط بموافقتكِ على السحابة).",
        "Anthropic: تُنشئ ردود نورا (فقط بموافقتكِ على الذكاء الاصطناعي). مع كل رسالة تتلقى رسالتكِ، والمحادثة الأخيرة (حتى 20 رسالة)، واسمكِ الأول (ليس في الوضع المجهول) وسياق دورتكِ. لا تتلقى المساحة السرية أبدًا. [تأكيد شروط Anthropic بشأن الاحتفاظ بالبيانات وعدم استخدامها للتدريب قبل الإطلاق.]",
        "Vercel: تستضيف موقع Bloom وخوادمه. تسجّل سجلات الخادم أحداثًا تقنية وعدد الرموز فقط، وليس محتوى رسائلكِ أبدًا.",
        "Google Fonts: تقدّم خطوط Bloom، ما يُظهر عنوان IP الخاص بكِ لـ Google.",
        "Apple وGoogle توفّران التطبيق وتحديثاته. التذكيرات تُجدول على هاتفكِ ولا تمر عبر خوادمنا.",
      ] },
      { h: "أين تُخزَّن بياناتكِ", p: [
        "قد يخزّن مزوّدونا البيانات أو يعالجونها خارج بلدكِ، بما في ذلك في [منطقة Supabase] والولايات المتحدة. [وصف الضمانات المستخدمة، مثل البنود التعاقدية القياسية، وموقف المستخدمات في الإمارات، بعد المراجعة القانونية.]",
      ] },
      { h: "مدة الاحتفاظ", p: [
        "نحتفظ ببياناتكِ المتزامنة حتى تحذفي حسابكِ. حذف الحساب يزيل حسابكِ وبياناتكِ المتزامنة من قاعدة بياناتنا فورًا. [تأكيد مدة الاحتفاظ بالنسخ الاحتياطية، مثلًا حتى 30 يومًا.]",
        "البيانات المحفوظة على هاتفكِ فقط تبقى هناك حتى تحذفيها في Bloom أو تزيلي التطبيق.",
      ] },
      { h: "حقوقكِ وخياراتكِ", p: [
        "تنزيل نسخة من بياناتكِ: المزيد ← مركز الخصوصية ← تنزيل بياناتي.",
        "تصحيح بياناتكِ: المزيد ← ملفي الشخصي.",
        "حذف حسابكِ وكل بياناتكِ: المزيد ← مركز الخصوصية ← حذف كل بياناتي. ويمكنكِ الطلب عبر الويب دون التطبيق: bloomivfcompanion.com/delete-account.",
        "سحب الموافقة في أي وقت من مركز الخصوصية، دون التأثير على ما تم قبل ذلك.",
        "يمكنكِ تقديم شكوى إلى جهة حماية البيانات، مثل مكتب البيانات في الإمارات أو السلطة الرقابية في بلد إقامتكِ في الاتحاد الأوروبي.",
      ] },
      { h: "كيف نحميها", p: [
        "تشفير أثناء النقل (HTTPS)، وقواعد في قاعدة البيانات تجعل كل حساب يصل إلى بياناته فقط، وتشفير تام للمساحة السرية، وقفل اختياري للتطبيق مع Face ID أو البصمة، كما تُستبعد بياناتكِ الصحية من النسخ الاحتياطية للهاتف على iCloud أو Google.",
      ] },
      { h: "المعلومات الطبية", p: [
        "يدعمكِ Bloom ونورا إلى جانب عيادتكِ. لا يقدّمان نصيحة طبية ولا يشخّصان ولا يغيّران علاجكِ. استشيري طبيبكِ أو عيادتكِ دائمًا قبل اتخاذ أي قرار طبي. في حالة الطوارئ، تواصلي مع عيادتكِ أو خدمات الطوارئ المحلية.",
      ] },
      { h: "العمر", p: [
        "Bloom مخصّص للبالغات من عمر 18 عامًا فأكثر.",
      ] },
      { h: "تغييرات هذه السياسة", p: [
        "إذا غيّرنا طريقة استخدام بياناتكِ، سنحدّث هذه الصفحة، وإذا كان التغيير يمس موافقتكِ فسنطلبها منكِ مجددًا في التطبيق.",
      ] },
    ],
  },
  support: {
    title: "المساعدة والدعم",
    intro: "نحن فريق صغير ونقرأ كل رسالة. راسلينا وسنرد في أقرب وقت، عادةً خلال يومي عمل.",
    sections: [
      { h: "تواصلي معنا", p: ["البريد الإلكتروني: support@bloomivfcompanion.com. يُرجى عدم إرسال تفاصيل طبية لا داعي لمشاركتها."] },
      { h: "في حالة الطوارئ", p: ["لا يستطيع Bloom الاستجابة لحالات الطوارئ. إذا شعرتِ بألم شديد أو نزيف غزير أو صعوبة في التنفس أو إغماء أو حرارة مرتفعة، تواصلي مع عيادتكِ أو خدمات الطوارئ المحلية الآن."] },
      { h: "حذف حسابي", p: ["في التطبيق: المزيد ← مركز الخصوصية ← حذف كل بياناتي. دون التطبيق: راجعي bloomivfcompanion.com/delete-account."] },
      { h: "نسيتُ رمز التطبيق", p: ["على شاشة القفل اضغطي \"نسيتِ الرمز؟\" وسجّلي الخروج. سجّلي الدخول مجددًا ببريدكِ وكلمة المرور؛ ستعود بياناتكِ المتزامنة ويمكنكِ تعيين رمز جديد."] },
      { h: "التذكيرات لا تصل", p: ["تأكدي من السماح بإشعارات Bloom في إعدادات هاتفكِ، ومن تفعيل التذكيرات في المزيد ← التذكيرات. على Android قد يؤخّر توفير البطارية التذكيرات بضع دقائق."] },
      { h: "نورا تعطي إجابات قصيرة دون اتصال", p: ["تستخدم نورا الذكاء الاصطناعي فقط عندما تكونين مسجّلة الدخول وسمحتِ بذلك في المزيد ← مركز الخصوصية. وإلا فهي تجيب بردود دون اتصال."] },
    ],
  },
  deletion: {
    title: "حذف حسابكِ في Bloom",
    intro: "يمكنكِ حذف حسابكِ في Bloom وكل البيانات المرتبطة به في أي وقت.",
    sections: [
      { h: "من التطبيق (الأسرع)", p: ["افتحي Bloom ← المزيد ← مركز الخصوصية ← حذف كل بياناتي، ثم أكّدي. يُحذف حسابكِ وبياناتكِ المتزامنة والبيانات الموجودة على ذلك الهاتف فورًا."] },
      { h: "دون التطبيق", p: ["راسلي support@bloomivfcompanion.com من البريد الإلكتروني لحسابكِ في Bloom بعنوان \"احذفوا حسابي في Bloom\". سنتأكد من هويتكِ ونحذف حسابكِ خلال [30] يومًا."] },
      { h: "ما الذي يُحذف", p: ["بيانات تسجيل الدخول، الملف الشخصي، التسجيلات اليومية، السجلات، محادثات نورا، المساحة السرية وسجلات الموافقة. لا نحتفظ بشيء إلا إذا اشترط القانون ذلك. [تأكيد أي مدة احتفاظ قانونية أو للنسخ الاحتياطية.]"] },
    ],
  },
};

var fr = {
  common: {
    draft: "BROUILLON en attente de relecture juridique. Ce texte n'est pas définitif.",
    updated: "Dernière mise à jour : 28 septembre 2026",
    home: "Bloom",
    contact: "Contact",
    langLabel: "Langue",
    links: { privacy: "Politique de confidentialité", support: "Aide et assistance", deletion: "Supprimer votre compte" },
  },
  privacy: {
    title: "Politique de confidentialité",
    intro: "Bloom est une compagne de FIV. Vous nous confiez des informations parmi les plus personnelles qui soient : cette page explique simplement ce que Bloom collecte, pourquoi, qui nous aide à le faire fonctionner et comment vous gardez le contrôle.",
    sections: [
      { h: "Qui nous sommes", p: [
        "Bloom est fourni par [nom de l'entité juridique, adresse du siège, numéro d'immatriculation] (« Bloom », « nous »). Nous décidons de l'usage de vos données (responsable du traitement).",
        "Questions sur la confidentialité : support@bloomivfcompanion.com.",
      ] },
      { h: "Ce que Bloom collecte", p: [
        "Compte : votre adresse e-mail et votre mot de passe (géré par notre fournisseur d'authentification ; nous ne le voyons jamais en clair).",
        "Ce que vous saisissez : votre prénom, votre clinique, votre protocole, la phase et le jour de votre cycle, vos bilans quotidiens (humeur, anxiété, espoir, symptômes, poids, notes), vos prises de médicaments et résultats d'échographie, vos rendez-vous, vos échanges avec Nora et vos réglages de rappels.",
        "Espace secret : chiffré sur votre appareil avec une phrase secrète que vous seule connaissez. Nous ne pouvons pas le lire.",
        "Vos choix de consentement, avec leur version et leur date.",
        "Conservés uniquement sur votre téléphone, jamais envoyés : votre code de verrouillage, l'activation du déverrouillage biométrique et votre langue. Les données Face ID et d'empreinte restent dans le système de votre téléphone ; Bloom ne les reçoit jamais.",
        "Nous n'utilisons aucun traceur publicitaire ou analytique et ne collectons ni votre position, ni vos contacts, ni vos photos.",
      ] },
      { h: "Comment nous les utilisons", p: [
        "Uniquement pour faire fonctionner Bloom pour vous : afficher votre cycle, vous rappeler doses et rendez-vous, synchroniser vos données entre vos appareils et permettre à Nora de répondre à vos questions.",
        "Nous ne vendons jamais vos données, ne les utilisons jamais pour la publicité ni pour des décisions d'emploi, d'assurance ou de crédit.",
      ] },
      { h: "Votre consentement", p: [
        "Les données de santé sont des données sensibles. Nous ne les traitons qu'avec votre consentement explicite, donné par deux choix distincts : la synchronisation de vos données avec votre compte Bloom (cloud) et l'envoi de vos messages au fournisseur d'IA de Nora.",
        "Les deux sont désactivés tant que vous ne les activez pas. Vous pouvez les modifier à tout moment dans Plus → Espace confidentialité. Sans synchronisation, vos données restent sur votre téléphone ; sans consentement IA, Nora répond hors ligne.",
      ] },
      { h: "Qui nous aide à faire fonctionner Bloom", p: [
        "Supabase : connexion au compte et base de données de vos données synchronisées (uniquement avec votre consentement cloud).",
        "Anthropic : génère les réponses de Nora (uniquement avec votre consentement IA). À chaque message, il reçoit votre message, la conversation récente (jusqu'à 20 échanges), votre prénom (pas en mode anonyme) et le contexte de votre cycle. Il ne reçoit jamais l'Espace secret. [Confirmer les conditions de conservation et de non-entraînement d'Anthropic avant le lancement.]",
        "Vercel : héberge le site et les serveurs de Bloom. Les journaux serveur enregistrent des événements techniques et des nombres de jetons, jamais le contenu de vos messages.",
        "Google Fonts : fournit les polices de Bloom, ce qui communique votre adresse IP à Google.",
        "Apple et Google distribuent l'application et ses mises à jour. Les rappels sont programmés sur votre téléphone et ne passent pas par nos serveurs.",
      ] },
      { h: "Où sont stockées vos données", p: [
        "Nos prestataires peuvent stocker ou traiter des données hors de votre pays, notamment dans [région Supabase] et aux États-Unis. [Décrire les garanties utilisées, par exemple les clauses contractuelles types, et la situation des utilisatrices aux Émirats, après relecture juridique.]",
      ] },
      { h: "Durée de conservation", p: [
        "Nous conservons vos données synchronisées jusqu'à la suppression de votre compte. La suppression efface immédiatement votre compte et vos données synchronisées de notre base. [Confirmer la durée de conservation des sauvegardes, par exemple jusqu'à 30 jours.]",
        "Les données conservées uniquement sur votre téléphone y restent jusqu'à ce que vous les supprimiez dans Bloom ou désinstalliez l'application.",
      ] },
      { h: "Vos droits et vos choix", p: [
        "Télécharger une copie de vos données : Plus → Espace confidentialité → Télécharger mes données.",
        "Corriger vos informations : Plus → Mon profil.",
        "Supprimer votre compte et toutes vos données : Plus → Espace confidentialité → Supprimer toutes mes données. Vous pouvez aussi le demander sur le web sans l'application : bloomivfcompanion.com/delete-account.",
        "Retirer votre consentement à tout moment dans l'Espace confidentialité, sans effet sur ce qui a été fait avant.",
        "Vous pouvez saisir une autorité de protection des données, par exemple le UAE Data Office ou l'autorité de contrôle de votre pays dans l'UE (la CNIL en France).",
      ] },
      { h: "Comment nous les protégeons", p: [
        "Chiffrement en transit (HTTPS), règles de base de données limitant chaque compte à ses propres données, chiffrement de bout en bout de l'Espace secret, verrouillage optionnel avec Face ID ou empreinte, et vos données de santé sont exclues des sauvegardes du téléphone sur iCloud ou Google.",
      ] },
      { h: "Informations médicales", p: [
        "Bloom et Nora vous accompagnent aux côtés de votre clinique. Ils ne donnent pas d'avis médical, ne posent pas de diagnostic et ne modifient pas votre traitement. Consultez toujours votre médecin ou votre clinique avant toute décision médicale. En cas d'urgence, contactez votre clinique ou les services d'urgence.",
      ] },
      { h: "Âge", p: [
        "Bloom est réservé aux adultes de 18 ans et plus.",
      ] },
      { h: "Modifications de cette politique", p: [
        "Si nous changeons l'usage de vos données, nous mettrons cette page à jour et, si cela touche votre consentement, nous vous le redemanderons dans l'application.",
      ] },
    ],
  },
  support: {
    title: "Aide et assistance",
    intro: "Nous sommes une petite équipe et nous lisons chaque message. Écrivez-nous, nous répondons dès que possible, en général sous deux jours ouvrés.",
    sections: [
      { h: "Nous contacter", p: ["E-mail : support@bloomivfcompanion.com. Merci de ne pas inclure de détails médicaux inutiles."] },
      { h: "En cas d'urgence", p: ["Bloom ne peut pas répondre aux urgences. En cas de douleur intense, de saignement abondant, de difficulté à respirer, de malaise ou de forte fièvre, contactez tout de suite votre clinique ou les services d'urgence."] },
      { h: "Supprimer mon compte", p: ["Dans l'application : Plus → Espace confidentialité → Supprimer toutes mes données. Sans l'application : voir bloomivfcompanion.com/delete-account."] },
      { h: "J'ai oublié mon code", p: ["Sur l'écran de verrouillage, touchez « Code oublié ? » et déconnectez-vous. Reconnectez-vous avec votre e-mail et votre mot de passe : vos données synchronisées reviennent et vous pouvez choisir un nouveau code."] },
      { h: "Les rappels n'arrivent pas", p: ["Vérifiez que les notifications de Bloom sont autorisées dans les Réglages du téléphone et que les rappels sont activés dans Plus → Rappels. Sur Android, l'économiseur de batterie peut les retarder de quelques minutes."] },
      { h: "Nora donne de courtes réponses hors ligne", p: ["Nora n'utilise l'IA que si vous êtes connectée et l'avez autorisé dans Plus → Espace confidentialité. Sinon, elle répond hors ligne."] },
    ],
  },
  deletion: {
    title: "Supprimer votre compte Bloom",
    intro: "Vous pouvez supprimer votre compte Bloom et toutes les données qui y sont liées à tout moment.",
    sections: [
      { h: "Dans l'application (le plus rapide)", p: ["Ouvrez Bloom → Plus → Espace confidentialité → Supprimer toutes mes données, puis confirmez. Votre compte, vos données synchronisées et les données de ce téléphone sont supprimés immédiatement."] },
      { h: "Sans l'application", p: ["Écrivez à support@bloomivfcompanion.com depuis l'adresse e-mail de votre compte Bloom avec l'objet « Supprimer mon compte Bloom ». Nous vérifierons votre identité et supprimerons votre compte sous [30] jours."] },
      { h: "Ce qui est supprimé", p: ["Vos identifiants, votre profil, vos bilans, vos journaux, vos échanges avec Nora, votre Espace secret et vos consentements. Nous ne gardons rien sauf obligation légale. [Confirmer toute durée légale de conservation et de sauvegarde.]"] },
    ],
  },
};

export var LEGAL = { en: en, ar: ar, fr: fr };
export var LEGAL_DOCS = ["privacy", "support", "deletion"];
