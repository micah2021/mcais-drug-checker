import { useState, useEffect } from "react";

const COLORS = {
  navy:   "#0A1628",
  blue:   "#1A56DB",
  lBlue:  "#EFF6FF",
  white:  "#FFFFFF",
  gray:   "#F8FAFC",
  border: "#E2E8F0",
  text:   "#0F172A",
  muted:  "#64748B",
  green:  "#059669",
  amber:  "#D97706",
  red:    "#DC2626",
};

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function FadeIn({ children, delay = 0, style = {} }) {
  const ref = { current: null };
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = document.getElementById(`fade-${delay}-${Math.random().toString(36).slice(2)}`);
  }, []);
  return (
    <div
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        ...style,
      }}
      ref={el => { if (el && !vis) { setTimeout(() => setVis(true), delay); } }}
    >
      {children}
    </div>
  );
}

function NavBar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${COLORS.border}` : "none",
      transition: "all 0.3s",
      padding: "16px 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: COLORS.navy, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💊</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: scrolled ? COLORS.navy : COLORS.white, fontFamily: "'DM Serif Display', Georgia, serif" }}>Nigeria Drug Checker</div>
            <div style={{ fontSize: 9, color: scrolled ? COLORS.muted : "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Powered by MCAIS</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#features" style={{ fontSize: 13, color: scrolled ? COLORS.muted : "rgba(255,255,255,0.85)", textDecoration: "none", fontWeight: 500 }}>Features</a>
          <a href="#pricing" style={{ fontSize: 13, color: scrolled ? COLORS.muted : "rgba(255,255,255,0.85)", textDecoration: "none", fontWeight: 500 }}>Pricing</a>
          <button onClick={onGetStarted} style={{
            background: COLORS.blue, color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Get Started Free</button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onGetStarted }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.navy} 0%, #0F2D6B 50%, #1A3A8C 100%)`,
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "120px 24px 80px", position: "relative", overflow: "hidden",
    }}>
      {/* Background pattern */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.05 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 200 + i * 80, height: 200 + i * 80,
            borderRadius: "50%",
            border: "1px solid #fff",
            top: "50%", left: "50%",
            transform: `translate(-50%, -50%)`,
            opacity: 0.3 - i * 0.03,
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <FadeIn delay={0}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(26,86,219,0.3)", border: "1px solid rgba(26,86,219,0.5)", borderRadius: 50, padding: "6px 14px", marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, background: "#4ADE80", borderRadius: "50%", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#94D2FF", fontWeight: 600, letterSpacing: "0.05em" }}>TRUSTED BY NIGERIAN PHARMACISTS</span>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 style={{
                fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1.15,
                fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 20,
              }}>
                Nigeria's first<br />
                <span style={{ color: "#60A5FA" }}>AI-powered</span> drug<br />
                safety platform
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                Check drug interactions with Nigerian clinical context, send drug photos to your pharmacist instantly on WhatsApp, and get expert medical advice — all in one app.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={onGetStarted} style={{
                  background: COLORS.blue, color: "#fff", border: "none",
                  borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                }}>
                  Start for free →
                </button>
                <a href="#how" style={{
                  background: "rgba(255,255,255,0.1)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 600,
                  cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
                }}>
                  ▶ See how it works
                </a>
              </div>
            </FadeIn>
            <FadeIn delay={400}>
              <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
                {[["10,000+","Drug interactions checked"],["37","Nigerian states covered"],["₦0","To get started"]].map(([n, l]) => (
                  <div key={n}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#60A5FA" }}>{n}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Phone mockup */}
          <FadeIn delay={200}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                width: 280, background: COLORS.white, borderRadius: 32,
                boxShadow: "0 40px 100px rgba(0,0,0,0.4)", overflow: "hidden",
                border: "8px solid rgba(255,255,255,0.1)",
              }}>
                {/* Phone header */}
                <div style={{ background: COLORS.navy, padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, background: COLORS.blue, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💊</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Nigeria Drug Checker</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>MCAIS</div>
                  </div>
                </div>
                {/* Mock content */}
                <div style={{ padding: 14 }}>
                  <div style={{ background: COLORS.lBlue, borderRadius: 8, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.blue, marginBottom: 6, letterSpacing: "0.08em" }}>DRUG INTERACTION</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <div style={{ background: "#fff", borderRadius: 6, padding: "8px", border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 9, color: COLORS.muted }}>Drug 1</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>Flagyl</div>
                      </div>
                      <div style={{ background: "#fff", borderRadius: 6, padding: "8px", border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 9, color: COLORS.muted }}>Drug 2</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>Alcohol</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, background: "#FEF2F2", borderLeft: `3px solid ${COLORS.red}`, borderRadius: "0 4px 4px 0", padding: "6px 8px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.red }}>🔴 SEVERE — Do not combine!</div>
                      <div style={{ fontSize: 9, color: "#7F1D1D", marginTop: 2 }}>Causes severe reaction. Avoid alcohol 48hrs after.</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ flex: 1, background: "#059669", borderRadius: 6, padding: "7px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>📲 Pharmacist</div>
                    </div>
                    <div style={{ flex: 1, background: COLORS.blue, borderRadius: 6, padding: "7px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>🩺 Doctor</div>
                    </div>
                  </div>
                </div>
                {/* Bottom nav */}
                <div style={{ borderTop: `1px solid ${COLORS.border}`, display: "flex", padding: "8px 0" }}>
                  {["💊","📸","⭐","📲"].map((ic, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 16, opacity: i === 0 ? 1 : 0.4 }}>{ic}</div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

function Features() {
  const features = [
    { icon:"🔬", title:"Drug interaction checker", desc:"Check any two drugs against our Nigerian clinical database of 60+ combinations including brand names like Flagyl, Coartem, Septrin, Ampiclox and more.", badge:"Nigerian context" },
    { icon:"📸", title:"Drug photo to pharmacist", desc:"Upload a photo of any drug pack or label. We prepare a WhatsApp message with your concern and it goes directly to the pharmacist for review.", badge:"Instant" },
    { icon:"📲", title:"Direct WhatsApp access", desc:"Every result sends directly to a verified Nigerian pharmacist or doctor on WhatsApp. Get professional advice in minutes, not hours.", badge:"Free" },
    { icon:"⭐", title:"Review your pharmacist", desc:"Leave star ratings and reviews that go directly to the pharmacist. Build trust and accountability in Nigerian healthcare.", badge:"Community" },
    { icon:"🇳🇬", title:"Nigerian clinical context", desc:"Unlike Western AI, our database prioritises Nigerian disease patterns — TB over lung cancer, malaria treatment protocols, local drug availability.", badge:"Africa-first" },
    { icon:"🔒", title:"Secure subscriptions", desc:"Pro subscribers get unlimited searches, photo uploads, and priority pharmacist access. Powered by Paystack — Nigeria's most trusted payment platform.", badge:"₦2,000/mo" },
  ];

  return (
    <section id="features" style={{ padding: "80px 24px", background: COLORS.white }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn delay={0}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.blue, marginBottom: 10 }}>WHY NIGERIA DRUG CHECKER</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: COLORS.navy, fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 14 }}>
              Built for Nigerian healthcare
            </h2>
            <p style={{ fontSize: 16, color: COLORS.muted, maxWidth: 520, margin: "0 auto" }}>
              Every feature designed around how Nigerians actually use healthcare — WhatsApp-first, local drug names, Nigerian disease context.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: COLORS.gray, borderRadius: 14, padding: "1.5rem",
                border: `1px solid ${COLORS.border}`, height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,86,219,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <span style={{ background: COLORS.lBlue, color: COLORS.blue, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{f.badge}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n:"1", icon:"💊", title:"Enter two drug names", desc:"Type any drug name — generic or brand name. We recognise Flagyl, Coartem, Septrin, Panadol, Ampiclox and 60+ more." },
    { n:"2", icon:"🔍", title:"Get instant Nigerian result", desc:"Our database checks against Nigerian clinical context — not just Western drug data. Severity shown as Safe, Low, Moderate, or Severe." },
    { n:"3", icon:"📲", title:"Send to pharmacist on WhatsApp", desc:"One tap opens WhatsApp with the full interaction report pre-filled. Your pharmacist receives it instantly and can respond directly." },
  ];
  return (
    <section id="how" style={{ padding: "80px 24px", background: COLORS.lBlue }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn delay={0}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.blue, marginBottom: 10 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: COLORS.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>Three steps to safer drugs</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div style={{ background: COLORS.white, borderRadius: 14, padding: "2rem", border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, background: COLORS.blue, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.blue, letterSpacing: "0.1em", marginBottom: 8 }}>STEP {s.n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ onGetStarted }) {
  const plans = [
    {
      name:"Free", price:"₦0", period:"/month", highlight:false,
      desc:"Perfect for occasional drug checks",
      features:["5 drug interaction checks per day","Basic Nigerian drug database","WhatsApp pharmacist alert","Community reviews"],
      cta:"Get started free", ctaAction: onGetStarted,
    },
    {
      name:"Pro", price:"₦2,000", period:"/month", highlight:true,
      desc:"For pharmacists and healthcare workers",
      features:["Unlimited drug interaction checks","Drug photo upload + WhatsApp","Priority pharmacist access","Full Nigerian drug database","Verified pharmacist badge","Monthly usage report"],
      cta:"Start Pro — ₦2,000/mo", ctaAction: onGetStarted,
    },
    {
      name:"Clinic", price:"₦15,000", period:"/month", highlight:false,
      desc:"For clinics, hospitals and NGOs",
      features:["Everything in Pro","Your clinic branded version","Dedicated pharmacist number","Staff access (up to 10 users)","Monthly analytics dashboard","WhatsApp group integration"],
      cta:"Contact MCAIS", ctaAction: () => window.open(`https://wa.me/2349064815363?text=${encodeURIComponent("Hello MCAIS, I am interested in the Clinic plan for Nigeria Drug Checker.")}`, "_blank"),
    },
  ];

  return (
    <section id="pricing" style={{ padding: "80px 24px", background: COLORS.white }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn delay={0}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.blue, marginBottom: 10 }}>PRICING</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: COLORS.navy, fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 14 }}>Simple, Nigerian pricing</h2>
            <p style={{ fontSize: 16, color: COLORS.muted }}>Pay with any Nigerian bank via Paystack. Cancel anytime.</p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {plans.map((p, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: p.highlight ? COLORS.navy : COLORS.gray,
                borderRadius: 16, padding: "2rem",
                border: p.highlight ? `2px solid ${COLORS.blue}` : `1px solid ${COLORS.border}`,
                position: "relative",
              }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: COLORS.blue, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 20 }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: p.highlight ? "#94A3B8" : COLORS.muted, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: p.highlight ? "#fff" : COLORS.text }}>{p.price}</span>
                    <span style={{ fontSize: 14, color: p.highlight ? "#94A3B8" : COLORS.muted }}>{p.period}</span>
                  </div>
                  <div style={{ fontSize: 13, color: p.highlight ? "#94A3B8" : COLORS.muted, marginTop: 4 }}>{p.desc}</div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: `1px solid ${p.highlight ? "rgba(255,255,255,0.1)" : COLORS.border}` }}>
                      <span style={{ color: COLORS.green, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 13, color: p.highlight ? "rgba(255,255,255,0.85)" : COLORS.text }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={p.ctaAction} style={{
                  width: "100%", padding: "12px", fontSize: 14, fontWeight: 700,
                  borderRadius: 10, border: "none", cursor: "pointer",
                  background: p.highlight ? COLORS.blue : COLORS.text,
                  color: "#fff", fontFamily: "inherit",
                }}>
                  {p.cta}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    { name:"Dr. Amina Yusuf", role:"Pharmacist, Kano", text:"This app has transformed how I handle drug queries. Clients send me WhatsApp messages with full interaction details — I can respond immediately even when I'm not in the pharmacy.", avatar:"A" },
    { name:"Emeka Okonkwo", role:"Patient, Lagos", text:"I was about to take Flagyl with alcohol. This app warned me with a red alert. The pharmacist WhatsApp button connected me immediately. Very glad I checked first!", avatar:"E" },
    { name:"Nurse Blessing Ada", role:"Community health worker, Rivers State", text:"I use this for every patient in the community. The Nigerian drug names make it easy — patients know Panadol and Coartem, not the generic names.", avatar:"B" },
  ];
  return (
    <section style={{ padding: "80px 24px", background: COLORS.lBlue }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn delay={0}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: COLORS.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>Trusted across Nigeria</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{ background: COLORS.white, borderRadius: 14, padding: "1.5rem", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 20, color: COLORS.amber, marginBottom: 12 }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: COLORS.blue, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onGetStarted }) {
  return (
    <section style={{ padding: "80px 24px", background: `linear-gradient(135deg, ${COLORS.navy} 0%, #0F2D6B 100%)` }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <FadeIn delay={0}>
          <h2 style={{ fontSize: 42, fontWeight: 700, color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 16 }}>
            Start protecting Nigerian patients today
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 32, lineHeight: 1.7 }}>
            Free to use. No app store needed. Works on any phone. Connects you directly to a verified Nigerian pharmacist on WhatsApp in seconds.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onGetStarted} style={{
              background: COLORS.blue, color: "#fff", border: "none",
              borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>Get started free →</button>
            <button onClick={() => window.open(`https://wa.me/2349064815363`, "_blank")} style={{
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer",
            }}>📲 Talk to MCAIS</button>
          </div>
          <div style={{ marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            ✓ No download required &nbsp;·&nbsp; ✓ Free plan available &nbsp;·&nbsp; ✓ Nigerian bank payments via Paystack
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: COLORS.navy, padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, background: COLORS.blue, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💊</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Nigeria Drug Checker</span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Powered by MCAIS · African Health AI</div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>
          Not a substitute for professional medical advice.<br />
          Always consult your pharmacist or doctor.
        </div>
      </div>
    </footer>
  );
}

// ── MAIN LANDING PAGE ──────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted }) {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', system-ui, sans-serif; }
        html { scroll-behavior: smooth; }
        a { transition: opacity 0.15s; }
        a:hover { opacity: 0.8; }
        button { transition: all 0.15s; font-family: inherit; }
        button:active { transform: scale(0.97); }
      `}</style>
      <NavBar onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <HowItWorks />
      <Pricing onGetStarted={onGetStarted} />
      <Testimonials />
      <CTA onGetStarted={onGetStarted} />
      <Footer />
    </>
  );
}
