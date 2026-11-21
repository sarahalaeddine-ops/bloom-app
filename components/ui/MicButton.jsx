"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useT } from "../../lib/i18n";
import { dictationSupported, startDictation } from "../../lib/dictation";

// Voice typing button (lib/dictation.js). Tap to speak, tap again to stop; each finished phrase is
// handed to onText for the parent to add to its text box. Not rendered where the browser can't do
// speech recognition (Firefox, the native app for now).
export default function MicButton({ onText, onListening, className = "", size = 44 }) {
  var { t, lang } = useT();
  var [supported, setSupported] = useState(false);
  var [listening, setListening] = useState(false);
  var [note, setNote] = useState("");
  var stopRef = useRef(null);
  var onTextRef = useRef(onText);
  var onListeningRef = useRef(onListening);

  useEffect(function () { onTextRef.current = onText; onListeningRef.current = onListening; });
  // eslint-disable-next-line react-hooks/set-state-in-effect -- feature check after hydration
  useEffect(function () { setSupported(dictationSupported()); }, []);
  useEffect(function () { return function () { if (stopRef.current) stopRef.current(); }; }, []);

  if (!supported) return null;

  function set(on) {
    setListening(on);
    if (onListeningRef.current) onListeningRef.current(on);
  }

  function toggle() {
    if (listening) {
      if (stopRef.current) stopRef.current();
      return;
    }
    setNote("");
    set(true);
    stopRef.current = startDictation({
      lang: lang,
      onText: function (text) { if (onTextRef.current) onTextRef.current(text); },
      onEnd: function (error) {
        stopRef.current = null;
        set(false);
        if (error) setNote(t("mic.err." + error));
      },
    });
  }

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={toggle} aria-pressed={listening} aria-label={listening ? t("mic.stop") : t("mic.start")}
        className={"rounded-xl flex items-center justify-center transition-colors " + (listening ? "bg-bloom-rose text-white animate-pulse" : "bg-bloom-surface text-bloom-accent border border-bloom-border") + " " + className}
        style={{ width: size, height: size }}>
        {listening ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
      </button>
      {note && <span role="status" className="absolute bottom-full mb-1 end-0 whitespace-nowrap text-[11px] bg-white border border-bloom-border rounded-lg px-2 py-1 text-bloom-muted shadow-sm">{note}</span>}
    </span>
  );
}
