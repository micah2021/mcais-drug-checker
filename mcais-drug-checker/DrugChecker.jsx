import { useState, useEffect, useRef } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const PHARMACIST_WA = "2348119389385";
const DOCTOR_WA     = "2349064815363";
const PAYSTACK_KEY  = "pk_live_XXXXXXXXXXXXXXXXXXXXXXXX"; // ← replace with real key

const BRAND = {
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

// ── Drug Interaction Database ──────────────────────────────────────────────
const BRAND_MAP = {
  flagyl:"metronidazole",coartem:"artemether",ampiclox:"ampicillin",
  augmentin:"amoxicillin",septrin:"cotrimoxazole",gelusil:"antacid",
  gaviscon:"antacid",panadol:"paracetamol",hedex:"paracetamol",
  advil:"ibuprofen",brufen:"ibuprofen",voltaren:"diclofenac",
  tramal:"tramadol",glucophage:"metformin",daonil:"glibenclamide",
  norvasc:"amlodipine",zestril:"lisinopril",zocor:"simvastatin",
  lipitor:"atorvastatin",coumadin:"warfarin",aspro:"aspirin",
  beer:"alcohol",stout:"alcohol",ogogoro:"alcohol",wine:"alcohol",
  piriton:"chlorphenamine",phenergan:"promethazine",
};

const INTERACTIONS = {
  "metronidazole|alcohol":      {sev:"Severe",   exp:"Causes severe disulfiram-like reaction — violent nausea, vomiting, flushing, rapid heartbeat. Very common dangerous mistake in Nigeria.",    action:"Avoid ALL alcohol during treatment and 48 hours after the last dose. Includes beer, stout, ogogoro, wine."},
  "flagyl|alcohol":             {sev:"Severe",   exp:"Flagyl is Metronidazole. Causes severe reaction with alcohol — vomiting, flushing, palpitations.",                                              action:"Avoid ALL alcohol during Flagyl treatment and 48 hours after."},
  "metformin|alcohol":          {sev:"Severe",   exp:"Greatly increases risk of lactic acidosis — a dangerous and potentially fatal buildup of lactic acid in the blood.",                          action:"Avoid alcohol completely while on Metformin."},
  "warfarin|aspirin":           {sev:"Severe",   exp:"Both thin the blood. Combined greatly increases internal and GI bleeding risk.",                                                                action:"Do NOT combine without specialist supervision. Refer to doctor immediately."},
  "warfarin|ibuprofen":         {sev:"Severe",   exp:"NSAIDs increase Warfarin levels and GI bleeding risk significantly.",                                                                         action:"Avoid. Use Paracetamol for pain instead. Monitor INR."},
  "cotrimoxazole|warfarin":     {sev:"Severe",   exp:"Septrin dramatically potentiates Warfarin — major bleeding risk.",                                                                             action:"Avoid. If essential, reduce Warfarin dose and monitor INR closely."},
  "rifampicin|oral contraceptive":{sev:"Severe", exp:"Rifampicin reduces contraceptive effectiveness by up to 80% — very high unintended pregnancy risk during TB treatment.",                       action:"Use condoms throughout TB treatment and 4 weeks after stopping Rifampicin."},
  "diazepam|alcohol":           {sev:"Severe",   exp:"Both suppress the CNS. Risk of respiratory failure, coma, and death.",                                                                        action:"Never combine. Counsel patient urgently."},
  "tramadol|ssri":              {sev:"Severe",   exp:"Risk of serotonin syndrome — agitation, rapid heart rate, muscle twitching. Can be fatal.",                                                   action:"Avoid. Refer to doctor urgently if patient is on antidepressants."},
  "tramadol|alcohol":           {sev:"Severe",   exp:"Combined CNS depression — breathing failure, coma, death.",                                                                                   action:"Never combine."},
  "tramadol|codeine":           {sev:"Severe",   exp:"Both are opioids. Greatly increases respiratory depression risk.",                                                                             action:"Never combine. Use one opioid only."},
  "amoxicillin|metronidazole":  {sev:"Low",      exp:"Common combination for dental and gut infections. Generally well tolerated.",                                                                  action:"Take with food. Avoid alcohol with metronidazole. Complete full course."},
  "flagyl|amoxicillin":         {sev:"Low",      exp:"Very common Nigerian antibiotic combination for mixed infections. Generally safe.",                                                            action:"Take with food. Avoid alcohol. Complete course."},
  "flagyl|ciprofloxacin":       {sev:"Low",      exp:"Common combination for abdominal and pelvic infections. Generally safe short-term.",                                                          action:"Take with food. Avoid alcohol with Flagyl."},
  "paracetamol|ibuprofen":      {sev:"Low",      exp:"Can be safely combined short-term for pain and fever. Different mechanisms.",                                                                  action:"Safe short-term. Avoid in liver/kidney disease. Don't exceed recommended doses."},
  "artemether|lumefantrine":    {sev:"None",     exp:"Coartem — standard fixed-dose malaria treatment in Nigeria. These two drugs are designed to be taken together.",                               action:"Safe as prescribed. Always take with food for better absorption."},
  "amlodipine|lisinopril":      {sev:"None",     exp:"Very common Nigerian antihypertensive combination. Generally safe and effective.",                                                             action:"Safe. Monitor blood pressure and watch for ankle swelling and dry cough."},
  "metformin|glibenclamide":    {sev:"None",     exp:"Common Nigerian diabetes combination. Generally well tolerated.",                                                                              action:"Safe. Monitor blood sugar. Watch for hypoglycaemia if meals are skipped."},
  "ciprofloxacin|antacid":      {sev:"Moderate", exp:"Antacids reduce Ciprofloxacin absorption by up to 90% — antibiotic becomes ineffective.",                                                     action:"Take Ciprofloxacin at least 2 hours before or 6 hours after any antacid."},
  "amlodipine|simvastatin":     {sev:"Moderate", exp:"Amlodipine raises Simvastatin levels — increases risk of muscle damage.",                                                                      action:"Limit Simvastatin to 20mg/day. Consider switching to Atorvastatin."},
  "aspirin|ibuprofen":          {sev:"Moderate", exp:"Both NSAIDs. Increases GI bleeding risk. Ibuprofen may block aspirin's cardioprotective effect.",                                             action:"Avoid combining. If needed, take aspirin 30 mins before Ibuprofen."},
  "doxycycline|antacid":        {sev:"Moderate", exp:"Antacids reduce Doxycycline absorption significantly.",                                                                                       action:"Separate by at least 2 hours."},
  "chloroquine|antacid":        {sev:"Moderate", exp:"Antacids reduce Chloroquine absorption — less effective malaria treatment.",                                                                   action:"Separate doses by at least 4 hours."},
  "lisinopril|potassium":       {sev:"Moderate", exp:"ACE inhibitors raise blood potassium. Adding supplements risks dangerous hyperkalaemia.",                                                      action:"Avoid potassium supplements unless prescribed. Monitor potassium levels."},
};

function normalise(name) {
  const n = name.toLowerCase().trim();
  return BRAND_MAP[n] || n;
}

function checkDrug(d1, d2) {
  const n1 = normalise(d1), n2 = normalise(d2);
  return INTERACTIONS[`${n1}|${n2}`] || INTERACTIONS[`${n2}|${n1}`] || null;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function waUrl(number, msg) {
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

function sevColor(sev) {
  if (sev === "Severe")   return { bg:"#FEF2F2", border:"#DC2626", text:"#7F1D1D", badge:"#DC2626" };
  if (sev === "Moderate") return { bg:"#FFFBEB", border:"#D97706", text:"#78350F", badge:"#D97706" };
  if (sev === "Low")      return { bg:"#F0FDF4", border:"#059669", text:"#14532D", badge:"#059669" };
  return                         { bg:"#EFF6FF", border:"#1A56DB", text:"#1E3A8A", badge:"#1A56DB" };
}

function sevIcon(sev) {
  if (sev === "Severe")   return "🔴";
  if (sev === "Moderate") return "🟠";
  if (sev === "Low")      return "🟢";
  return "✅";
}

// ── Paystack Integration ───────────────────────────────────────────────────
function initPaystack({ email, amount, name, onSuccess }) {
  if (typeof window === "undefined") return;
  const script = document.createElement("script");
  script.src = "https://js.paystack.co/v1/inline.js";
  script.onload = () => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email,
      amount: amount * 100,
      currency: "NGN",
      metadata: { custom_fields:[{ display_name:"Name", variable_name:"name", value:name }] },
      callback: (res) => onSuccess(res),
      onClose: () => {},
    });
    handler.openIframe();
  };
  document.head.appendChild(script);
}

