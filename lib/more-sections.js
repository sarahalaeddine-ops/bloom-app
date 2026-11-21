// The More menu, by treatment stage: the screens she is most likely to need right now come first,
// everything else is listed underneath (still one tap away). Stage ids are the journey picker's
// (components/ui/JourneyPicker.jsx); an unknown or missing stage counts as stimulation.
//
// "After a failed cycle" is never pushed to the top: she opens it when she chooses to.
export var STAGE_SECTIONS = {
  planning:    ["appointments", "medications", "coaching", "videos", "community", "partner"],
  stimulation: ["medications", "appointments", "charts", "reminders", "report", "coaching"],
  retrieval:   ["appointments", "medications", "report", "videos", "coaching", "partner"],
  transfer:    ["medications", "appointments", "reminders", "videos", "partner", "coaching"],
  tww:         ["tww", "videos", "coaching", "secret", "community", "partner"],
  pregnant:    ["pregnant", "appointments", "medications", "partner", "coaching"],
};

export function stageOf(user) {
  var p = user && user.phase;
  return STAGE_SECTIONS[p] ? p : "stimulation";
}

// Splits the menu's section ids into { now: [...], rest: [...] }, keeping the stage's order for
// "now" and the menu's own order for the rest.
export function splitSections(ids, user) {
  var top = STAGE_SECTIONS[stageOf(user)];
  var now = top.filter(function (id) { return ids.indexOf(id) !== -1; });
  var rest = ids.filter(function (id) { return now.indexOf(id) === -1; });
  return { now: now, rest: rest };
}
