"use client";

const FOLLICLES = [
  {s:18,side:"R"},{s:16,side:"R"},{s:15,side:"R"},
  {s:17,side:"L"},{s:16,side:"L"},{s:14,side:"L"},
  {s:14,side:"R"},{s:13,side:"L"},{s:12,side:"R"},
  {s:12,side:"L"},{s:11,side:"R"},
];

const MEDS = [
  {name:"Gonal-F",   dose:"225 IU",  time:"9:00 PM", taken:true,  color:"#9B6DC5"},
  {name:"Cetrotide", dose:"0.25 mg", time:"8:00 AM", taken:true,  color:"#E07A8A"},
  {name:"Progynova", dose:"2 mg",    time:"8AM/8PM", taken:false, color:"#C49A3C"},
  {name:"Folic Acid",dose:"400mcg",  time:"8:00 AM", taken:true,  color:"#4ABFB0"},
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen({ user }) {
  const name = user?.name || "Sarah";
  const stimDay = user?.stimDay || 7;
  const follicles = user?.follicles || 11;
  const e2 = user?.e2 || 1840;
  const protocol = user?.protocol || "Antagonist";
  const clinic = user?.clinic || "Emirates Fertility Centre";
  const pct = Math.round((stimDay / 12) * 100);

  return (
    <div className="px-4 pb-6">
      <div className="flex justify-between items-center py-4">
        <p className="font-serif text-2xl font-light italic text-bloom-accent" style={{letterSpacing:"0.1em"}}>bloom ✦</p>
        <p className="text-bloom-muted text-xs">Day {stimDay} · {name}</p>
      </div>

      <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider mb-2">{greeting()}, {name} ✦</p>
        <h1 className="text-3xl font-light text-bloom-text mb-1" style={{letterSpacing:"-1px"}}>Stimulation<br/>Day {stimDay}</h1>
        <p className="text-bloom-muted text-sm mb-4">{protocol} Protocol · {clinic}</p>
        <div className="h-1.5 bg-bloom-border rounded-full overflow-hidden">
          <div className="h-full bg-bloom-accent rounded-full transition-all" style={{width: pct + "%"}} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-bloom-dim text-xs">Day 1</span>
          <span className="text-bloom-accent text-xs">{12 - stimDay} days to retrieval est.</span>
          <span className="text-bloom-dim text-xs">Trigger</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[[follicles, "Follicles", "4 mature", "#9B6DC530", "#9B6DC5"],
          [e2 >= 1000 ? (e2/1000).toFixed(1)+"k" : e2, "E2 pg/mL", "day "+stimDay, "#E07A8A30", "#E07A8A"],
          ["8AM", "Next Scan", "Tomorrow", "#4ABFB030", "#4ABFB0"]].map(([val, label, sub, border, color]) => (
          <div key={label} className="bg-white rounded-xl p-3 border text-center" style={{borderColor: border}}>
            <p className="text-xl font-semibold" style={{color, letterSpacing:"-1px"}}>{val}</p>
            <p className="text-bloom-muted text-xs mt-0.5">{label}</p>
            <p className="text-bloom-dim text-xs">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">Follicle Map</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {FOLLICLES.map((f, i) => {
            const mature = f.s >= 16;
            const col = f.side === "R" ? "#9B6DC5" : "#4ABFB0";
            const sz = Math.max(32, Math.min(50, f.s * 2.2));
            return (
              <div key={i} className="flex items-center justify-center rounded-full border-2 flex-col"
                style={{width:sz, height:sz, borderColor: mature ? col : "#C5B8CC", backgroundColor: mature ? col + "20" : "#F0EBE8"}}>
                <span className="text-xs font-bold leading-none" style={{color: mature ? col : "#7A6880", fontSize:"9px"}}>{f.s}</span>
                <span className="leading-none" style={{color:"#C5B8CC", fontSize:"7px"}}>{f.side}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-bloom-accent" /><span className="text-bloom-muted text-xs">Right</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-bloom-teal" /><span className="text-bloom-muted text-xs">Left</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">Medications Today</p>
        <div className="flex flex-col gap-2">
          {MEDS.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
              style={{borderColor: m.taken ? m.color + "40" : "#E8E0DB", backgroundColor: m.taken ? m.color + "08" : "white"}}>
              <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                style={{borderColor: m.taken ? m.color : "#C5B8CC", color: m.taken ? m.color : "#C5B8CC", backgroundColor: m.taken ? m.color + "18" : "#F0EBE8"}}>
                {m.taken ? "✓" : "○"}
              </div>
              <div className="flex-1">
                <p className="text-bloom-text text-sm font-semibold">{m.name} <span className="font-normal text-bloom-muted">{m.dose}</span></p>
                <p className="text-bloom-dim text-xs">{m.time}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                style={{color: m.taken ? "#4ABFB0" : "#7A6880", backgroundColor: m.taken ? "#4ABFB015" : "#F0EBE8"}}>
                {m.taken ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
