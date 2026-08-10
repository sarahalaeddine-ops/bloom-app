"use client";
import { useState } from "react";
import { auth } from "../../lib/store";

const SECTIONS = [
  {id:"report",       mark:"↓", label:"My Cycle Report",    color:"#9B6DC5", desc:"Download and share with clinic"},
  {id:"medications",  mark:"◎", label:"Medications",         color:"#9B6DC5", desc:"Injection tracker and log"},
  {id:"appointments", mark:"◔", label:"Appointments",        color:"#E07A8A", desc:"Scans, retrieval, transfer"},
  {id:"charts",       mark:"↗", label:"Charts & Trends",     color:"#E07A8A", desc:"Hormone trends, follicle progress"},
  {id:"tww",          mark:"◔", label:"Two Week Wait",       color:"#C49A3C", desc:"Countdown and daily science"},
  {id:"therapy",      mark:"◇", label:"Therapy & Coaching",  color:"#4ABFB0", desc:"Book IVF-specialist therapists"},
  {id:"videos",       mark:"▶", label:"Wellbeing Videos",    color:"#4ABFB0", desc:"Movement, breathwork, meditation"},
  {id:"community",    mark:"◎", label:"Community",           color:"#9B6DC5", desc:"Anonymous rooms by IVF phase"},
  {id:"failed",       mark:"◈", label:"After a Failed Cycle",color:"#5BADD4", desc:"Grief support and next steps"},
  {id:"partner",      mark:"◑", label:"Partner Space",       color:"#FDBA74", desc:"Invite and connect your partner"},
  {id:"pregnant",     mark:"✦", label:"Pregnancy Journey",   color:"#E07A8A", desc:"Week-by-week pregnancy guide"},
  {id:"secret",       mark:"▣", label:"Secret Space",        color:"#8B7AC5", desc:"Private journal, only you can see"},
  {id:"upgrade",      mark:"✦", label:"Upgrade to Bloom+",   color:"#9B6DC5", desc:"Unlock all features"},
];

function BackBtn({ onBack }) {
  return (
    <button onClick={onBack} className="px-4 py-4 text-bloom-accent font-semibold text-sm">← Back</button>
  );
}

function ComingSoon({ title, onBack }) {
  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-5xl mb-4">🚀</p>
        <h2 className="text-xl font-bold text-bloom-text mb-2">{title}</h2>
        <p className="text-bloom-muted text-sm">Coming soon in the next update!</p>
      </div>
    </div>
  );
}

