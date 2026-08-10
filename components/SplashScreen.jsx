"use client";
import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(onDone, 500);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`fixed inset-0 bg-bloom-bg flex flex-col items-center justify-center transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #9B6DC5, transparent)" }} />
      <div className="absolute bottom-1/4 -right-20 w-56 h-56 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #E07A8A, transparent)" }} />
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <p className="font-serif text-6xl font-light italic tracking-widest text-bloom-accent" style={{ letterSpacing: "0.15em" }}>
          bloom
        </p>
        <p className="text-bloom-accent text-3xl mt-1">✦</p>
        <div className="w-16 h-px bg-bloom-accent opacity-30 my-6" />
        <p className="text-bloom-muted text-xs tracking-widest uppercase" style={{ letterSpacing: "0.2em" }}>
          Your IVF companion
        </p>
        <div className="flex gap-2 mt-10">
          <div className="w-2 h-2 rounded-full bg-bloom-accent animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-bloom-rose animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-bloom-teal animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
      <p className="absolute bottom-12 text-bloom-dim text-xs tracking-wide">
        You are not alone in this journey
      </p>
    </div>
  );
}