// ══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════

function Logo({ size = 32 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{
        width:size, height:size, borderRadius:8,
        background:BRAND.navy, display:"flex", alignItems:"center",
        justifyContent:"center", flexShrink:0,
      }}>
        <span style={{ fontSize:size*0.5, lineHeight:1 }}>💊</span>
      </div>
      <div>
        <div style={{ fontSize:size*0.5, fontWeight:700, color:BRAND.navy, lineHeight:1.1, fontFamily:"'DM Serif Display', Georgia, serif" }}>
          Nigeria Drug Checker
        </div>
        <div style={{ fontSize:10, color:BRAND.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>
          Powered by MCAIS
        </div>
      </div>
    </div>
  );
}

function WAButton({ href, label, color = BRAND.green, icon = "📲" }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display:"inline-flex", alignItems:"center", gap:6,
      background:color, color:"#fff",
      fontWeight:600, fontSize:13, padding:"8px 18px",
      borderRadius:50, textDecoration:"none",
      marginTop:10, marginRight:8,
    }}>
      {icon} {label}
    </a>
  );
}

function SectionCard({ title, children, accent }) {
  return (
    <div style={{
      background:BRAND.white, borderRadius:14,
      border:`1px solid ${BRAND.border}`,
      borderTop: accent ? `3px solid ${BRAND.blue}` : undefined,
      padding:"1.25rem 1.5rem", marginBottom:"1rem",
    }}>
      {title && (
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:BRAND.blue, marginBottom:12 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function Input({ label, placeholder, value, onChange, type="text" }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ fontSize:13, color:BRAND.muted, display:"block", marginBottom:4 }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:"100%", padding:"10px 12px", fontSize:14,
          border:`1px solid ${BRAND.border}`, borderRadius:8,
          outline:"none", background:BRAND.gray,
          color:BRAND.text, boxSizing:"border-box",
          fontFamily:"inherit",
        }}
      />
    </div>
  );
}

