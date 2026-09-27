"use client";

export function Logo({ size = 24, withMark = true }) {
  return (
    <span className="logo" style={{ fontSize: size + "px", lineHeight: 1 }}>
      bloom{withMark ? " ✦" : ""}
    </span>
  );
}

export function BackBtn({ onBack }) {
  return (
    <button onClick={onBack} className="px-4 py-4 text-bloom-accent font-semibold text-sm">← Back</button>
  );
}

export function Label({ children, className = "" }) {
  return <p className={"text-bloom-muted text-xs uppercase tracking-wider font-semibold " + className}>{children}</p>;
}

export function Header({ title, sub }) {
  return (
    <div className="px-4 pb-4">
      <h1 className="text-2xl font-bold text-bloom-text mb-1">{title}</h1>
      {sub && <p className="text-bloom-muted text-sm">{sub}</p>}
    </div>
  );
}

export function Sheet({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-[60]" onClick={onClose}>
      <div className="animate-sheet bg-white w-full max-w-[430px] mx-auto rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={function (e) { e.stopPropagation(); }}>
        {children}
      </div>
    </div>
  );
}

export function Toast({ text }) {
  if (!text) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] bg-bloom-text text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
      {text}
    </div>
  );
}
