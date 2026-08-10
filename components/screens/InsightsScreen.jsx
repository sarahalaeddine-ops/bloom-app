"use client";
import { useState } from "react";

const CATS = [
  {id:"all",label:"All",mark:"✦",color:"#9B6DC5"},
  {id:"mental",label:"Mental Health",mark:"◑",color:"#8B7AC5"},
  {id:"nutrition",label:"Nutrition",mark:"✺",color:"#C49A3C"},
  {id:"science",label:"IVF Science",mark:"◈",color:"#9B6DC5"},
  {id:"intimacy",label:"Intimacy",mark:"◇",color:"#E07A8A"},
  {id:"movement",label:"Movement",mark:"◎",color:"#4ABFB0"},
];

const ARTICLES = [
  {id:1,cat:"mental",type:"article",title:"The anxiety is not in your head",summary:"IVF stress is comparable to cancer diagnosis.",body:"Studies show IVF patients experience anxiety comparable to serious illness. Not because they are fragile, but because the stakes are existential.\n\nYour nervous system is responding rationally. This is not weakness.",color:"#EDE8F5",textColor:"#8B7AC5",tag:"Mental Health",popular:true},
  {id:2,cat:"science",type:"video",title:"What makes a quality blastocyst?",summary:"The Gardner grading system explained simply.",body:"Blastocysts are graded on expansion from 1 to 6 where 4 to 6 is preferred. Inner Cell Mass graded A, B, or C where A is best.\n\n4AA or 5AA is top quality. But 3BB blastocysts lead to healthy pregnancies regularly.",color:"#F0EBE8",textColor:"#9B6DC5",tag:"IVF Science",popular:true},
  {id:3,cat:"nutrition",type:"article",title:"The IVF fertility plate",summary:"What to eat during stimulation.",body:"Focus on omega-3s from salmon and walnuts. Eat antioxidants from berries and dark greens. Get protein from eggs and legumes.\n\nAvoid alcohol, trans fats, and more than 200mg caffeine per day.",color:"#FEF9EE",textColor:"#C49A3C",tag:"Nutrition",popular:false},
  {id:4,cat:"mental",type:"video",title:"You do not have to stay positive",summary:"Toxic positivity increases cortisol.",body:"Forced positivity actually increases stress hormones. What helps is emotional processing and realistic optimism.\n\nIt is okay to be scared. Your feelings are not sabotaging your cycle.",color:"#F5EEF8",textColor:"#8B7AC5",tag:"Real Talk",popular:true},
  {id:5,cat:"intimacy",type:"article",title:"Is sex safe during stimulation?",summary:"What your clinic probably did not tell you.",body:"During stimulation your ovaries are enlarged and sensitive. Most clinics advise avoiding penetrative sex from Day 3 onward.\n\nEmotional intimacy is encouraged throughout.",color:"#FEF0F2",textColor:"#E07A8A",tag:"Intimacy",popular:false},
  {id:6,cat:"movement",type:"video",title:"Gentle yoga for stimulation day",summary:"8 minute session safe for IVF.",body:"Gentle movement during stimulation can reduce bloating and anxiety. Avoid inversions and deep twists.\n\nThis 8-minute session is specifically designed for stimulation phase.",color:"#EDFAF8",textColor:"#4ABFB0",tag:"Movement",popular:true},
];

export default function InsightsScreen() {
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = cat === "all" ? ARTICLES : ARTICLES.filter(a => a.cat === cat);
  const popular = ARTICLES.filter(a => a.popular);

  if (selected) return (
    <div className="min-h-screen bg-bloom-bg">
      <button onClick={() => setSelected(null)} className="px-4 py-4 text-bloom-accent font-semibold text-sm">← Back</button>
      <div className="px-4 py-4 rounded-2xl mx-4 mb-4" style={{backgroundColor: selected.color}}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color: selected.textColor}}>{selected.tag}</p>
        <h1 className="text-2xl font-bold text-bloom-text leading-tight">{selected.title}</h1>
      </div>
      <div className="px-4">
        <p className="text-bloom-muted text-base leading-relaxed mb-6 whitespace-pre-wrap">{selected.body}</p>
        <button onClick={() => setSelected(null)} className="w-full py-4 rounded-2xl text-white font-semibold" style={{backgroundColor: selected.textColor}}>Got it</button>
      </div>
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Insights</h1>
        <p className="text-bloom-muted text-sm">Personalized to Stimulation Day 7</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 min-w-16 transition-all"
            style={{borderColor: cat === c.id ? c.color : "#E8E0DB", backgroundColor: cat === c.id ? c.color : "white"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{backgroundColor: cat === c.id ? "rgba(255,255,255,0.25)" : c.color + "18"}}>
              <span style={{color: cat === c.id ? "white" : c.color, fontSize:"14px"}}>{c.mark}</span>
            </div>
            <span className="text-xs font-medium whitespace-nowrap" style={{color: cat === c.id ? "white" : "#7A6880"}}>{c.label}</span>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold text-bloom-text mb-3">Most popular</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
        {popular.map(a => (
          <button key={a.id} onClick={() => setSelected(a)}
            className="flex-shrink-0 w-48 h-56 rounded-2xl overflow-hidden relative text-left"
            style={{backgroundColor: a.color}}>
            {a.type === "video" && (
              <span className="absolute top-3 left-3 bg-black/30 text-white text-xs px-2 py-1 rounded-lg font-semibold">▶ Video</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-6xl" style={{color: a.textColor}}>◈</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{color: a.textColor}}>{a.tag}</p>
              <p className="text-bloom-text text-sm font-bold leading-tight">{a.title}</p>
            </div>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold text-bloom-text mb-3">For you today</h2>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(a => (
          <button key={a.id} onClick={() => setSelected(a)}
            className="rounded-2xl p-4 text-left relative overflow-hidden min-h-40"
            style={{backgroundColor: a.color}}>
            {a.type === "video" && (
              <span className="absolute top-2 left-2 bg-black/25 text-white text-xs px-2 py-0.5 rounded font-semibold">▶</span>
            )}
            <div className="flex items-center justify-center h-14 opacity-20 mb-2">
              <span className="text-4xl" style={{color: a.textColor}}>◈</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{color: a.textColor, fontSize:"9px"}}>{a.tag}</p>
            <p className="text-bloom-text text-xs font-bold leading-tight">{a.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