function Textarea({ label, placeholder, value, onChange, rows=3 }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ fontSize:13, color:BRAND.muted, display:"block", marginBottom:4 }}>{label}</label>}
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{
          width:"100%", padding:"10px 12px", fontSize:14,
          border:`1px solid ${BRAND.border}`, borderRadius:8,
          outline:"none", background:BRAND.gray, resize:"vertical",
          color:BRAND.text, boxSizing:"border-box", fontFamily:"inherit",
        }}
      />
    </div>
  );
}

function PrimaryButton({ label, onClick, disabled, fullWidth, color=BRAND.blue }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#CBD5E1" : color,
      color:"#fff", border:"none", borderRadius:10,
      padding:"11px 24px", fontSize:14, fontWeight:600,
      cursor: disabled ? "not-allowed" : "pointer",
      width: fullWidth ? "100%" : "auto",
      fontFamily:"inherit",
    }}>
      {label}
    </button>
  );
}

// ── Advert Banner ──────────────────────────────────────────────────────────
function AdBanner() {
  const ads = [
    { name:"MCAIS", tagline:"Your trusted health technology partner in Nigeria. AI-powered healthcare tools.", wa:DOCTOR_WA, label:"Official Partner", cta:"Contact MCAIS" },
    { name:"HealthPlus Pharmacy", tagline:"Genuine NAFDAC-certified drugs delivered across Nigeria. Fast & reliable.", wa:"2348011111111", label:"Verified Supplier", cta:"Order now" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i+1)%ads.length), 8000); return () => clearInterval(t); }, []);
  const ad = ads[idx];
  return (
    <div style={{
      background: BRAND.lBlue, border:`1.5px solid ${BRAND.blue}`,
      borderRadius:12, padding:"12px 16px", marginBottom:16,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      gap:12, flexWrap:"wrap",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:200 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:BRAND.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🏥</div>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
            <span style={{ fontSize:14, fontWeight:700, color:BRAND.navy }}>{ad.name}</span>
            <span style={{ background:BRAND.blue, color:"#fff", fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20 }}>{ad.label}</span>
          </div>
          <div style={{ fontSize:12, color:BRAND.muted }}>{ad.tagline}</div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
        <WAButton href={waUrl(ad.wa, `Hello ${ad.name}, I saw your advert on Nigeria Drug Checker.`)} label={ad.cta} color={BRAND.blue} />
        <span style={{ fontSize:10, color:"#94A3B8" }}>Sponsored · Advertise here</span>
      </div>
    </div>
  );
}

// ── Drug Interaction Tab ───────────────────────────────────────────────────
function DrugCheckerTab({ user }) {
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [cond, setCond] = useState("");
  const [cname, setCname] = useState(user?.name || "");
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState(false);

  function check() {
    if (!d1.trim() || !d2.trim()) return;
    const r = checkDrug(d1, d2);
    setResult(r);
    setChecked(true);
  }

  const ts = new Date().toLocaleString("en-NG", { dateStyle:"medium", timeStyle:"short" });

  function buildMsg(forWho) {
    const base = `💊 *DRUG INTERACTION — Nigeria Drug Checker*\n🕐 ${ts}\n\n👤 *Client:* ${cname||"Anonymous"}\n💊 *Drug 1:* ${d1}\n💊 *Drug 2:* ${d2}\n🏥 *Condition:* ${cond||"Not specified"}\n\n`;
    if (result) return base + `⚠️ *Severity:* ${result.sev}\n\n📋 *Interaction:*\n${result.exp}\n\n✅ *Action:*\n${result.action}\n\n_Sent via Nigeria Drug Checker — MCAIS_`;
    return base + `⚠️ Combination NOT found in database. Please advise.\n\n_Sent via Nigeria Drug Checker — MCAIS_`;
  }

  const colors = result ? sevColor(result.sev) : null;

  return (
    <div>
      <SectionCard title="Check drug interaction" accent>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="Drug 1" placeholder="e.g. Metronidazole" value={d1} onChange={setD1} />
          <Input label="Drug 2" placeholder="e.g. Alcohol" value={d2} onChange={setD2} />
        </div>
        <Input label="Patient condition (optional)" placeholder="e.g. malaria, TB, pregnant, hypertension" value={cond} onChange={setCond} />
        <Input label="Client name (optional)" placeholder="e.g. Emeka Obi" value={cname} onChange={setCname} />
        <PrimaryButton label="Check interaction →" onClick={check} disabled={!d1.trim()||!d2.trim()} fullWidth />
      </SectionCard>

      {checked && (
        <div style={{
          background: colors?.bg || BRAND.lBlue,
          border:`1px solid ${colors?.border || BRAND.blue}`,
          borderLeft:`4px solid ${colors?.border || BRAND.blue}`,
          borderRadius:"0 12px 12px 0",
          padding:"1rem 1.25rem", marginBottom:16,
        }}>
          {result ? (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:18 }}>{sevIcon(result.sev)}</span>
                <span style={{ fontWeight:700, fontSize:15, color:colors.text }}>Severity: {result.sev}</span>
                <span style={{ background:colors.badge, color:"#fff", fontSize:11, fontWeight:600, padding:"2px 10px", borderRadius:20, marginLeft:4 }}>Nigerian clinical database</span>
              </div>
              <div style={{ fontSize:14, color:colors.text, lineHeight:1.7, marginBottom:8 }}>
                <strong>Interaction:</strong><br/>{result.exp}
              </div>
              <div style={{ fontSize:14, color:colors.text, lineHeight:1.7 }}>
                <strong>Recommended action:</strong><br/>{result.action}
              </div>
            </>
          ) : (
            <div style={{ color:BRAND.navy, fontSize:14 }}>
              🟡 <strong>Not in database</strong> — <strong>{d1}</strong> + <strong>{d2}</strong> was not found locally. Ask the pharmacist or doctor to verify.
            </div>
          )}
          <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:8 }}>
            <WAButton href={waUrl(PHARMACIST_WA, buildMsg("pharmacist"))} label="Send to Pharmacist" color={BRAND.green} />
            <WAButton href={waUrl(DOCTOR_WA, buildMsg("doctor"))} label="Send to Doctor" color={BRAND.blue} icon="🩺" />
          </div>
        </div>
      )}

      <SectionCard title="Quick reference — common Nigerian drug combinations">
        {[
          {cls:"None",     name:"Artemether + Lumefantrine (Coartem)", note:"Standard malaria treatment. Take with food."},
          {cls:"Severe",   name:"Metronidazole + Alcohol",             note:"Severe reaction. No alcohol during or 48hrs after."},
          {cls:"Severe",   name:"Rifampicin + Oral Contraceptives",    note:"TB drug makes contraceptives fail. Use condoms."},
          {cls:"Low",      name:"Paracetamol + Ibuprofen",             note:"Short-term OK. Avoid in liver/kidney disease."},
          {cls:"Moderate", name:"Ciprofloxacin + Antacids",            note:"Antacids block absorption. Separate by 2+ hours."},
          {cls:"Severe",   name:"Septrin + Warfarin",                  note:"Greatly increases bleeding risk. Avoid."},
        ].map((c, i) => {
          const col = sevColor(c.cls);
          return (
            <div key={i} style={{ padding:"8px 0", borderBottom:`1px solid ${BRAND.border}`, display:"flex", alignItems:"flex-start", gap:10 }}>
              <span style={{ background:col.badge, color:"#fff", fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, flexShrink:0, marginTop:2 }}>{c.cls==="None"?"Safe":c.cls}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:BRAND.text }}>{c.name}</div>
                <div style={{ fontSize:12, color:BRAND.muted }}>{c.note}</div>
              </div>
            </div>
          );
        })}
      </SectionCard>
    </div>
  );
}