function MedicationsScreen({ onBack }) {
  const MEDS = [
    {id:1,name:"Gonal-F",dose:"225 IU",time:"9:00 PM",type:"injection",color:"#9B6DC5",nextDose:"Tonight 9:00 PM"},
    {id:2,name:"Cetrotide",dose:"0.25 mg",time:"8:00 AM",type:"injection",color:"#E07A8A",nextDose:"Tomorrow 8AM"},
    {id:3,name:"Progynova",dose:"2 mg",time:"8AM/8PM",type:"oral",color:"#C49A3C",nextDose:"Tonight 8:00 PM"},
    {id:4,name:"Folic Acid",dose:"400 mcg",time:"8:00 AM",type:"oral",color:"#4ABFB0",nextDose:"Tomorrow 8AM"},
  ];
  const [tab, setTab] = useState("today");
  const [taken, setTaken] = useState({1:true,2:true,3:false,4:true});
  const [modal, setModal] = useState(null);
  const [site, setSite] = useState("");
  const [note, setNote] = useState("");
  const [missed, setMissed] = useState(false);
  const SITES = ["Left belly","Right belly","Left thigh","Right thigh"];

  function saveDose() {
    setTaken(prev => ({...prev, [modal.id]: !missed}));
    setModal(null);
  }

  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4 pb-2">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Medications</h1>
        <p className="text-bloom-muted text-sm mb-4">Stimulation Day 7</p>
        <div className="flex bg-bloom-surface rounded-xl p-1 mb-4">
          {["today","log","schedule"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab===t?"bg-white text-bloom-text shadow-sm":"text-bloom-muted"}`}>
              {t==="today"?"Today":t==="log"?"History":"Schedule"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        {tab === "today" && (
          <div>
            {Object.values(taken).every(v=>v) && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3 mb-3">
                <span className="text-xl text-bloom-teal">✦</span>
                <div>
                  <p className="font-bold text-bloom-teal text-sm">All medications taken!</p>
                  <p className="text-bloom-muted text-xs">Consistency is everything this cycle.</p>
                </div>
              </div>
            )}
            <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2">Injections</p>
            {MEDS.filter(m=>m.type==="injection").map(med => (
              <button key={med.id} onClick={() => setModal(med)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border mb-2 text-left"
                style={{borderColor: taken[med.id]?med.color+"40":"#E8E0DB", backgroundColor: taken[med.id]?med.color+"06":"white"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:med.color+"18"}}>
                  <span className="text-sm" style={{color:med.color}}>o</span>
                </div>
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-bold">{med.name} <span className="font-normal text-bloom-muted">{med.dose}</span></p>
                  <p className="text-bloom-dim text-xs">{med.time}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:med.color}}>Next: {med.nextDose}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{backgroundColor:taken[med.id]?"#4ABFB015":med.color+"15",color:taken[med.id]?"#4ABFB0":med.color}}>
                  {taken[med.id]?"Done":"Log"}
                </span>
              </button>
            ))}
            <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 mt-2">Oral medications</p>
            {MEDS.filter(m=>m.type==="oral").map(med => (
              <button key={med.id} onClick={() => setModal(med)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border mb-2 text-left"
                style={{borderColor: taken[med.id]?med.color+"40":"#E8E0DB", backgroundColor: taken[med.id]?med.color+"06":"white"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:med.color+"18"}}>
                  <span className="text-sm" style={{color:med.color}}>+</span>
                </div>
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-bold">{med.name} <span className="font-normal text-bloom-muted">{med.dose}</span></p>
                  <p className="text-bloom-dim text-xs">{med.time}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{backgroundColor:taken[med.id]?"#4ABFB015":med.color+"15",color:taken[med.id]?"#4ABFB0":med.color}}>
                  {taken[med.id]?"Done":"Log"}
                </span>
              </button>
            ))}
          </div>
        )}
        {tab !== "today" && (
          <div className="bg-white rounded-2xl p-8 border border-bloom-border text-center">
            <p className="text-bloom-muted text-sm">{tab === "log" ? "No history yet. Log your first dose above." : "Full schedule coming soon."}</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-[430px] mx-auto rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-bloom-text mb-1">Log dose</h3>
            <p className="text-bloom-muted text-sm mb-4">{modal.name} · {modal.dose}</p>
            <div className="flex gap-3 mb-4">
              <button onClick={() => setMissed(false)} className="flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                style={{borderColor:!missed?"#4ABFB0":"#E8E0DB",backgroundColor:!missed?"#4ABFB015":"white",color:!missed?"#4ABFB0":"#7A6880"}}>Taken</button>
              <button onClick={() => setMissed(true)} className="flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                style={{borderColor:missed?"#E07A8A":"#E8E0DB",backgroundColor:missed?"#E07A8A15":"white",color:missed?"#E07A8A":"#7A6880"}}>Missed</button>
            </div>
            {modal.type === "injection" && !missed && (
              <div className="mb-4">
                <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2">Injection site</p>
                <div className="flex flex-wrap gap-2">
                  {SITES.map(s => (
                    <button key={s} onClick={() => setSite(s)} className="px-3 py-1.5 rounded-full border text-xs transition-all"
                      style={{borderColor:site===s?"#9B6DC5":"#E8E0DB",backgroundColor:site===s?"#9B6DC515":"white",color:site===s?"#9B6DC5":"#7A6880"}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl bg-bloom-surface text-bloom-muted font-semibold text-sm">Cancel</button>
              <button onClick={saveDose} className="flex-2 flex-grow py-3 rounded-xl bg-bloom-accent text-white font-semibold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentsScreen({ onBack }) {
  const APTS = [
    {id:1,type:"Monitoring Scan",date:"Tomorrow",time:"8:00 AM",location:"Emirates Fertility Centre",color:"#9B6DC5",days:1},
    {id:2,type:"Trigger Shot Timing",date:"In 2 days",time:"Clinic call",location:"Phone consultation",color:"#E07A8A",days:2},
    {id:3,type:"Egg Retrieval",date:"In ~4 days",time:"7:30 AM",location:"Emirates Fertility Centre",color:"#C49A3C",days:4},
    {id:4,type:"Embryo Transfer",date:"In ~9 days",time:"10:00 AM",location:"Emirates Fertility Centre",color:"#4ABFB0",days:9},
    {id:5,type:"Beta HCG Test",date:"In ~23 days",time:"8:00 AM",location:"Lab",color:"#9B6DC5",days:23},
  ];
  const [sel, setSel] = useState(null);
  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Appointments</h1>
        <p className="text-bloom-muted text-sm mb-4">Your upcoming schedule</p>
        <div className="bg-white rounded-2xl p-5 border mb-4" style={{borderColor:"#9B6DC530"}}>
          <p className="text-xs font-bold uppercase tracking-wider text-bloom-accent mb-1">Next appointment</p>
          <h2 className="text-xl font-bold text-bloom-text mb-1">Monitoring Scan</h2>
          <p className="text-bloom-muted text-sm mb-4">Tomorrow at 8:00 AM · Emirates Fertility Centre</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[["1","day"],["12","hours"],["30","min"]].map(([n,l]) => (
              <div key={l} className="bg-bloom-surface rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-bloom-accent">{n}</p>
                <p className="text-bloom-muted text-xs">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-bloom-accent text-xs font-semibold mb-2">How to prepare</p>
            {["Drink water before scan","Wear comfortable clothing","Bring medication list","Arrive 10 minutes early"].map((tip,i) => (
              <div key={i} className="flex gap-2 mb-1.5 last:mb-0">
                <span className="text-bloom-accent text-xs">-</span>
                <span className="text-bloom-muted text-xs">{tip}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">All upcoming</p>
        {APTS.map(apt => (
          <button key={apt.id} onClick={() => setSel(sel===apt.id?null:apt.id)}
            className="w-full text-left bg-white rounded-2xl p-4 border mb-2"
            style={{borderColor:apt.color+"30"}}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor:apt.color}} />
              <div className="flex-1">
                <p className="text-bloom-text text-sm font-semibold">{apt.type}</p>
                <p className="text-bloom-muted text-xs">{apt.date} · {apt.time}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{backgroundColor:apt.color+"15",color:apt.color}}>
                {apt.days===1?"Tomorrow":"In "+apt.days+"d"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SecretScreen({ onBack }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [msgs, setMsgs] = useState([{role:"assistant",content:"This is your Secret Space.\n\nEverything here is completely private. Say what you really feel."}]);
  const [input, setInput] = useState("");
  const PROMPTS = ["I resent friends who got pregnant easily","I Googled success rates at 3am again","I am terrified this will never work"];

  if (!unlocked) return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-4xl text-bloom-accent mb-4">▣</p>
        <h2 className="text-xl font-bold text-bloom-text mb-2">Secret Space</h2>
        <p className="text-bloom-muted text-sm mb-6 leading-relaxed">A private space for the feelings you cannot say out loud.</p>
        <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="Enter PIN"
          className="text-center text-xl tracking-widest bg-white border border-bloom-border rounded-2xl px-4 py-3 w-48 text-bloom-text outline-none mb-4" />
        <button onClick={() => {if(pin.length>=4)setUnlocked(true);}} className="bg-bloom-accent text-white font-semibold px-8 py-3 rounded-xl">Enter</button>
      </div>
    </div>
  );

  function send(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const next = [...msgs, {role:"user",content:msg}];
    setMsgs(next);
    setTimeout(() => setMsgs([...next, {role:"assistant",content:"I hear you. What you are feeling is completely valid. You are not alone in this. 💜"}]), 1000);
  }

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <div className="mx-4 mb-3 bg-purple-50 rounded-xl p-3 flex items-center gap-2 border border-purple-200">
        <span className="text-bloom-accent">▣</span>
        <div>
          <p className="text-bloom-accent text-xs font-bold">Secret Space</p>
          <p className="text-bloom-dim text-xs">Only visible to you</p>
        </div>
      </div>
      {msgs.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 mb-3">
          {PROMPTS.map((p,i) => (
            <button key={i} onClick={() => send(p)} className="flex-shrink-0 text-xs text-bloom-muted bg-white border border-bloom-border rounded-full px-3 py-2">"{p}"</button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {msgs.map((m,i) => {
          const isUser = m.role==="user";
          return (
            <div key={i} className={`flex gap-2 mb-3 ${isUser?"flex-row-reverse":""}`}>
              {!isUser && <div className="w-7 h-7 rounded-full bg-bloom-accent flex items-center justify-center flex-shrink-0 mt-auto"><span className="text-white text-xs">▣</span></div>}
              <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser?"bg-bloom-accent text-white":"bg-white border border-bloom-border text-bloom-text"}`}>{m.content}</div>
            </div>
          );
        })}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white border-t border-bloom-border flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Say what you really feel..."
          className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none" />
        <button onClick={() => send()} disabled={!input.trim()} className="w-11 h-11 bg-bloom-accent rounded-xl text-white disabled:opacity-40">→</button>
      </div>
    </div>
  );
}

