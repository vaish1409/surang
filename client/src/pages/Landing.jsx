import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar  from "../components/Navbar";
import Footer  from "../components/Footer";

function MandalaBackground() {
  return (
    <div className="mandala-container">
      <svg viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg"
           style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(900px,140vw)", opacity: 0.07, pointerEvents: "none" }}>
        {[300,260,220,180,140,100,60].map((r,i)=>(
          <circle key={r} cx="350" cy="350" r={r} fill="none" stroke={i%2===0?"#F7941D":"#D4A017"} strokeWidth="0.8"/>
        ))}
        <g transform="translate(350,350)" className="mandala-spin">
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
            <ellipse key={a} cx="0" cy="-240" rx="18" ry="55"
                     transform={`rotate(${a})`} fill="#F7941D" opacity="0.5"/>
          ))}
        </g>
        <g transform="translate(350,350)" className="mandala-spin-rev">
          {[0,45,90,135,180,225,270,315].map(a=>(
            <ellipse key={a} cx="0" cy="-170" rx="14" ry="44"
                     transform={`rotate(${a})`} fill="#D4A017" opacity="0.5"/>
          ))}
        </g>
        <g transform="translate(350,350)" className="mandala-spin">
          {[0,60,120,180,240,300].map(a=>(
            <ellipse key={a} cx="0" cy="-100" rx="10" ry="30"
                     transform={`rotate(${a})`} fill="#F7941D" opacity="0.6"/>
          ))}
        </g>
        {[240,180,120].map((r,ri)=>
          [...Array(ri===0?12:ri===1?8:6)].map((_,i,arr)=>{
            const angle = (i/arr.length)*Math.PI*2;
            return <circle key={`${r}-${i}`} cx={350+r*Math.cos(angle)} cy={350+r*Math.sin(angle)} r="3" fill="#F7941D" opacity="0.7"/>;
          })
        )}
      </svg>
      {["🎨","🏺","🖌️","🧵","📜","🗿"].map((icon,i)=>(
        <span key={i} style={{
          position:"absolute",
          fontSize: 22+i*4+"px",
          top:  [10,20,70,40,15,65][i]+"%",
          left: [5,85,8,88,45,72][i]+"%",
          opacity: 0.15,
          animation: `float ${5+i}s ease-in-out ${i*0.8}s infinite`,
          pointerEvents:"none",
        }}>{icon}</span>
      ))}
    </div>
  );
}

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useCounter(target, duration = 2000, active) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

