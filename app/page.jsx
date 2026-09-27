import WaitlistForm from "../components/site/WaitlistForm";

export const metadata = {
  title: "Bloom — The hardest journey. Not alone.",
  description: "An AI companion built for women going through IVF. Join the waitlist.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Bloom — The hardest journey. Not alone.",
    description: "An AI companion built for women going through IVF. Join the waitlist.",
    url: "/",
    siteName: "Bloom",
    type: "website",
  },
};

var FEATURES = [
  { mark: "◎", color: "#9B6DC5", title: "Your cycle, day by day", body: "Stimulation days, follicle sizes and hormone levels in one calm place, with charts that show how things are moving." },
  { mark: "◔", color: "#E07A8A", title: "Injections and appointments", body: "Reminders for every dose and every scan, retrieval and transfer, so nothing slips through on the hardest days." },
  { mark: "✦", color: "#C49A3C", title: "Nora, day and night", body: "An AI companion who knows where you are in your cycle and answers the 2 AM questions without judgement." },
  { mark: "◇", color: "#4ABFB0", title: "Support for your mind", body: "IVF-specialist therapists, breathwork and movement videos, and a private journal only you can read." },
  { mark: "◑", color: "#FDBA74", title: "Room for your partner", body: "Invite your partner in so they can follow along, understand each step and know how to show up for you." },
  { mark: "◈", color: "#5BADD4", title: "Whatever the outcome", body: "From the two-week wait to a positive test, or gentle support and next steps after a cycle that did not work." },
];

var STEPS = [
  { n: "01", title: "Tell Bloom where you are", body: "Your clinic, your protocol and the day you are on. It takes a couple of minutes." },
  { n: "02", title: "Check in each day", body: "Log how you feel, your doses and your scan results. Bloom turns them into a clear picture." },
  { n: "03", title: "Never face it alone", body: "Ask Nora anything, bring your partner along, and reach real people when you need them." },
];

var FAQ = [
  { q: "What is Bloom?", a: "Bloom is a companion app for women going through IVF. It brings cycle tracking, medication reminders, emotional support and an AI guide called Nora together in one place." },
  { q: "Is Nora a doctor?", a: "No. Nora explains what is happening in plain language and helps you prepare questions, but she always points you back to your clinic for medical decisions." },
  { q: "Who is Bloom for?", a: "Anyone going through IVF, whether it is your first cycle or your fifth, and the partners who are walking beside them." },
  { q: "When can I use it?", a: "Bloom is launching soon. Join the waitlist and you will be among the first to know, and the first to get access." },
];

function NavLink({ href, children }) {
  return <a href={href} className="text-bloom-muted hover:text-bloom-text text-sm transition-colors">{children}</a>;
}

function Chat() {
  return (
    <div className="relative bg-white rounded-3xl border border-bloom-border shadow-[0_30px_80px_-30px_rgba(124,58,237,0.35)] p-6 w-full max-w-md">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-bloom-border">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif italic text-lg" style={{ background: "linear-gradient(135deg, #9B6DC5, #E07A8A)" }}>N</div>
        <div>
          <p className="text-bloom-text text-sm font-semibold">Nora</p>
          <p className="text-bloom-teal text-xs">Here for you, any hour</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        <p className="self-end bg-bloom-accent text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">I am so scared about egg retrieval.</p>
        <p className="self-start bg-bloom-surface text-bloom-text rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[88%]">
          It is completely normal to feel scared, and you are not alone in that. You will be sedated, it takes about 20 minutes, and most women feel crampy and tired afterwards rather than in real pain. Would it help to talk through the day together?
        </p>
        <p className="self-end bg-bloom-accent text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">Yes please.</p>
      </div>
    </div>
  );
}