function UpgradeScreen({ onBack }) {
  const [plan, setPlan] = useState("pro");
  const [billing, setBilling] = useState("annual");
  const PLANS = [
    {id:"plus",name:"Bloom+",price:"$19.99",annual:"$129/yr · save 46%",color:"#9B6DC5",features:["Unlimited Nora AI","Full Insights library","Wellbeing Videos","Community chat","Two Week Wait mode","Cycle Report download","Partner Space"]},
    {id:"pro",name:"Bloom Pro",price:"$29.99",annual:"$199/yr · save 44%",color:"#E07A8A",popular:true,features:["Everything in Bloom+","Secret Space","Unlimited therapy booking","Priority Nora responses","Multi-cycle tracking","Custom medication schedules"]},
  ];
  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <div className="text-center mb-6">
          <p className="font-serif text-3xl font-light italic text-bloom-accent mb-1" style={{letterSpacing:"0.1em"}}>bloom ✦</p>
          <h1 className="text-2xl font-bold text-bloom-text mb-2">Upgrade Bloom</h1>
          <p className="text-bloom-muted text-sm">Get full access to everything Bloom has to offer.</p>
        </div>
        <div className="flex bg-bloom-surface rounded-xl p-1 mb-5">
          {["monthly","annual"].map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${billing===b?"bg-white text-bloom-text shadow-sm":"text-bloom-muted"}`}>
              {b==="annual"?"Annual":"Monthly"}
              {b==="annual" && <span className="bg-bloom-teal text-white text-xs px-1.5 py-0.5 rounded-md">46% off</span>}
            </button>
          ))}
        </div>
        {PLANS.map(p => (
          <button key={p.id} onClick={() => setPlan(p.id)}
            className="w-full text-left bg-white rounded-2xl p-5 border-2 mb-3 relative transition-all"
            style={{borderColor: plan===p.id?p.color:"#E8E0DB"}}>
            {p.popular && <span className="absolute -top-3 right-4 text-white text-xs px-3 py-1 rounded-full font-bold" style={{backgroundColor:p.color}}>Most popular</span>}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all"
                style={{borderColor:plan===p.id?p.color:"#E8E0DB",backgroundColor:plan===p.id?p.color:"white"}}>
                {plan===p.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="font-bold text-base" style={{color:p.color}}>{p.name}</p>
                <p className="text-2xl font-bold text-bloom-text" style={{letterSpacing:"-1px"}}>{p.price} <span className="text-sm font-normal text-bloom-muted">/ month</span></p>
                {billing==="annual" && <p className="text-xs font-semibold mt-0.5" style={{color:p.color}}>{p.annual}</p>}
              </div>
            </div>
            <div className="border-t border-bloom-border pt-3 flex flex-col gap-2">
              {p.features.map((f,i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{color:p.color}}>✓</span>
                  <span className="text-bloom-muted text-xs">{f}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
        <button className="w-full py-4 rounded-2xl text-white font-bold text-base mb-3"
          style={{backgroundColor: plan==="pro"?"#E07A8A":"#9B6DC5"}}>
          Start {plan==="pro"?"Bloom Pro":"Bloom+"} — {billing==="annual"?(plan==="pro"?"$199/yr":"$129/yr"):(plan==="pro"?"$29.99/mo":"$19.99/mo")}
        </button>
        <p className="text-bloom-dim text-xs text-center mb-4">7-day free trial · Cancel anytime</p>
        <button onClick={onBack} className="w-full py-3 text-bloom-muted text-sm font-medium">Continue with free plan</button>
        <div className="h-8" />
      </div>
    </div>
  );
}

function ProfileScreen({ onBack, user, setUser }) {
  const [name, setName] = useState(user?.name || "");
  const [clinic, setClinic] = useState(user?.clinic || "");
  const [protocol, setProtocol] = useState(user?.protocol || "Antagonist");
  const [saved, setSaved] = useState(false);

  function save() {
    const updated = auth.updateUser({name, clinic, protocol});
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function signOut() {
    auth.signOut();
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-5">My Profile</h1>
        <div className="bg-white rounded-2xl p-5 border border-bloom-border mb-4">
          <div className="flex flex-col items-center mb-5">
            <div className="w-16 h-16 rounded-full bg-bloom-accent flex items-center justify-center mb-2">
              <span className="text-white text-2xl font-bold">{name?name[0].toUpperCase():"S"}</span>
            </div>
            <p className="text-bloom-text font-bold">{name || "Sarah"}</p>
            <p className="text-bloom-muted text-xs">{user?.email || ""}</p>
          </div>
          <div className="mb-4">
            <label className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">Your name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none" />
          </div>
          <div className="mb-4">
            <label className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">Clinic</label>
            <input value={clinic} onChange={e=>setClinic(e.target.value)} placeholder="Emirates Fertility Centre" className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none" />
          </div>
          <div className="mb-5">
            <label className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">Protocol</label>
            <div className="flex gap-2 flex-wrap">
              {["Antagonist","Long Lupron","Mini IVF"].map(p => (
                <button key={p} onClick={() => setProtocol(p)}
                  className="px-3 py-2 rounded-full border-2 text-xs font-semibold transition-all"
                  style={{borderColor:protocol===p?"#9B6DC5":"#E8E0DB",backgroundColor:protocol===p?"#9B6DC515":"white",color:protocol===p?"#9B6DC5":"#7A6880"}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button onClick={save} className="w-full py-4 rounded-2xl text-white font-semibold transition-all"
            style={{backgroundColor:saved?"#4ABFB0":"#9B6DC5"}}>
            {saved?"Saved ✓":"Save Changes"}
          </button>
        </div>
        <button onClick={signOut} className="w-full py-4 rounded-2xl border border-red-200 text-red-400 font-semibold text-sm">Sign Out</button>
      </div>
    </div>
  );
}

export default function MoreScreen({ user, setUser }) {
  const [active, setActive] = useState(null);

  const onBack = () => setActive(null);

  if (active === "medications")  return <MedicationsScreen onBack={onBack} />;
  if (active === "appointments") return <AppointmentsScreen onBack={onBack} />;
  if (active === "secret")       return <SecretScreen onBack={onBack} />;
  if (active === "upgrade")      return <UpgradeScreen onBack={onBack} />;
  if (active === "profile")      return <ProfileScreen onBack={onBack} user={user} setUser={setUser} />;
  if (active === "charts" || active === "tww" || active === "therapy" || active === "videos" || active === "community" || active === "failed" || active === "partner" || active === "pregnant" || active === "report") {
    const labels = {charts:"Charts & Trends",tww:"Two Week Wait",therapy:"Therapy & Coaching",videos:"Wellbeing Videos",community:"Community",failed:"After a Failed Cycle",partner:"Partner Space",pregnant:"Pregnancy Journey",report:"My Cycle Report"};
    return <ComingSoon title={labels[active]} onBack={onBack} />;
  }

  const STATS = [
    {l:"Name",         v:user?.name||"Sarah",              c:"#9B6DC5"},
    {l:"Phase",        v:"Stimulation Day "+(user?.stimDay||7), c:"#1A1014"},
    {l:"Protocol",     v:user?.protocol||"Antagonist",     c:"#1A1014"},
    {l:"Follicles",    v:(user?.follicles||11)+" (4 mature)", c:"#4ABFB0"},
    {l:"E2 today",     v:(user?.e2||1840).toLocaleString()+" pg/mL", c:"#E07A8A"},
  ];

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">More in Bloom</h1>
        <p className="text-bloom-muted text-sm">All features</p>
      </div>

      <button onClick={() => setActive("profile")}
        className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border border-purple-200 mb-4">
        <div className="w-12 h-12 rounded-full bg-bloom-accent flex items-center justify-center">
          <span className="text-white text-xl font-bold">{user?.name?user.name[0].toUpperCase():"S"}</span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-bloom-text font-bold text-sm">{user?.name||"Sarah"}</p>
          <p className="text-bloom-muted text-xs">{user?.email||""}</p>
        </div>
        <span className="text-bloom-muted text-sm">Edit →</span>
      </button>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => setActive(sec.id)}
            className="bg-white rounded-2xl p-4 border text-left transition-all"
            style={{borderColor: sec.color + "30"}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{backgroundColor: sec.color + "18"}}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{backgroundColor: sec.color}}>
                <span className="text-white text-sm font-bold">{sec.mark}</span>
              </div>
            </div>
            <p className="text-bloom-text text-sm font-bold mb-0.5">{sec.label}</p>
            <p className="text-bloom-muted text-xs leading-tight">{sec.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">At a glance</p>
        {STATS.map((x,i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-bloom-border last:border-0">
            <span className="text-bloom-muted text-sm">{x.l}</span>
            <span className="text-sm font-semibold" style={{color:x.c}}>{x.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
