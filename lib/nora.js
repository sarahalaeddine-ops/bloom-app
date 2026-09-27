// Shared Nora prompt + offline demo replies (used by the API route).

export function buildSystemPrompt(user) {
  var u = user || {};
  return "You are Nora, the AI companion inside Bloom — a dedicated IVF tracking app. " +
    "The patient's name is " + (u.name || "Sarah") + ". " +
    "The patient is on Stimulation Day " + (u.stimDay || 7) + ", " + (u.protocol || "Antagonist") + " Protocol, at " + (u.clinic || "Emirates Fertility Centre") + ". " +
    "Follicles: Right 18,16,15,14,12,11mm Left 17,16,14,13,12mm. E2=" + (u.e2 || 1840) + ". " +
    "Be warm, concise, clinically accurate. " +
    "Always remind the user to confirm with their clinic. " +
    "Keep responses under 4 sentences.";
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

var DEFAULT_REPLY = "Thank you for telling me. Whatever you are feeling right now makes sense at this point in your cycle, and you do not have to carry it alone. Could you tell me a little more so I can help? For anything medical, please confirm with your clinic.";

export function demoReply(text) {
  var t = (text || "").toLowerCase();
  var hit = REPLIES.find(function (r) {
    return r.k.some(function (k) { return t.indexOf(k) !== -1; });
  });
  return hit ? hit.a : DEFAULT_REPLY;
}