export default function Site() {
  var year = new Date().getFullYear();

  return (
    <div className="relative overflow-hidden text-bloom-text" style={{ backgroundColor: "#FDFAF7" }}>
      <div className="pointer-events-none absolute -top-60 -left-60 w-[720px] h-[720px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, #9B6DC5 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute top-[420px] -right-72 w-[720px] h-[720px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #E07A8A 0%, transparent 65%)" }} />

      <header className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
        <a href="#top" className="logo" style={{ fontSize: "34px", lineHeight: 1 }}>bloom ✦</a>
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="#features">What Bloom does</NavLink>
          <NavLink href="#nora">Meet Nora</NavLink>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </nav>
        <a href="#join" className="bg-bloom-text hover:bg-bloom-deep text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">Join the waitlist</a>
      </header>

      <main id="top" className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-12 pb-24 lg:pt-20 lg:pb-32 grid lg:grid-cols-[1.3fr_1fr] gap-14 items-center">
          <div>
            <p className="text-bloom-accent uppercase font-semibold mb-6" style={{ fontSize: "12px", letterSpacing: "0.25em" }}>Your IVF companion</p>
            <h1 className="font-serif font-light mb-6" style={{ fontSize: "clamp(44px, 5vw, 68px)", lineHeight: 1.02 }}>
              The hardest journey<br />you will ever take.<br /><em className="text-bloom-accent">Not alone.</em>
            </h1>
            <p className="text-bloom-muted text-lg max-w-lg mb-10">
              Bloom is an AI companion built for women going through IVF. It keeps track of every dose, scan and result, and it is there for the feelings in between.
            </p>
            <WaitlistForm id="wl-hero" showCount />
          </div>
          <div className="flex justify-center lg:justify-end">
            <Chat />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white/70 border-y border-bloom-border scroll-mt-10">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
            <div className="max-w-2xl mb-14">
              <p className="text-bloom-accent uppercase font-semibold mb-4" style={{ fontSize: "12px", letterSpacing: "0.25em" }}>What Bloom does</p>
              <h2 className="font-serif font-light" style={{ fontSize: "clamp(34px, 4vw, 52px)", lineHeight: 1.1 }}>Everything IVF asks of you, held in one place.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(function (f) {
                return (
                  <div key={f.title} className="bg-bloom-bg border border-bloom-border rounded-3xl p-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6" style={{ backgroundColor: f.color + "1F", color: f.color }}>{f.mark}</div>
                    <h3 className="font-serif text-2xl mb-3">{f.title}</h3>
                    <p className="text-bloom-muted leading-relaxed">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Nora */}
        <section id="nora" className="max-w-6xl mx-auto px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-14 items-center scroll-mt-10">
          <div>
            <p className="text-bloom-accent uppercase font-semibold mb-4" style={{ fontSize: "12px", letterSpacing: "0.25em" }}>Meet Nora</p>
            <h2 className="font-serif font-light mb-6" style={{ fontSize: "clamp(34px, 4vw, 52px)", lineHeight: 1.1 }}>Someone to ask, <em className="text-bloom-accent">at any hour.</em></h2>
            <p className="text-bloom-muted text-lg leading-relaxed mb-6">
              Nora knows which day of your cycle you are on, what your last scan showed and which medication is next. Ask her what your E2 level means, whether a symptom is normal, or simply tell her how you feel.
            </p>
            <p className="text-bloom-muted leading-relaxed">
              She answers warmly and clearly, and she always reminds you to confirm medical decisions with your clinic.
            </p>
          </div>
          <div className="bg-gradient-to-br from-bloom-accent to-bloom-rose rounded-[2rem] p-10 lg:p-14 text-white">
            <p className="font-serif italic font-light mb-8" style={{ fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.25 }}>
              “Whatever you are feeling right now makes sense at this point in your cycle, and you do not have to carry it alone.”
            </p>
            <p className="text-white/80 text-sm uppercase" style={{ letterSpacing: "0.2em" }}>Nora, your Bloom companion</p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-bloom-surface/60 border-y border-bloom-border scroll-mt-10">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
            <div className="max-w-2xl mb-14">
              <p className="text-bloom-accent uppercase font-semibold mb-4" style={{ fontSize: "12px", letterSpacing: "0.25em" }}>How it works</p>
              <h2 className="font-serif font-light" style={{ fontSize: "clamp(34px, 4vw, 52px)", lineHeight: 1.1 }}>Gentle to start. There every day after.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {STEPS.map(function (s) {
                return (
                  <div key={s.n}>
                    <p className="font-serif text-bloom-accent text-5xl font-light mb-4">{s.n}</p>
                    <h3 className="font-serif text-2xl mb-3">{s.title}</h3>
                    <p className="text-bloom-muted leading-relaxed">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-4xl mx-auto px-6 lg:px-10 py-24 scroll-mt-10">
          <p className="text-bloom-accent uppercase font-semibold mb-4" style={{ fontSize: "12px", letterSpacing: "0.25em" }}>Questions</p>
          <h2 className="font-serif font-light mb-10" style={{ fontSize: "clamp(34px, 4vw, 52px)", lineHeight: 1.1 }}>Good to know</h2>
          <div className="divide-y divide-bloom-border border-y border-bloom-border">
            {FAQ.map(function (f) {
              return (
                <details key={f.q} className="group py-6">
                  <summary className="flex items-center justify-between cursor-pointer list-none font-serif text-2xl">
                    {f.q}
                    <span className="text-bloom-accent text-2xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-bloom-muted leading-relaxed mt-4 max-w-2xl">{f.a}</p>
                </details>
              );
            })}
          </div>
        </section>

        {/* Closing call to action */}
        <section id="join" className="max-w-6xl mx-auto px-6 lg:px-10 pb-24 scroll-mt-10">
          <div className="bg-bloom-text text-white rounded-[2rem] px-8 py-16 lg:px-20 lg:py-20 flex flex-col items-center text-center">
            <p className="logo mb-6" style={{ fontSize: "44px", lineHeight: 1 }}>bloom ✦</p>
            <h2 className="font-serif font-light mb-4" style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.1 }}>Be the first to know when Bloom opens.</h2>
            <p className="text-white/70 mb-10 max-w-lg">Join the waitlist for early access. No spam, just one email when it is your turn.</p>
            <WaitlistForm id="wl-footer" />
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-bloom-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-bloom-muted text-sm">
          <p>© {year} Bloom. Bloom does not replace medical advice from your clinic.</p>
          <a href="mailto:hello@bloomivfcompanion.com" className="hover:text-bloom-text underline underline-offset-4">hello@bloomivfcompanion.com</a>
        </div>
      </footer>
    </div>
  );
}
