"use client";
import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  var [show, setShow] = useState(true);

  useEffect(function () {
    var inner;
    var t = setTimeout(function () {
      setShow(false);
      inner = setTimeout(onDone, 500);
    }, 2500);
    return function () { clearTimeout(t); clearTimeout(inner); };
  }, [onDone]);

  return (
    <div className={"fixed inset-0 bg-bloom-bg flex flex-col items-center justify-center transition-opacity duration-500 " + (show ? "opacity-100" : "opacity-0")}>
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <p className="logo" style={{ fontSize: "64px", lineHeight: "1" }}>bloom</p>
        <p style={{ color: "#9B6DC5", fontSize: "32px", marginTop: "4px" }}>✦</p>
        <div className="w-16 h-px bg-bloom-accent opacity-30 my-6" />
        <p className="text-bloom-dim uppercase" style={{ fontSize: "11px", letterSpacing: "0.2em" }}>
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