function StatCard({ label, target, suffix, icon, active }) {
  const count = useCounter(target, 2000, active);
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl md:text-5xl font-display font-bold text-saffron">
        {count.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="text-cream-muted text-sm mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function Landing() {
  const { t } = useTranslation();
  useReveal();
  const statsRef  = useRef(null);
  const [statsOn, setStatsOn] = useState(false);

  const CATEGORIES = [
    { name: "Madhubani",   state: "Bihar",              count: 124, icon: "🎨", desc: t("home.categories.madhubani"),   from: "#C1272D", to: "#FF6B6B" },
    { name: "Warli",       state: "Maharashtra",        count: 89,  icon: "🔮", desc: t("home.categories.warli"),       from: "#6B3F2A", to: "#B07244" },
    { name: "Kalamkari",   state: "Andhra Pradesh",     count: 156, icon: "🖌️", desc: t("home.categories.kalamkari"),   from: "#1A4A6E", to: "#2196A4" },
    { name: "Pottery",     state: "Pan India",          count: 203, icon: "🏺", desc: t("home.categories.pottery"),     from: "#7B3A10", to: "#E8651A" },
    { name: "Pattachitra", state: "Odisha",             count: 78,  icon: "📜", desc: t("home.categories.pattachitra"), from: "#5C1F7A", to: "#C044B0" },
    { name: "Weaving",     state: "Varanasi & Beyond",  count: 167, icon: "🧵", desc: t("home.categories.weaving"),     from: "#1A237E", to: "#673AB7" },
    { name: "Sculpture",   state: "Rajasthan",          count: 91,  icon: "🗿", desc: t("home.categories.sculpture"),   from: "#2E3B40", to: "#546E7A" },
    { name: "Folk Art",    state: "All India",          count: 312, icon: "🎭", desc: t("home.categories.folkArt"),    from: "#B45309", to: "#D97706" },
  ];

  const STEPS = [
    { n: "01", icon: "📸", title: t("home.steps.step1Title"), desc: t("home.steps.step1Desc") },
    { n: "02", icon: "🔍", title: t("home.steps.step2Title"), desc: t("home.steps.step2Desc") },
    { n: "03", icon: "🚀", title: t("home.steps.step3Title"), desc: t("home.steps.step3Desc") },
  ];

  const STATS = [
    { label: t("home.stats.artists"),   target: 500,   suffix: "+", icon: "🎨" },
    { label: t("home.stats.artworks"),  target: 2000,  suffix: "+", icon: "🖼️" },
    { label: t("home.stats.states"),    target: 28,    suffix: "",  icon: "🗺️" },
    { label: t("home.stats.delivered"), target: 1200,  suffix: "+", icon: "📦" },
  ];

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsOn(true); }, { threshold: 0.4 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-deep noise">
      <Navbar />

      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-16">
        <MandalaBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-saffron/10 border border-saffron/30 rounded-full px-4 py-2 text-saffron text-xs font-medium tracking-wider mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-pulse-glow inline-block"/>
            {t("home.kicker")}
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-bold text-cream leading-none mb-3 animate-fade-up" style={{animationDelay:"0.1s"}}>
            SU<span className="text-saffron">R</span>ANG
          </h1>

          <p className="font-hindi text-gold text-2xl md:text-3xl mb-3 animate-fade-up" style={{animationDelay:"0.2s"}}>
            हर कला की पहचान
          </p>

          <p className="text-cream-muted text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed animate-fade-up" style={{animationDelay:"0.3s"}}>
            {t("home.heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up" style={{animationDelay:"0.4s"}}>
            <Link to="/explore" className="btn-saffron text-base px-8 py-3">
              {t("home.exploreBtn")} →
            </Link>
            <Link to="/register?role=artist" className="btn-outline text-base px-8 py-3">
              {t("home.sellBtn")}
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-8 animate-fade-up" style={{animationDelay:"0.5s"}}>
            {["Madhubani","Warli","Kalamkari","Pottery","Folk Art"].map(c=>(
              <Link key={c} to={`/explore?category=${c}`}
                    className="text-xs text-cream-muted bg-surface/60 border border-surface-3/40 rounded-full px-3 py-1 hover:text-cream hover:border-saffron/50 transition-colors">
                {c}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-muted/50">
          <span className="text-xs uppercase tracking-[3px]">{t("home.scrollLabel")}</span>
          <div className="w-px h-10 bg-gradient-to-b from-cream-muted/50 to-transparent"/>
        </div>
      </section>

      <div className="py-4 border-y border-surface-3/40 overflow-hidden bg-surface/30">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...CATEGORIES,...CATEGORIES].map((c,i)=>(
            <span key={i} className="text-cream-muted text-sm font-medium">
              <span className="text-saffron mr-2">{c.icon}</span>{c.name} &bull;
            </span>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12 reveal">
          <p className="text-saffron text-xs uppercase tracking-[3px] mb-3">{t("home.categoriesEyebrow")}</p>
          <h2 className="font-display text-4xl md:text-5xl text-cream font-bold">{t("home.categoriesTitle")}</h2>
          <p className="text-cream-muted mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            {t("home.categoriesSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat,i)=>(
            <Link to={`/explore?category=${cat.name}`} key={cat.name}
                  className={`category-card reveal reveal-delay-${(i%4)+1} rounded-2xl overflow-hidden group relative`}>
              <div className="p-6 min-h-[180px] flex flex-col justify-between relative"
                   style={{background:`linear-gradient(135deg, ${cat.from}cc, ${cat.to}cc)`}}>
                <div className="absolute inset-0 opacity-10 dot-pattern"/>
                <div className="relative z-10">
                  <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 inline-block">{cat.icon}</div>
                  <h3 className="font-display text-xl text-white font-bold leading-tight">{cat.name}</h3>
                  <p className="text-white/70 text-xs mt-1">{cat.state}</p>
                </div>
                <div className="relative z-10 flex items-end justify-between mt-4">
                  <p className="text-white/60 text-[11px] leading-snug max-w-[120px]">{cat.desc}</p>
                  <span className="text-white/80 text-xs bg-black/20 rounded-full px-2.5 py-1">{cat.count}+</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface/40 py-20 border-y border-surface-3/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <p className="text-saffron text-xs uppercase tracking-[3px] mb-3">{t("home.howEyebrow")}</p>
            <h2 className="font-display text-4xl md:text-5xl text-cream font-bold">{t("home.howTitle")}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-saffron/40 to-transparent"/>

            {STEPS.map((step,i)=>(
              <div key={step.n} className={`reveal reveal-delay-${i+1} text-center relative`}>
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-surface-2 border border-surface-3 flex items-center justify-center text-3xl shadow-lg mx-auto">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-saffron text-deep text-xs font-bold flex items-center justify-center">{step.n}</span>
                </div>
                <h3 className="text-cream font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-cream-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef} className="py-20 max-w-5xl mx-auto px-6">
        <div className="reveal text-center mb-12">
          <h2 className="font-display text-4xl text-cream font-bold">{t("home.statsTitle")}</h2>
          <p className="text-cream-muted mt-3 text-sm max-w-md mx-auto">
            {t("home.statsSubtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 reveal bg-surface/40 rounded-3xl p-10 border border-surface-3/40">
          {STATS.map(s=>(
            <StatCard key={s.label} {...s} active={statsOn}/>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 pb-20 text-center reveal">
        <div className="relative bg-surface-2 border border-surface-3 rounded-3xl p-10 overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-30"/>
          <div className="relative z-10">
            <p className="text-saffron text-xs uppercase tracking-[3px] mb-3">{t("home.ctaEyebrow")}</p>
            <h2 className="font-display text-4xl md:text-5xl text-cream font-bold mb-4">
              {t("home.ctaTitle1")}<br/><span className="text-saffron">{t("home.ctaTitle2")}</span>
            </h2>
            <p className="text-cream-muted text-sm leading-relaxed max-w-lg mx-auto mb-8">
              {t("home.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register?role=artist" className="btn-saffron text-base px-8 py-3">{t("home.ctaStartSelling")}</Link>
              <Link to="/explore"             className="btn-outline text-base px-8 py-3">{t("home.ctaBrowseBuyer")}</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}