// ── Photo Upload Tab ───────────────────────────────────────────────────────
function PhotoTab({ user }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [concern, setConcern] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  }

  function send() {
    const ts = new Date().toLocaleString("en-NG", { dateStyle:"medium", timeStyle:"short" });
    const msg = `💊 *DRUG PHOTO ENQUIRY — Nigeria Drug Checker*\n🕐 ${ts}\n\n👤 *Client:* ${name||"Anonymous"}\n📞 *Phone:* ${phone||"Not provided"}\n\n❓ *Concern:*\n${concern}\n\n📸 *Image:* ${file?.name}\n_(Please attach the photo in this chat)_\n\n_Sent via Nigeria Drug Checker — MCAIS_`;
    window.open(waUrl(PHARMACIST_WA, msg), "_blank");
  }

  return (
    <SectionCard title="Send drug photo to pharmacist" accent>
      <p style={{ fontSize:13, color:BRAND.muted, marginTop:0, marginBottom:16 }}>
        Upload a photo of your drug pack, tablet, or label. We'll prepare a WhatsApp message for the pharmacist to review.
      </p>
      <div
        onClick={() => fileRef.current.click()}
        style={{
          border:`2px dashed ${BRAND.border}`, borderRadius:10,
          padding:"1.5rem", textAlign:"center", cursor:"pointer",
          background: preview ? "transparent" : BRAND.gray, marginBottom:12,
        }}
      >
        {preview
          ? <img src={preview} alt="Drug preview" style={{ maxWidth:"100%", maxHeight:200, borderRadius:8 }} />
          : <>
              <div style={{ fontSize:28 }}>📷</div>
              <div style={{ fontSize:14, fontWeight:600, color:BRAND.text, marginTop:6 }}>Click to upload drug image</div>
              <div style={{ fontSize:12, color:BRAND.muted, marginTop:2 }}>JPG, PNG, WEBP</div>
            </>
        }
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />
      </div>
      <Input label="Your name" placeholder="e.g. Chukwuemeka Eze" value={name} onChange={setName} />
      <Input label="Your phone number (optional)" placeholder="e.g. 08012345678" value={phone} onChange={setPhone} />
      <Textarea label="Your question or concern" placeholder="e.g. Is this drug safe for my 4-year-old? Can I take it with Paracetamol?" value={concern} onChange={setConcern} rows={3} />
      <PrimaryButton label="📲 Prepare WhatsApp message" onClick={send} disabled={!file || !concern.trim()} fullWidth />
      {file && concern.trim() && (
        <div style={{ marginTop:10, fontSize:12, color:BRAND.muted }}>
          ✅ After WhatsApp opens, tap the 📎 attach button to also send the drug photo.
        </div>
      )}
    </SectionCard>
  );
}

// ── Reviews Tab ───────────────────────────────────────────────────────────
function ReviewTab({ user }) {
  const [name, setName] = useState(user?.name || "");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function send() {
    const ts = new Date().toLocaleString("en-NG", { dateStyle:"medium", timeStyle:"short" });
    const stars = "⭐".repeat(rating);
    const msg = `💬 *CLIENT REVIEW — Nigeria Drug Checker*\n🕐 ${ts}\n\n👤 *From:* ${name||"Anonymous"}\n${stars} (${rating}/5)\n\n📝 *Review:*\n${text}\n\n_Sent via Nigeria Drug Checker — MCAIS_`;
    window.open(waUrl(PHARMACIST_WA, msg), "_blank");
    setSent(true);
  }

  return (
    <SectionCard title="Leave a review for the pharmacist" accent>
      <p style={{ fontSize:13, color:BRAND.muted, marginTop:0, marginBottom:16 }}>Your review goes directly to the pharmacist on WhatsApp.</p>
      <Input label="Your name" placeholder="e.g. Adaeze Okonkwo" value={name} onChange={setName} />
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:13, color:BRAND.muted, display:"block", marginBottom:6 }}>Rating</label>
        <div style={{ display:"flex", gap:8 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setRating(n)} style={{
              fontSize:24, background:"none", border:"none", cursor:"pointer",
              opacity: n <= rating ? 1 : 0.3, transition:"opacity 0.15s",
            }}>⭐</button>
          ))}
          <span style={{ fontSize:13, color:BRAND.muted, alignSelf:"center", marginLeft:4 }}>{rating}/5</span>
        </div>
      </div>
      <Textarea label="Your review" placeholder="Tell the pharmacist about your experience — was the advice helpful? Was the drug correct?" value={text} onChange={setText} rows={4} />
      {sent
        ? <div style={{ background:"#F0FDF4", border:`1px solid ${BRAND.green}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:"#14532D" }}>✅ Review sent! Thank you for your feedback.</div>
        : <PrimaryButton label="📲 Send review on WhatsApp" onClick={send} disabled={!text.trim()} fullWidth />
      }
    </SectionCard>
  );
}

// ── Contacts Tab ──────────────────────────────────────────────────────────
function ContactsTab() {
  const contacts = [
    { icon:"💊", title:"Pharmacist", desc:"Drug queries · Dosage advice · Prescription checks", wa:PHARMACIST_WA, cta:"Chat with Pharmacist", color:BRAND.green },
    { icon:"🩺", title:"Doctor",     desc:"Medical advice · Severe reactions · Urgent concerns",  wa:DOCTOR_WA,     cta:"Chat with Doctor",     color:BRAND.blue  },
  ];
  return (
    <div>
      {contacts.map((c,i) => (
        <SectionCard key={i}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:48, height:48, background:BRAND.lBlue, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:BRAND.text }}>{c.title}</div>
                <div style={{ fontSize:13, color:BRAND.muted }}>{c.desc}</div>
              </div>
            </div>
            <WAButton href={waUrl(c.wa, `Hello, I have a question from Nigeria Drug Checker.`)} label={c.cta} color={c.color} />
          </div>
        </SectionCard>
      ))}
      <SectionCard title="Working hours">
        <div style={{ fontSize:13, color:BRAND.muted, lineHeight:1.8 }}>
          📅 <strong>Monday – Friday:</strong> 8:00 AM – 6:00 PM<br/>
          📅 <strong>Saturday:</strong> 9:00 AM – 2:00 PM<br/>
          📅 <strong>Sunday:</strong> Emergency only<br/>
          ⚡ Typical WhatsApp response: within 30 minutes
        </div>
      </SectionCard>
    </div>
  );
}

// ── Subscription / Login ───────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan]   = useState("free");

  function handleSubmit() {
    if (!email) return;
    if (plan === "pro") {
      initPaystack({
        email, amount:2000, name,
        onSuccess: () => {
          onLogin({ email, name, phone, plan:"pro", searches:0 });
          onClose();
        }
      });
    } else {
      onLogin({ email, name, phone, plan:"free", searches:0 });
      onClose();
    }
  }

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(10,22,40,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:16,
    }}>
      <div style={{ background:BRAND.white, borderRadius:16, padding:"1.5rem", width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <Logo size={28} />
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:BRAND.muted }}>✕</button>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex:1, padding:"8px 0", fontSize:13, fontWeight:600,
              borderRadius:8, border:`1px solid ${mode===m ? BRAND.blue : BRAND.border}`,
              background: mode===m ? BRAND.blue : BRAND.white,
              color: mode===m ? "#fff" : BRAND.muted, cursor:"pointer",
            }}>{m === "login" ? "Sign in" : "Create account"}</button>
          ))}
        </div>

        <Input label="Email address" placeholder="you@email.com" value={email} onChange={setEmail} type="email" />
        {mode === "signup" && <>
          <Input label="Your name" placeholder="Full name" value={name} onChange={setName} />
          <Input label="Phone number" placeholder="08012345678" value={phone} onChange={setPhone} />
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, color:BRAND.muted, display:"block", marginBottom:8 }}>Choose plan</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { id:"free", label:"Free", price:"₦0/mo", desc:"5 searches/day" },
                { id:"pro",  label:"Pro",  price:"₦2,000/mo", desc:"Unlimited + photo upload", highlight:true },
              ].map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)} style={{
                  border:`2px solid ${plan===p.id ? BRAND.blue : BRAND.border}`,
                  borderRadius:10, padding:"12px", cursor:"pointer",
                  background: p.highlight && plan===p.id ? BRAND.lBlue : BRAND.white,
                }}>
                  {p.highlight && <div style={{ fontSize:10, fontWeight:700, color:BRAND.blue, marginBottom:4 }}>RECOMMENDED</div>}
                  <div style={{ fontSize:14, fontWeight:700, color:BRAND.text }}>{p.label}</div>
                  <div style={{ fontSize:13, color:BRAND.blue, fontWeight:600 }}>{p.price}</div>
                  <div style={{ fontSize:11, color:BRAND.muted }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>}

        <PrimaryButton
          label={mode==="login" ? "Sign in" : plan==="pro" ? "Continue to payment →" : "Create free account →"}
          onClick={handleSubmit} fullWidth
        />
        <div style={{ marginTop:12, fontSize:12, color:BRAND.muted, textAlign:"center" }}>
          {plan==="pro" ? "Secure payment via Paystack · Nigerian banks accepted" : "No credit card required"}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]       = useState("checker");
  const [user, setUser]     = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const tabs = [
    { id:"checker",  label:"💊 Drug Check",   component:<DrugCheckerTab user={user} /> },
    { id:"photo",    label:"📸 Photo",         component:<PhotoTab user={user} />       },
    { id:"reviews",  label:"⭐ Review",        component:<ReviewTab user={user} />      },
    { id:"contacts", label:"📲 Contacts",      component:<ContactsTab />                },
  ];

  const activeTab = tabs.find(t => t.id === tab);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', system-ui, sans-serif; background: #F1F5F9; }
        input:focus, textarea:focus { border-color: #1A56DB !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.1); }
        a { transition: opacity 0.15s; }
        a:hover { opacity: 0.85; }
        button { transition: all 0.15s; }
        button:not(:disabled):active { transform: scale(0.97); }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#F1F5F9" }}>

        {/* Header */}
        <div style={{ background:BRAND.white, borderBottom:`1px solid ${BRAND.border}`, padding:"12px 16px", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <Logo size={34} />
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {user ? (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:BRAND.blue, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700 }}>
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:BRAND.text }}>{user.name || user.email.split("@")[0]}</div>
                    <div style={{ fontSize:10, color: user.plan==="pro" ? BRAND.blue : BRAND.muted, fontWeight:600, textTransform:"uppercase" }}>{user.plan==="pro" ? "Pro ✓" : "Free"}</div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} style={{
                  background:BRAND.blue, color:"#fff", border:"none",
                  borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit",
                }}>Sign in / Subscribe</button>
              )}
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ maxWidth:680, margin:"0 auto", padding:"16px 16px 80px" }}>

          {/* Pro upsell banner for free users */}
          {!user && (
            <div style={{ background:BRAND.navy, borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>Upgrade to Pro — ₦2,000/month</div>
                <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Unlimited searches · Drug photo uploads · Priority pharmacist access</div>
              </div>
              <button onClick={() => setShowAuth(true)} style={{ background:BRAND.blue, color:"#fff", border:"none", borderRadius:8, padding:"7px 16px", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                Get Pro →
              </button>
            </div>
          )}

          <AdBanner />

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:16, background:BRAND.white, borderRadius:12, padding:4, border:`1px solid ${BRAND.border}` }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex:1, padding:"8px 4px", fontSize:12, fontWeight:600,
                borderRadius:8, border:"none",
                background: tab===t.id ? BRAND.blue : "transparent",
                color: tab===t.id ? "#fff" : BRAND.muted,
                cursor:"pointer", fontFamily:"inherit",
              }}>{t.label}</button>
            ))}
          </div>

          {activeTab.component}

          {/* Footer */}
          <div style={{ textAlign:"center", color:BRAND.muted, fontSize:11, padding:"1rem 0", lineHeight:1.8 }}>
            Nigeria Drug Checker · Powered by MCAIS · Free to use<br/>
            Not a substitute for professional medical advice. Always consult your pharmacist.
          </div>
        </div>

        {/* Bottom nav (mobile) */}
        <div style={{
          position:"fixed", bottom:0, left:0, right:0,
          background:BRAND.white, borderTop:`1px solid ${BRAND.border}`,
          display:"flex", padding:"8px 0 12px",
          justifyContent:"space-around",
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              background:"none", border:"none", cursor:"pointer",
              color: tab===t.id ? BRAND.blue : BRAND.muted,
              fontSize:10, fontWeight: tab===t.id ? 700 : 400,
            }}>
              <span style={{ fontSize:20 }}>{t.label.split(" ")[0]}</span>
              <span>{t.label.split(" ").slice(1).join(" ")}</span>
            </button>
          ))}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={user => setUser(user)} />}
    </>
  );
}
