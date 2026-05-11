import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════
// CONFIGURATION — Edit this to add/remove pharmacists and doctors
// ══════════════════════════════════════════════════════════════════════════
const PAYSTACK_KEY = "pk_live_XXXXXXXXXXXXXXXXXXXXXXXX";

const PROFESSIONALS = [
  {
    id:1, name:"Pharm. Micah Emmanuel", role:"pharmacist",
    specialty:"General pharmacy · Drug interactions · Prescription review",
    location:"Lagos, Nigeria", whatsapp:"2348119389385",
    available:true, verified:true, plan:"pro",
    rating:4.9, reviews:47, avatar:"M", color:"#059669",
  },
  {
    id:2, name:"Dr. Emmanuel Chukwu", role:"doctor",
    specialty:"General medicine · Malaria · Diabetes · Hypertension",
    location:"Abuja, Nigeria", whatsapp:"2349064815363",
    available:true, verified:true, plan:"pro",
    rating:4.8, reviews:31, avatar:"E", color:"#1A56DB",
  },
  // Add more professionals here — copy the block above and change the details
];

// ══════════════════════════════════════════════════════════════════════════
// BRAND NAMES → GENERIC NAMES
// ══════════════════════════════════════════════════════════════════════════
const BRAND_MAP = {
  flagyl:"metronidazole",coartem:"artemether",alu:"artemether",
  lonart:"artemether",ampiclox:"ampicillin",augmentin:"amoxicillin",
  amoxil:"amoxicillin",septrin:"cotrimoxazole",bactrim:"cotrimoxazole",
  ciproxin:"ciprofloxacin",vibramycin:"doxycycline",rocephin:"ceftriaxone",
  zithromax:"azithromycin",erythrocin:"erythromycin",
  panadol:"paracetamol",hedex:"paracetamol",emzor:"paracetamol",
  advil:"ibuprofen",brufen:"ibuprofen",nurofen:"ibuprofen",
  voltaren:"diclofenac",cataflam:"diclofenac",feldene:"piroxicam",
  ponstan:"mefenamic acid",tramal:"tramadol",ultram:"tramadol",
  norvasc:"amlodipine",zestril:"lisinopril",prinivil:"lisinopril",
  vasotec:"enalapril",cozaar:"losartan",tenormin:"atenolol",
  inderal:"propranolol",lasix:"furosemide",aldactone:"spironolactone",
  aldomet:"methyldopa",adalat:"nifedipine",
  zocor:"simvastatin",lipitor:"atorvastatin",crestor:"rosuvastatin",
  coumadin:"warfarin",aspro:"aspirin",disprin:"aspirin",plavix:"clopidogrel",
  lanoxin:"digoxin",glucophage:"metformin",diabex:"metformin",
  daonil:"glibenclamide",euglucon:"glibenclamide",diamicron:"gliclazide",
  actrapid:"insulin",mixtard:"insulin",humulin:"insulin",
  valium:"diazepam",xanax:"alprazolam",largactil:"chlorpromazine",
  haldol:"haloperidol",epilim:"sodium valproate",tegretol:"carbamazepine",
  phenobarb:"phenobarbitone",prozac:"fluoxetine",zoloft:"sertraline",
  losec:"omeprazole",nexium:"esomeprazole",zantac:"ranitidine",
  gelusil:"antacid",gaviscon:"antacid",maalox:"antacid",
  "milk of magnesia":"antacid",buscopan:"hyoscine",maxolon:"metoclopramide",
  piriton:"chlorphenamine",phenergan:"promethazine",clarityn:"loratadine",
  zyrtec:"cetirizine","ferrous sulphate":"iron",feroglobin:"iron",
  "folic acid":"folic acid","vitamin c":"vitamin c","vitamin d":"vitamin d",
  "black seed":"nigella sativa","black seed oil":"nigella sativa",
  garlic:"garlic",ginger:"ginger",turmeric:"curcumin",
  moringa:"moringa oleifera","bitter leaf":"vernonia amygdalina",
  agbo:"herbal mixture","yoyo bitters":"herbal bitters",
  beer:"alcohol",stout:"alcohol","palm wine":"alcohol",
  ogogoro:"alcohol","kai kai":"alcohol",schnapps:"alcohol",
  wine:"alcohol",spirit:"alcohol",
};

// ══════════════════════════════════════════════════════════════════════════
// DRUG INTERACTION DATABASE — 150+ combinations
// ══════════════════════════════════════════════════════════════════════════
const DB = {
  "metronidazole|alcohol":       {s:"Severe",   e:"Causes severe disulfiram-like reaction — violent nausea, vomiting, flushing, rapid heartbeat. Very common in Nigeria.",       a:"Avoid ALL alcohol (beer, stout, palm wine, ogogoro) during treatment AND 48 hours after last dose."},
  "flagyl|alcohol":              {s:"Severe",   e:"Flagyl is Metronidazole. Causes severe reaction with alcohol.",                                                                a:"Avoid ALL alcohol during Flagyl treatment and 48 hours after."},
  "metformin|alcohol":           {s:"Severe",   e:"Greatly increases risk of lactic acidosis — dangerous and potentially fatal.",                                                 a:"Avoid alcohol completely while on Metformin."},
  "warfarin|aspirin":            {s:"Severe",   e:"Both thin the blood. Combined greatly increases internal bleeding risk.",                                                       a:"Do NOT combine without specialist supervision. Refer to doctor immediately."},
  "warfarin|ibuprofen":          {s:"Severe",   e:"NSAIDs raise Warfarin levels and GI bleeding risk significantly.",                                                             a:"Avoid. Use Paracetamol instead. Monitor INR."},
  "warfarin|diclofenac":         {s:"Severe",   e:"Diclofenac greatly increases Warfarin effect and GI bleeding risk.",                                                           a:"Avoid. Use Paracetamol instead. Monitor INR."},
  "warfarin|metronidazole":      {s:"Severe",   e:"Metronidazole significantly potentiates Warfarin — major bleeding risk.",                                                      a:"Avoid. If essential, reduce Warfarin dose and monitor INR very closely."},
  "warfarin|cotrimoxazole":      {s:"Severe",   e:"Septrin dramatically potentiates Warfarin — drastically increases bleeding risk.",                                             a:"Avoid. If essential, reduce Warfarin and monitor INR closely."},
  "warfarin|erythromycin":       {s:"Severe",   e:"Erythromycin increases Warfarin levels significantly.",                                                                        a:"Avoid. Use alternative antibiotic. Monitor INR."},
  "warfarin|garlic":             {s:"Severe",   e:"High-dose garlic supplements significantly increase Warfarin effect — serious bleeding risk.",                                 a:"Avoid garlic supplements with Warfarin. Cooking amounts generally safe."},
  "rifampicin|oral contraceptive":{s:"Severe",  e:"Rifampicin reduces contraceptive effectiveness by up to 80% — very high unintended pregnancy risk during TB treatment.",       a:"Use condoms or injectable contraception throughout TB treatment and 4 weeks after."},
  "carbamazepine|oral contraceptive":{s:"Severe",e:"Carbamazepine reduces contraceptive effectiveness — risk of unintended pregnancy.",                                           a:"Use additional contraception. Inform prescriber."},
  "diazepam|alcohol":            {s:"Severe",   e:"Both suppress the CNS. Risk of respiratory failure, coma, and death.",                                                         a:"Never combine. Counsel patient urgently."},
  "alprazolam|alcohol":          {s:"Severe",   e:"Benzodiazepine + alcohol — dangerous CNS depression.",                                                                         a:"Never combine."},
  "tramadol|alcohol":            {s:"Severe",   e:"Combined CNS depression — breathing failure, coma, death.",                                                                    a:"Never combine."},
  "tramadol|ssri":               {s:"Severe",   e:"Risk of serotonin syndrome — agitation, rapid heart rate, muscle twitching. Can be fatal.",                                   a:"Avoid. Refer to doctor urgently."},
  "tramadol|sertraline":         {s:"Severe",   e:"Risk of serotonin syndrome — potentially fatal.",                                                                              a:"Avoid. Refer to doctor."},
  "tramadol|fluoxetine":         {s:"Severe",   e:"Risk of serotonin syndrome — potentially fatal.",                                                                              a:"Avoid. Refer to doctor."},
  "tramadol|amitriptyline":      {s:"Severe",   e:"Risk of serotonin syndrome and seizures.",                                                                                     a:"Avoid. Refer to doctor."},
  "tramadol|codeine":            {s:"Severe",   e:"Both are opioids. Greatly increases respiratory depression risk.",                                                              a:"Never combine. Use one opioid only."},
  "morphine|alcohol":            {s:"Severe",   e:"Combined CNS and respiratory depression — risk of death.",                                                                     a:"Never combine."},
  "codeine|alcohol":             {s:"Severe",   e:"Enhanced CNS depression — risk of breathing failure.",                                                                         a:"Avoid alcohol with any opioid."},
  "phenobarbitone|alcohol":      {s:"Severe",   e:"Both are CNS depressants. Enhanced sedation and respiratory depression.",                                                      a:"Never combine."},
  "sodium valproate|alcohol":    {s:"Severe",   e:"Alcohol increases valproate toxicity and worsens seizure control.",                                                            a:"Avoid alcohol completely."},
  "digoxin|furosemide":          {s:"Severe",   e:"Furosemide causes potassium loss which increases digoxin toxicity — risk of fatal heart arrhythmia.",                         a:"Monitor potassium and digoxin levels regularly."},
  "propranolol|verapamil":       {s:"Severe",   e:"Combined beta-blocker and calcium channel blocker — high risk of heart block.",                                                a:"Avoid. Refer to cardiologist."},
  "sildenafil|nitrate":          {s:"Severe",   e:"Sildenafil (Viagra) + nitrates cause dangerous drop in blood pressure — can be fatal.",                                       a:"Never combine. Absolutely contraindicated."},
  "furosemide|gentamicin":       {s:"Severe",   e:"Both are ototoxic and nephrotoxic. Combined greatly increases kidney and hearing damage risk.",                                a:"Avoid. If essential, monitor kidney function and hearing."},
  "insulin|herbal mixture":      {s:"Moderate", e:"Nigerian herbal mixtures (agbo) may unpredictably affect blood sugar, complicating insulin management.",                       a:"Avoid herbal mixtures during insulin therapy. Monitor blood sugar closely."},
  "metformin|herbal mixture":    {s:"Moderate", e:"Agbo and similar mixtures may affect blood sugar control unpredictably.",                                                      a:"Avoid agbo with Metformin. Inform doctor of all herbal use."},
  "ciprofloxacin|antacid":       {s:"Moderate", e:"Antacids reduce Ciprofloxacin absorption by up to 90% — antibiotic becomes ineffective.",                                     a:"Take Ciprofloxacin at least 2 hours before or 6 hours after any antacid."},
  "ciprofloxacin|iron":          {s:"Moderate", e:"Iron reduces Ciprofloxacin absorption significantly.",                                                                         a:"Separate by at least 2 hours."},
  "doxycycline|antacid":         {s:"Moderate", e:"Antacids, iron, and dairy reduce Doxycycline absorption significantly.",                                                       a:"Take Doxycycline 2 hours before or 6 hours after antacids or iron."},
  "doxycycline|iron":            {s:"Moderate", e:"Iron reduces Doxycycline absorption by up to 80%.",                                                                            a:"Separate by at least 2 hours."},
  "amlodipine|simvastatin":      {s:"Moderate", e:"Amlodipine raises Simvastatin levels — increases risk of muscle damage.",                                                      a:"Limit Simvastatin to 20mg/day. Consider switching to Atorvastatin."},
  "aspirin|ibuprofen":           {s:"Moderate", e:"Both NSAIDs. Increases GI bleeding risk. Ibuprofen may block aspirin's cardioprotective effect.",                             a:"Avoid combining. If needed, take aspirin 30 mins before Ibuprofen."},
  "aspirin|diclofenac":          {s:"Moderate", e:"Both NSAIDs — increased GI bleeding risk.",                                                                                    a:"Avoid combining."},
  "ibuprofen|lisinopril":        {s:"Moderate", e:"NSAIDs reduce effectiveness of ACE inhibitors and can worsen kidney function.",                                                a:"Avoid regular NSAID use. Use Paracetamol for pain."},
  "ibuprofen|furosemide":        {s:"Moderate", e:"NSAIDs reduce effectiveness of diuretics and can worsen kidney function.",                                                     a:"Avoid regular NSAID use."},
  "chloroquine|antacid":         {s:"Moderate", e:"Antacids reduce Chloroquine absorption — less effective malaria treatment.",                                                   a:"Separate doses by at least 4 hours."},
  "lisinopril|potassium":        {s:"Moderate", e:"ACE inhibitors raise blood potassium. Adding supplements risks dangerous hyperkalaemia.",                                      a:"Avoid potassium supplements unless prescribed. Monitor potassium levels."},
  "spironolactone|potassium":    {s:"Moderate", e:"Spironolactone retains potassium. Adding supplements risks dangerous hyperkalaemia.",                                          a:"Avoid potassium supplements. Monitor potassium regularly."},
  "nifedipine|grapefruit":       {s:"Moderate", e:"Grapefruit juice significantly increases Nifedipine levels — exaggerated blood pressure drop.",                               a:"Avoid grapefruit juice with Nifedipine."},
  "simvastatin|grapefruit":      {s:"Moderate", e:"Grapefruit juice greatly increases Simvastatin levels — risk of severe muscle damage.",                                       a:"Avoid grapefruit juice completely with Simvastatin."},
  "piriton|alcohol":             {s:"Moderate", e:"Chlorphenamine (Piriton) + alcohol causes excessive sedation and drowsiness.",                                                 a:"Avoid alcohol. Do not drive after taking Piriton."},
  "promethazine|alcohol":        {s:"Moderate", e:"Phenergan + alcohol causes dangerous sedation. Common mistake in Nigeria.",                                                    a:"Avoid alcohol. Do not drive. Avoid operating machinery."},
  "warfarin|turmeric":           {s:"Moderate", e:"High-dose turmeric supplements may increase Warfarin's anticoagulant effect.",                                                a:"Avoid turmeric supplements with Warfarin. Cooking amounts are safe."},
  "aspirin|garlic":              {s:"Moderate", e:"Both aspirin and garlic supplements thin the blood — combined bleeding risk.",                                                 a:"Avoid high-dose garlic supplements with aspirin."},
  "metformin|moringa oleifera":  {s:"Low",      e:"Moringa may have blood sugar-lowering properties that could enhance Metformin.",                                              a:"Monitor blood sugar closely. Inform your doctor."},
  "glibenclamide|alcohol":       {s:"Moderate", e:"Alcohol enhances hypoglycaemic effect and masks low blood sugar symptoms.",                                                    a:"Avoid alcohol. Eat regularly. Monitor blood sugar."},
  "rifampicin|metformin":        {s:"Moderate", e:"Rifampicin reduces Metformin effectiveness, leading to poorer blood sugar control.",                                          a:"Monitor blood sugar more closely during TB treatment."},
  "omeprazole|clopidogrel":      {s:"Moderate", e:"Omeprazole reduces effectiveness of Clopidogrel — increases stroke/heart attack risk.",                                       a:"Use Pantoprazole instead if GI protection needed with Clopidogrel."},
  "amoxicillin|metronidazole":   {s:"Low",      e:"Common combination for dental and gut infections. Generally well tolerated.",                                                  a:"Take with food. Avoid alcohol with metronidazole. Complete full course."},
  "flagyl|amoxicillin":          {s:"Low",      e:"Very common Nigerian antibiotic combination for mixed infections. Generally safe.",                                            a:"Take with food. Avoid alcohol. Complete course."},
  "flagyl|ciprofloxacin":        {s:"Low",      e:"Common combination for abdominal and pelvic infections. Generally safe short-term.",                                          a:"Take with food. Avoid alcohol with Flagyl."},
  "flagyl|doxycycline":          {s:"Low",      e:"Common for pelvic inflammatory disease and mixed infections.",                                                                 a:"Avoid alcohol with Flagyl. Take Doxycycline with food and water."},
  "paracetamol|ibuprofen":       {s:"Low",      e:"Can be safely combined short-term for pain and fever. Different mechanisms.",                                                  a:"Safe short-term. Avoid in liver/kidney disease."},
  "paracetamol|codeine":         {s:"Low",      e:"Co-codamol — recognised pain combination. Works synergistically.",                                                             a:"Safe at recommended doses. Risk of Codeine dependence long-term."},
  "paracetamol|vitamin c":       {s:"None",     e:"No significant interaction. Vitamin C may slightly increase Paracetamol absorption.",                                         a:"Safe combination."},
  "amlodipine|lisinopril":       {s:"None",     e:"Very common Nigerian antihypertensive combination. Safe and effective.",                                                       a:"Safe as prescribed. Monitor blood pressure and watch for ankle swelling."},
  "amlodipine|atorvastatin":     {s:"None",     e:"Common combination for hypertension + high cholesterol. No clinically significant interaction.",                               a:"Safe as prescribed. Monitor for muscle aches."},
  "hydrochlorothiazide|lisinopril":{s:"None",   e:"Common antihypertensive combination in Nigeria. Generally safe.",                                                              a:"Safe. Monitor blood pressure and potassium."},
  "metformin|glibenclamide":     {s:"None",     e:"Common Nigerian diabetes combination. Generally well tolerated.",                                                              a:"Safe. Monitor blood sugar. Watch for hypoglycaemia if meals skipped."},
  "artemether|lumefantrine":     {s:"None",     e:"Coartem — standard fixed-dose malaria treatment. Designed to be taken together.",                                             a:"Safe as prescribed. Always take with food."},
  "coartem|paracetamol":         {s:"None",     e:"Paracetamol commonly used with Coartem for fever during malaria treatment. Safe.",                                            a:"Safe. Standard Nigerian malaria management."},
  "ampicillin|cloxacillin":      {s:"None",     e:"Ampiclox — fixed combination designed to be taken together.",                                                                  a:"Safe as prescribed. Complete full course."},
  "amoxicillin|clavulanate":     {s:"None",     e:"Augmentin — fixed combination designed to be taken together.",                                                                 a:"Safe. Take with food to reduce GI upset."},
  "iron|folic acid":             {s:"None",     e:"Commonly prescribed together in pregnancy. Safe.",                                                                             a:"Safe. Take iron with vitamin C to improve absorption."},
  "vitamin c|iron":              {s:"None",     e:"Vitamin C significantly enhances iron absorption — beneficial combination.",                                                    a:"Take together for maximum iron absorption."},
  "calcium|vitamin d":           {s:"None",     e:"Classic combination — Vitamin D essential for calcium absorption. Beneficial.",                                                a:"Safe and recommended. Standard bone health combination."},
  "amlodipine|vernonia amygdalina":{s:"Low",    e:"Bitter leaf may have mild BP-lowering effects that could enhance amlodipine.",                                                a:"Monitor blood pressure. Generally safe in food amounts."},
};

function norm(name) {
  const n = name.toLowerCase().trim().replace(/\s*\d+\s*(mg|ml|g|mcg|tab|caps?|syrup)?/gi,"").trim();
  return BRAND_MAP[n] || BRAND_MAP[name.toLowerCase().trim()] || n;
}

function checkDrug(d1, d2) {
  const n1 = norm(d1), n2 = norm(d2);
  const r = DB[`${n1}|${n2}`] || DB[`${n2}|${n1}`];
  if (r) return r;
  for (const [k,v] of Object.entries(DB)) {
    const [k1,k2] = k.split("|");
    if ((n1.includes(k1)||k1.includes(n1))&&(n2.includes(k2)||k2.includes(n2))) return v;
    if ((n1.includes(k2)||k2.includes(n1))&&(n2.includes(k1)||k1.includes(n2))) return v;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════════
// COLOURS & HELPERS
// ══════════════════════════════════════════════════════════════════════════
const C = {
  navy:"#0A1628",blue:"#1A56DB",lBlue:"#EFF6FF",white:"#FFFFFF",
  gray:"#F8FAFC",border:"#E2E8F0",text:"#0F172A",muted:"#64748B",
  green:"#059669",amber:"#D97706",red:"#DC2626",
};

function sevColor(s) {
  if (s==="Severe")   return {bg:"#FEF2F2",border:C.red,   text:"#7F1D1D",badge:C.red};
  if (s==="Moderate") return {bg:"#FFFBEB",border:C.amber, text:"#78350F",badge:C.amber};
  if (s==="Low")      return {bg:"#F0FDF4",border:C.green, text:"#14532D",badge:C.green};
  return                     {bg:C.lBlue,  border:C.blue,  text:"#1E3A8A",badge:C.blue};
}
function sevIcon(s){ return s==="Severe"?"🔴":s==="Moderate"?"🟠":s==="Low"?"🟢":"✅"; }
function waUrl(num,msg){ return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`; }
function ts(){ return new Date().toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short"}); }

function initPaystack({email,amount,name,onSuccess}){
  const s=document.createElement("script");
  s.src="https://js.paystack.co/v1/inline.js";
  s.onload=()=>{
    const h=window.PaystackPop.setup({
      key:PAYSTACK_KEY,email,amount:amount*100,currency:"NGN",
      metadata:{custom_fields:[{display_name:"Name",variable_name:"name",value:name}]},
      callback:(r)=>onSuccess(r),onClose:()=>{},
    });
    h.openIframe();
  };
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ══════════════════════════════════════════════════════════════════════════
function Inp({label,placeholder,value,onChange,type="text"}){
  return(
    <div style={{marginBottom:12}}>
      {label&&<label style={{fontSize:13,color:C.muted,display:"block",marginBottom:4}}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${C.border}`,
          borderRadius:8,outline:"none",background:C.gray,color:C.text,boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
  );
}
function Txt({label,placeholder,value,onChange,rows=3}){
  return(
    <div style={{marginBottom:12}}>
      {label&&<label style={{fontSize:13,color:C.muted,display:"block",marginBottom:4}}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${C.border}`,
          borderRadius:8,outline:"none",background:C.gray,resize:"vertical",color:C.text,
          boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
  );
}
function Btn({label,onClick,disabled,full,color=C.blue}){
  return(
    <button onClick={onClick} disabled={disabled}
      style={{background:disabled?"#CBD5E1":color,color:"#fff",border:"none",borderRadius:10,
        padding:"11px 24px",fontSize:14,fontWeight:600,cursor:disabled?"not-allowed":"pointer",
        width:full?"100%":"auto",fontFamily:"inherit",transition:"all 0.15s"}}>
      {label}
    </button>
  );
}
function WABtn({href,label,color=C.green,icon="📲"}){
  return(
    <a href={href} target="_blank" rel="noreferrer"
      style={{display:"inline-flex",alignItems:"center",gap:6,background:color,color:"#fff",
        fontWeight:600,fontSize:13,padding:"8px 18px",borderRadius:50,textDecoration:"none",
        marginTop:10,marginRight:8}}>
      {icon} {label}
    </a>
  );
}
function Card({children,style={}}){
  return(
    <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,
      padding:"1.25rem 1.5rem",marginBottom:"1rem",...style}}>
      {children}
    </div>
  );
}
function STitle({children}){
  return <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
    color:C.blue,marginBottom:12}}>{children}</div>;
}

// ══════════════════════════════════════════════════════════════════════════
// ADVERT BANNER
// ══════════════════════════════════════════════════════════════════════════
function AdBanner(){
  const ads=[
    {name:"MCAIS",tagline:"Your trusted health technology partner in Nigeria. AI-powered healthcare tools.",
     wa:PROFESSIONALS[1]?.whatsapp||"2349064815363",label:"Official Partner",cta:"Contact MCAIS"},
    {name:"Advertise Here",tagline:"Reach thousands of Nigerian patients and pharmacists daily. ₦15,000/month.",
     wa:"2349064815363",label:"Sponsored",cta:"Book slot"},
  ];
  const [i,setI]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setI(x=>(x+1)%ads.length),8000);return()=>clearInterval(t);},[]);
  const ad=ads[i];
  return(
    <div style={{background:C.lBlue,border:`1.5px solid ${C.blue}`,borderRadius:12,
      padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",
      justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:180}}>
        <div style={{width:40,height:40,borderRadius:10,background:C.blue,display:"flex",
          alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏥</div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
            <span style={{fontSize:14,fontWeight:700,color:C.navy}}>{ad.name}</span>
            <span style={{background:C.blue,color:"#fff",fontSize:10,fontWeight:600,
              padding:"2px 8px",borderRadius:20}}>{ad.label}</span>
          </div>
          <div style={{fontSize:12,color:C.muted}}>{ad.tagline}</div>
        </div>
      </div>
      <div style={{flexShrink:0}}>
        <WABtn href={waUrl(ad.wa, ad.name==="Advertise Here"
          ? "Hello MCAIS, I am interested in advertising on Nigeria Drug Checker. Please send me details about the ₦15,000/month banner slot."
          : `Hello ${ad.name}, I saw your advert on Nigeria Drug Checker.`)}
          label={ad.cta} color={C.blue}/>
        <div style={{fontSize:10,color:"#94A3B8",textAlign:"right",marginTop:4}}>Sponsored · Advertise here</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PROFESSIONALS DIRECTORY
// ══════════════════════════════════════════════════════════════════════════
function ProfCard({p,clientName,drug1,drug2,condition}){
  const msg=`Hello ${p.name},\n\nI am contacting you from Nigeria Drug Checker.\n\nClient: ${clientName||"Anonymous"}\nDrug 1: ${drug1||"N/A"}\nDrug 2: ${drug2||"N/A"}\nCondition: ${condition||"Not specified"}\n\nPlease advise.\n\nSent via Nigeria Drug Checker — MCAIS`;
  return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,
      padding:"1rem 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",
      flexWrap:"wrap",gap:12,marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:p.color,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"#fff",fontSize:18,fontWeight:700,flexShrink:0}}>{p.avatar}</div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{fontSize:14,fontWeight:700,color:C.text}}>{p.name}</span>
            {p.verified&&<span style={{background:"#EFF6FF",color:C.blue,fontSize:10,
              fontWeight:600,padding:"1px 7px",borderRadius:20}}>✓ Verified</span>}
            <span style={{background:p.available?"#F0FDF4":"#F1F5F9",
              color:p.available?C.green:C.muted,fontSize:10,fontWeight:600,
              padding:"1px 7px",borderRadius:20}}>{p.available?"● Online":"○ Offline"}</span>
          </div>
          <div style={{fontSize:12,color:C.muted}}>{p.specialty}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>
            📍 {p.location} · ⭐ {p.rating} ({p.reviews} reviews)
          </div>
        </div>
      </div>
      <WABtn href={waUrl(p.whatsapp,msg)}
        label={`Contact ${p.role==="doctor"?"Doctor":"Pharmacist"}`}
        color={p.color} icon={p.role==="doctor"?"🩺":"💊"}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// DRUG CHECKER TAB
// ══════════════════════════════════════════════════════════════════════════
function DrugTab({user}){
  const[d1,setD1]=useState(""); const[d2,setD2]=useState("");
  const[cond,setCond]=useState(""); const[cname,setCname]=useState(user?.name||"");
  const[result,setResult]=useState(null); const[checked,setChecked]=useState(false);

  function check(){
    if(!d1.trim()||!d2.trim()) return;
    setResult(checkDrug(d1,d2)); setChecked(true);
  }

  function buildMsg(){
    const base=`💊 *DRUG INTERACTION — Nigeria Drug Checker*\n🕐 ${ts()}\n\n👤 *Client:* ${cname||"Anonymous"}\n💊 *Drug 1:* ${d1}\n💊 *Drug 2:* ${d2}\n🏥 *Condition:* ${cond||"Not specified"}\n\n`;
    return result
      ? base+`⚠️ *Severity:* ${result.s}\n\n📋 *Interaction:*\n${result.e}\n\n✅ *Action:*\n${result.a}\n\n_Sent via Nigeria Drug Checker — MCAIS_`
      : base+`⚠️ Combination NOT found in database. Please advise.\n\n_Sent via Nigeria Drug Checker — MCAIS_`;
  }

  const col = result ? sevColor(result.s) : null;

  return(
    <div>
      <Card style={{borderTop:`3px solid ${C.blue}`}}>
        <STitle>Check drug interaction</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Drug 1" placeholder="e.g. Flagyl" value={d1} onChange={setD1}/>
          <Inp label="Drug 2" placeholder="e.g. Alcohol" value={d2} onChange={setD2}/>
        </div>
        <Inp label="Patient condition (optional)" placeholder="e.g. malaria, TB, pregnant" value={cond} onChange={setCond}/>
        <Inp label="Your name (optional)" placeholder="e.g. Emeka Obi" value={cname} onChange={setCname}/>
        <Btn label="Check interaction →" onClick={check} disabled={!d1.trim()||!d2.trim()} full/>
      </Card>

      {checked&&(
        <div style={{background:col?.bg||C.lBlue,border:`1px solid ${col?.border||C.blue}`,
          borderLeft:`4px solid ${col?.border||C.blue}`,borderRadius:"0 12px 12px 0",
          padding:"1rem 1.25rem",marginBottom:16}}>
          {result?(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>{sevIcon(result.s)}</span>
                <span style={{fontWeight:700,fontSize:15,color:col.text}}>Severity: {result.s}</span>
                <span style={{background:col.badge,color:"#fff",fontSize:11,fontWeight:600,
                  padding:"2px 10px",borderRadius:20}}>Nigerian database</span>
              </div>
              <div style={{fontSize:14,color:col.text,lineHeight:1.7,marginBottom:8}}>
                <strong>Interaction:</strong><br/>{result.e}
              </div>
              <div style={{fontSize:14,color:col.text,lineHeight:1.7}}>
                <strong>Recommended action:</strong><br/>{result.a}
              </div>
            </>
          ):(
            <div style={{color:C.navy,fontSize:14}}>
              🟡 <strong>Not in database</strong> — <strong>{d1}</strong> + <strong>{d2}</strong> not found locally.
              Ask a professional below to verify.
            </div>
          )}

          <div style={{marginTop:16}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:8,fontWeight:600}}>
              SEND TO A PROFESSIONAL:
            </div>
            {PROFESSIONALS.map(p=>(
              <ProfCard key={p.id} p={p} clientName={cname} drug1={d1} drug2={d2} condition={cond}/>
            ))}
          </div>
        </div>
      )}

      <Card>
        <STitle>Quick reference — common Nigerian drug combinations</STitle>
        {[
          {s:"None",     n:"Artemether + Lumefantrine (Coartem)", note:"Standard malaria treatment. Take with food."},
          {s:"Severe",   n:"Metronidazole (Flagyl) + Alcohol",    note:"Severe reaction. No alcohol during or 48hrs after."},
          {s:"Severe",   n:"Rifampicin + Oral Contraceptives",    note:"TB drug makes contraceptives fail. Use condoms."},
          {s:"Low",      n:"Paracetamol + Ibuprofen",             note:"Short-term OK. Avoid in liver/kidney disease."},
          {s:"Moderate", n:"Ciprofloxacin + Antacids",            note:"Antacids block absorption. Separate by 2+ hours."},
          {s:"Severe",   n:"Septrin (Cotrimoxazole) + Warfarin",  note:"Greatly increases bleeding risk. Avoid."},
          {s:"Severe",   n:"Tramadol + Alcohol",                  note:"Never combine. Risk of death."},
          {s:"Moderate", n:"Amlodipine + Simvastatin",            note:"Limit Simvastatin to 20mg/day."},
        ].map((c,i)=>{
          const col=sevColor(c.s);
          return(
            <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`,
              display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{background:col.badge,color:"#fff",fontSize:10,fontWeight:600,
                padding:"2px 8px",borderRadius:20,flexShrink:0,marginTop:2}}>
                {c.s==="None"?"Safe":c.s}
              </span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.n}</div>
                <div style={{fontSize:12,color:C.muted}}>{c.note}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PROFESSIONALS TAB
// ══════════════════════════════════════════════════════════════════════════
function ProfsTab(){
  const[filter,setFilter]=useState("all");
  const list = filter==="all" ? PROFESSIONALS
    : PROFESSIONALS.filter(p=>p.role===filter);

  return(
    <div>
      <Card style={{borderTop:`3px solid ${C.blue}`}}>
        <STitle>Our verified professionals</STitle>
        <p style={{fontSize:13,color:C.muted,marginBottom:16}}>
          All pharmacists and doctors are verified by MCAIS. Contact them directly on WhatsApp for advice.
        </p>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {["all","pharmacist","doctor"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:"7px 16px",fontSize:12,fontWeight:600,
              border:`1px solid ${filter===f?C.blue:C.border}`,
              borderRadius:20,background:filter===f?C.lBlue:C.white,
              color:filter===f?C.blue:C.muted,cursor:"pointer"}}>
              {f==="all"?"All":f==="pharmacist"?"💊 Pharmacists":"🩺 Doctors"}
            </button>
          ))}
        </div>
        {list.map(p=>(
          <div key={p.id} style={{background:C.gray,border:`1px solid ${C.border}`,
            borderRadius:12,padding:"1rem 1.25rem",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:p.color,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#fff",fontSize:22,fontWeight:700,flexShrink:0}}>{p.avatar}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontSize:15,fontWeight:700,color:C.text}}>{p.name}</span>
                  {p.verified&&<span style={{background:C.lBlue,color:C.blue,fontSize:10,
                    fontWeight:600,padding:"2px 8px",borderRadius:20}}>✓ Verified by MCAIS</span>}
                  <span style={{background:p.role==="doctor"?C.lBlue:"#F0FDF4",
                    color:p.role==="doctor"?C.blue:C.green,fontSize:10,fontWeight:600,
                    padding:"2px 8px",borderRadius:20,textTransform:"capitalize"}}>
                    {p.role}
                  </span>
                </div>
                <div style={{fontSize:13,color:C.text,marginBottom:4}}>{p.specialty}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:8}}>
                  📍 {p.location} · ⭐ {p.rating}/5 ({p.reviews} reviews) ·{" "}
                  <span style={{color:p.available?C.green:C.muted,fontWeight:600}}>
                    {p.available?"● Available now":"○ Currently offline"}
                  </span>
                </div>
                <WABtn
                  href={waUrl(p.whatsapp,`Hello ${p.name}, I have a question from Nigeria Drug Checker.`)}
                  label={`Contact ${p.name.split(" ")[0]}`}
                  color={p.color}
                  icon={p.role==="doctor"?"🩺":"💊"}/>
              </div>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <STitle>Are you a pharmacist or doctor?</STitle>
        <p style={{fontSize:13,color:C.muted,marginBottom:12,lineHeight:1.6}}>
          Join Nigeria Drug Checker as a verified professional. Receive client drug enquiries directly on WhatsApp.
          Plans start at ₦2,000/month.
        </p>
        <WABtn
          href={waUrl("2349064815363",
            "Hello MCAIS, I am a pharmacist/doctor and I want to join Nigeria Drug Checker as a verified professional.")}
          label="Apply to join — ₦2,000/month" color={C.blue} icon="✉️"/>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PHOTO TAB
// ══════════════════════════════════════════════════════════════════════════
function PhotoTab({user}){
  const[name,setName]=useState(user?.name||"");
  const[phone,setPhone]=useState("");
  const[concern,setConcern]=useState("");
  const[file,setFile]=useState(null);
  const[preview,setPreview]=useState(null);
  const[recipient,setRecipient]=useState(PROFESSIONALS[0]?.id||1);
  const ref=useRef();

  function handleFile(e){
    const f=e.target.files[0]; if(!f) return;
    setFile(f);
    const r=new FileReader();
    r.onload=ev=>setPreview(ev.target.result);
    r.readAsDataURL(f);
  }

  function send(){
    const pro=PROFESSIONALS.find(p=>p.id===recipient)||PROFESSIONALS[0];
    const msg=`💊 *DRUG PHOTO ENQUIRY — Nigeria Drug Checker*\n🕐 ${ts()}\n\n👤 *Client:* ${name||"Anonymous"}\n📞 *Phone:* ${phone||"Not provided"}\n\n❓ *Concern:*\n${concern}\n\n📸 *Image:* ${file?.name}\n_(Please attach the photo in this chat)_\n\n_Sent via Nigeria Drug Checker — MCAIS_`;
    window.open(waUrl(pro.whatsapp,msg),"_blank");
  }

  return(
    <Card style={{borderTop:`3px solid ${C.blue}`}}>
      <STitle>Send drug photo to a professional</STitle>
      <p style={{fontSize:13,color:C.muted,marginBottom:16}}>
        Upload a photo of your drug pack or label. We'll send it to a verified professional on WhatsApp.
      </p>

      <div onClick={()=>ref.current.click()} style={{
        border:`2px dashed ${C.border}`,borderRadius:10,padding:"1.5rem",
        textAlign:"center",cursor:"pointer",
        background:preview?"transparent":C.gray,marginBottom:12}}>
        {preview
          ?<img src={preview} alt="Drug" style={{maxWidth:"100%",maxHeight:200,borderRadius:8}}/>
          :<><div style={{fontSize:28}}>📷</div>
            <div style={{fontSize:14,fontWeight:600,color:C.text,marginTop:6}}>Click to upload drug image</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>JPG · PNG · WEBP</div></>
        }
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
      </div>

      <Inp label="Your name" placeholder="e.g. Chukwuemeka Eze" value={name} onChange={setName}/>
      <Inp label="Your phone (optional)" placeholder="e.g. 08012345678" value={phone} onChange={setPhone}/>
      <Txt label="Your question or concern" placeholder="e.g. Is this safe for my 4-year-old?" value={concern} onChange={setConcern} rows={3}/>

      <div style={{marginBottom:16}}>
        <label style={{fontSize:13,color:C.muted,display:"block",marginBottom:8}}>Send to:</label>
        {PROFESSIONALS.map(p=>(
          <div key={p.id} onClick={()=>setRecipient(p.id)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
              border:`1.5px solid ${recipient===p.id?p.color:C.border}`,
              borderRadius:8,marginBottom:8,cursor:"pointer",
              background:recipient===p.id?"#F8FAFC":C.white}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:p.color,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#fff",fontWeight:700,flexShrink:0}}>{p.avatar}</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{p.name}</div>
              <div style={{fontSize:11,color:C.muted}}>{p.specialty.split("·")[0].trim()}</div>
            </div>
            {recipient===p.id&&<span style={{marginLeft:"auto",color:p.color,fontSize:18}}>✓</span>}
          </div>
        ))}
      </div>

      <Btn label="📲 Prepare WhatsApp message" onClick={send} disabled={!file||!concern.trim()} full/>
      {file&&concern.trim()&&
        <div style={{marginTop:8,fontSize:12,color:C.muted}}>
          ✅ After WhatsApp opens, tap 📎 to also attach the drug photo.
        </div>}
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// REVIEW TAB
// ══════════════════════════════════════════════════════════════════════════
function ReviewTab({user}){
  const[name,setName]=useState(user?.name||"");
  const[rating,setRating]=useState(5);
  const[text,setText]=useState("");
  const[recipient,setRecipient]=useState(PROFESSIONALS[0]?.id||1);
  const[sent,setSent]=useState(false);

  function send(){
    const pro=PROFESSIONALS.find(p=>p.id===recipient)||PROFESSIONALS[0];
    const stars="⭐".repeat(rating);
    const msg=`💬 *CLIENT REVIEW — Nigeria Drug Checker*\n🕐 ${ts()}\n\n👤 *From:* ${name||"Anonymous"}\n👨‍⚕️ *For:* ${pro.name}\n${stars} (${rating}/5)\n\n📝 *Review:*\n${text}\n\n_Sent via Nigeria Drug Checker — MCAIS_`;
    window.open(waUrl(pro.whatsapp,msg),"_blank");
    setSent(true);
  }

  return(
    <Card style={{borderTop:`3px solid ${C.blue}`}}>
      <STitle>Leave a review</STitle>
      <p style={{fontSize:13,color:C.muted,marginBottom:16}}>Your review goes directly to the professional on WhatsApp.</p>

      <div style={{marginBottom:16}}>
        <label style={{fontSize:13,color:C.muted,display:"block",marginBottom:8}}>Review for:</label>
        {PROFESSIONALS.map(p=>(
          <div key={p.id} onClick={()=>setRecipient(p.id)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
              border:`1.5px solid ${recipient===p.id?p.color:C.border}`,
              borderRadius:8,marginBottom:8,cursor:"pointer"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:p.color,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700}}>
              {p.avatar}
            </div>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{p.name}</span>
            {recipient===p.id&&<span style={{marginLeft:"auto",color:p.color,fontSize:18}}>✓</span>}
          </div>
        ))}
      </div>

      <Inp label="Your name" placeholder="e.g. Adaeze Okonkwo" value={name} onChange={setName}/>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:13,color:C.muted,display:"block",marginBottom:6}}>Rating</label>
        <div style={{display:"flex",gap:8}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setRating(n)}
              style={{fontSize:24,background:"none",border:"none",cursor:"pointer",
                opacity:n<=rating?1:0.3,transition:"opacity 0.15s"}}>⭐</button>
          ))}
          <span style={{fontSize:13,color:C.muted,alignSelf:"center",marginLeft:4}}>{rating}/5</span>
        </div>
      </div>
      <Txt label="Your review" placeholder="Tell us about your experience…" value={text} onChange={setText} rows={4}/>
      {sent
        ?<div style={{background:"#F0FDF4",border:`1px solid ${C.green}`,borderRadius:8,
            padding:"10px 14px",fontSize:13,color:"#14532D"}}>✅ Review sent! Thank you.</div>
        :<Btn label="📲 Send review on WhatsApp" onClick={send} disabled={!text.trim()} full/>
      }
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// AUTH MODAL
// ══════════════════════════════════════════════════════════════════════════
function AuthModal({onClose,onLogin}){
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");
  const[name,setName]=useState("");
  const[phone,setPhone]=useState("");
  const[plan,setPlan]=useState("free");
  const[role,setRole]=useState("client");

  function submit(){
    if(!email) return;
    if(plan==="pro"||role==="professional"){
      const amount = role==="professional" ? 2000 : 2000;
      initPaystack({email,amount,name,onSuccess:()=>{
        onLogin({email,name,phone,plan:"pro",role,searches:0});
        onClose();
      }});
    } else {
      onLogin({email,name,phone,plan:"free",role:"client",searches:0});
      onClose();
    }
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,22,40,0.6)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <div style={{background:C.white,borderRadius:16,padding:"1.5rem",
        width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:700,color:C.navy}}>💊 Nigeria Drug Checker</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.muted}}>✕</button>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{
              flex:1,padding:"8px 0",fontSize:13,fontWeight:600,borderRadius:8,
              border:`1px solid ${mode===m?C.blue:C.border}`,
              background:mode===m?C.blue:C.white,
              color:mode===m?"#fff":C.muted,cursor:"pointer"}}>
              {m==="login"?"Sign in":"Create account"}
            </button>
          ))}
        </div>

        <Inp label="Email address" placeholder="you@email.com" value={email} onChange={setEmail} type="email"/>

        {mode==="signup"&&<>
          <Inp label="Full name" placeholder="Your full name" value={name} onChange={setName}/>
          <Inp label="Phone number" placeholder="08012345678" value={phone} onChange={setPhone}/>

          <div style={{marginBottom:16}}>
            <label style={{fontSize:13,color:C.muted,display:"block",marginBottom:8}}>I am a:</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{id:"client",label:"👤 Patient / Client",desc:"Looking for drug info"},
                {id:"professional",label:"💊 Pharmacist / Doctor",desc:"Want to be listed — ₦2,000/mo"}].map(r=>(
                <div key={r.id} onClick={()=>setRole(r.id)} style={{
                  border:`2px solid ${role===r.id?C.blue:C.border}`,
                  borderRadius:10,padding:"10px",cursor:"pointer",
                  background:role===r.id?C.lBlue:C.white}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{r.label}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {role==="client"&&(
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,color:C.muted,display:"block",marginBottom:8}}>Choose plan:</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{id:"free",label:"Free",price:"₦0/mo",desc:"5 searches/day"},
                  {id:"pro", label:"Pro", price:"₦2,000/mo",desc:"Unlimited + photos",hot:true}].map(p=>(
                  <div key={p.id} onClick={()=>setPlan(p.id)} style={{
                    border:`2px solid ${plan===p.id?C.blue:C.border}`,
                    borderRadius:10,padding:"10px",cursor:"pointer",
                    background:plan===p.id?C.lBlue:C.white}}>
                    {p.hot&&<div style={{fontSize:10,fontWeight:700,color:C.blue,marginBottom:2}}>POPULAR</div>}
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>{p.label}</div>
                    <div style={{fontSize:13,color:C.blue,fontWeight:600}}>{p.price}</div>
                    <div style={{fontSize:11,color:C.muted}}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>}

        <Btn
          label={mode==="login"?"Sign in →":
            role==="professional"?"Continue to payment — ₦2,000/mo →":
            plan==="pro"?"Continue to payment — ₦2,000/mo →":"Create free account →"}
          onClick={submit} full/>
        <div style={{marginTop:10,fontSize:12,color:C.muted,textAlign:"center"}}>
          Secure payment via Paystack · Nigerian banks accepted
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════
function Landing({onStart}){
  const[scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  return(
    <div>
      {/* Nav */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,
        background:scrolled?"rgba(255,255,255,0.95)":"transparent",
        backdropFilter:scrolled?"blur(12px)":"none",
        borderBottom:scrolled?`1px solid ${C.border}`:"none",
        transition:"all 0.3s",padding:"14px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,background:C.navy,borderRadius:9,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💊</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:scrolled?C.navy:"#fff",
                fontFamily:"'DM Serif Display',Georgia,serif"}}>Nigeria Drug Checker</div>
              <div style={{fontSize:9,color:scrolled?C.muted:"rgba(255,255,255,0.6)",
                letterSpacing:"0.1em",textTransform:"uppercase"}}>Powered by MCAIS</div>
            </div>
          </div>
          <button onClick={onStart} style={{background:C.blue,color:"#fff",border:"none",
            borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${C.navy} 0%,#0F2D6B 50%,#1A3A8C 100%)`,
        minHeight:"100vh",display:"flex",alignItems:"center",padding:"120px 24px 80px"}}>
        <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,
            background:"rgba(26,86,219,0.3)",border:"1px solid rgba(26,86,219,0.5)",
            borderRadius:50,padding:"6px 16px",marginBottom:24}}>
            <span style={{width:6,height:6,background:"#4ADE80",borderRadius:"50%",display:"inline-block"}}/>
            <span style={{fontSize:12,color:"#94D2FF",fontWeight:600,letterSpacing:"0.05em"}}>
              TRUSTED BY NIGERIAN HEALTHCARE WORKERS
            </span>
          </div>
          <h1 style={{fontSize:48,fontWeight:700,color:"#fff",lineHeight:1.15,
            fontFamily:"'DM Serif Display',Georgia,serif",marginBottom:20}}>
            Nigeria's first<br/><span style={{color:"#60A5FA"}}>AI-powered</span><br/>drug safety platform
          </h1>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.75)",lineHeight:1.7,marginBottom:32,maxWidth:500,margin:"0 auto 32px"}}>
            Check drug interactions with Nigerian clinical context. Send drug photos to verified pharmacists on WhatsApp. Built for 220 million Nigerians.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:40}}>
            <button onClick={onStart} style={{background:C.blue,color:"#fff",border:"none",
              borderRadius:10,padding:"14px 32px",fontSize:16,fontWeight:700,cursor:"pointer"}}>
              Start for free →
            </button>
            <button onClick={onStart} style={{background:"rgba(255,255,255,0.1)",color:"#fff",
              border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,
              padding:"14px 32px",fontSize:16,fontWeight:600,cursor:"pointer"}}>
              See professionals →
            </button>
          </div>
          <div style={{display:"flex",gap:32,justifyContent:"center"}}>
            {[["150+","Drug combinations"],["2","Verified professionals"],["37","States covered"]].map(([n,l])=>(
              <div key={n} style={{textAlign:"center"}}>
                <div style={{fontSize:24,fontWeight:700,color:"#60A5FA"}}>{n}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{padding:"80px 24px",background:C.white}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:50}}>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",
              color:C.blue,marginBottom:10}}>WHY NIGERIA DRUG CHECKER</div>
            <h2 style={{fontSize:36,fontWeight:700,color:C.navy,
              fontFamily:"'DM Serif Display',Georgia,serif"}}>Built for Nigerian healthcare</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
            {[
              {i:"🔬",t:"Nigerian drug database",d:"150+ interactions including local brand names — Flagyl, Coartem, Septrin, Ampiclox, Panadol. Built for how Nigerians actually talk about drugs."},
              {i:"📲",t:"Direct WhatsApp access",d:"Every result connects you to a verified Nigerian pharmacist or doctor on WhatsApp. Professional advice in minutes, not hours."},
              {i:"📸",t:"Drug photo upload",d:"Upload a photo of any drug pack. Our verified professionals review it and respond directly on WhatsApp."},
              {i:"💊",t:"Verified professionals",d:`${PROFESSIONALS.length} verified pharmacists and doctors ready to help. Filter by specialty, location, and availability.`},
              {i:"🇳🇬",t:"Nigerian clinical context",d:"Unlike Western AI, our database prioritises Nigerian disease patterns — TB, malaria, sickle cell, and local drug availability."},
              {i:"🔒",t:"Subscription plans",d:"Free plan for patients. Pro plan for heavy users. Professional listing for pharmacists and doctors. Powered by Paystack."},
            ].map((f,i)=>(
              <div key={i} style={{background:C.gray,borderRadius:14,padding:"1.5rem",
                border:`1px solid ${C.border}`}}>
                <span style={{fontSize:28}}>{f.i}</span>
                <div style={{fontSize:15,fontWeight:700,color:C.text,margin:"10px 0 6px"}}>{f.t}</div>
                <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{padding:"80px 24px",background:C.gray}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:50}}>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",
              color:C.blue,marginBottom:10}}>PRICING</div>
            <h2 style={{fontSize:36,fontWeight:700,color:C.navy,
              fontFamily:"'DM Serif Display',Georgia,serif"}}>Simple Nigerian pricing</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:20}}>
            {[
              {n:"Free",p:"₦0",per:"/month",d:"For patients",hi:false,
               f:["5 drug checks/day","Basic drug database","WhatsApp pharmacist access","Community reviews"],
               cta:"Get started free"},
              {n:"Pro",p:"₦2,000",per:"/month",d:"For frequent users",hi:true,
               f:["Unlimited drug checks","Drug photo uploads","Priority professional access","Full drug database","All 150+ interactions"],
               cta:"Get Pro →"},
              {n:"Professional",p:"₦2,000",per:"/month",d:"For pharmacists & doctors",hi:false,
               f:["Listed in professional directory","Receive client WhatsApp enquiries","Verified badge on profile","Monthly client report","MCAIS partnership badge"],
               cta:"Join as professional →"},
            ].map((p,i)=>(
              <div key={i} style={{background:p.hi?C.navy:C.white,borderRadius:16,padding:"2rem",
                border:`${p.hi?"2px":"1px"} solid ${p.hi?C.blue:C.border}`,position:"relative"}}>
                {p.hi&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",
                  background:C.blue,color:"#fff",fontSize:11,fontWeight:700,
                  padding:"4px 16px",borderRadius:20}}>MOST POPULAR</div>}
                <div style={{fontSize:14,fontWeight:700,color:p.hi?"#94A3B8":C.muted,marginBottom:4}}>{p.n}</div>
                <div style={{fontSize:32,fontWeight:700,color:p.hi?"#fff":C.text}}>{p.p}
                  <span style={{fontSize:13,fontWeight:400,color:p.hi?"#94A3B8":C.muted}}>{p.per}</span>
                </div>
                <div style={{fontSize:12,color:p.hi?"#94A3B8":C.muted,marginBottom:20}}>{p.d}</div>
                {p.f.map((f,j)=>(
                  <div key={j} style={{display:"flex",gap:8,padding:"6px 0",
                    borderBottom:`1px solid ${p.hi?"rgba(255,255,255,0.1)":C.border}`}}>
                    <span style={{color:C.green}}>✓</span>
                    <span style={{fontSize:13,color:p.hi?"rgba(255,255,255,0.85)":C.text}}>{f}</span>
                  </div>
                ))}
                <button onClick={onStart} style={{width:"100%",padding:"12px",fontSize:14,fontWeight:700,
                  borderRadius:10,border:"none",cursor:"pointer",marginTop:20,
                  background:p.hi?C.blue:C.text,color:"#fff"}}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:"80px 24px",background:`linear-gradient(135deg,${C.navy} 0%,#0F2D6B 100%)`}}>
        <div style={{maxWidth:600,margin:"0 auto",textAlign:"center"}}>
          <h2 style={{fontSize:38,fontWeight:700,color:"#fff",
            fontFamily:"'DM Serif Display',Georgia,serif",marginBottom:16}}>
            Start protecting Nigerian patients today
          </h2>
          <p style={{fontSize:15,color:"rgba(255,255,255,0.7)",marginBottom:32,lineHeight:1.7}}>
            Free to use. Works on any phone. Connects you to verified Nigerian professionals on WhatsApp in seconds.
          </p>
          <button onClick={onStart} style={{background:C.blue,color:"#fff",border:"none",
            borderRadius:10,padding:"14px 40px",fontSize:16,fontWeight:700,cursor:"pointer"}}>
            Get started free →
          </button>
          <div style={{marginTop:20,fontSize:12,color:"rgba(255,255,255,0.4)"}}>
            ✓ No download needed &nbsp;·&nbsp; ✓ Free plan available &nbsp;·&nbsp; ✓ Paystack payments
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{background:C.navy,padding:"32px 24px",
        borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>💊 Nigeria Drug Checker</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Powered by MCAIS · African Health AI</div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",textAlign:"right"}}>
            Not a substitute for professional medical advice.<br/>
            Always consult your pharmacist or doctor.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════
export default function App(){
  const[page,setPage]=useState("landing");
  const[tab,setTab]=useState("checker");
  const[user,setUser]=useState(null);
  const[showAuth,setShowAuth]=useState(false);

  if(page==="landing") return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',system-ui,sans-serif}button{transition:all 0.15s;font-family:inherit}button:active{transform:scale(0.97)}a{transition:opacity 0.15s}a:hover{opacity:0.85}html{scroll-behavior:smooth}`}</style>
      <Landing onStart={()=>setPage("app")}/>
    </>
  );

  const TABS=[
    {id:"checker",  label:"💊 Drug Check"},
    {id:"profs",    label:"👨‍⚕️ Professionals"},
    {id:"photo",    label:"📸 Photo"},
    {id:"reviews",  label:"⭐ Review"},
  ];

  return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',system-ui,sans-serif;background:#F1F5F9}input:focus,textarea:focus{border-color:#1A56DB!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)}button{transition:all 0.15s}button:not(:disabled):active{transform:scale(0.97)}`}</style>

      {/* Header */}
      <div style={{background:C.navy,padding:"12px 16px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setPage("landing")}>
            <div style={{width:32,height:32,background:C.blue,borderRadius:8,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💊</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'DM Serif Display',Georgia,serif"}}>Nigeria Drug Checker</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:"0.08em",textTransform:"uppercase"}}>MCAIS</div>
            </div>
          </div>
          {user
            ?<div style={{display:"flex",alignItems:"center",gap:8}}>
               <div style={{width:30,height:30,borderRadius:"50%",background:C.blue,
                 display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700}}>
                 {(user.name||user.email).charAt(0).toUpperCase()}
               </div>
               <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>
                 <div style={{fontWeight:600,color:"#fff"}}>{user.name||user.email.split("@")[0]}</div>
                 <div style={{color:user.plan==="pro"?"#60A5FA":"rgba(255,255,255,0.5)",fontSize:10}}>
                   {user.plan==="pro"?"Pro ✓":"Free"}
                 </div>
               </div>
             </div>
            :<button onClick={()=>setShowAuth(true)} style={{background:C.blue,color:"#fff",border:"none",
               borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
               Sign in / Subscribe
             </button>
          }
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"16px 16px 80px"}}>
        {/* Upsell banner */}
        {!user&&(
          <div style={{background:C.navy,borderRadius:12,padding:"12px 16px",marginBottom:16,
            display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Upgrade to Pro — ₦2,000/month</div>
              <div style={{fontSize:12,color:"#94A3B8",marginTop:2}}>Unlimited checks · Photo uploads · Priority access</div>
            </div>
            <button onClick={()=>setShowAuth(true)} style={{background:C.blue,color:"#fff",border:"none",
              borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
              Get Pro →
            </button>
          </div>
        )}

        <AdBanner/>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:16,background:C.white,
          borderRadius:12,padding:4,border:`1px solid ${C.border}`}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,padding:"8px 4px",fontSize:11,fontWeight:600,borderRadius:8,border:"none",
              background:tab===t.id?C.blue:"transparent",
              color:tab===t.id?"#fff":C.muted,cursor:"pointer"}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==="checker" &&<DrugTab    user={user}/>}
        {tab==="profs"   &&<ProfsTab/>}
        {tab==="photo"   &&<PhotoTab   user={user}/>}
        {tab==="reviews" &&<ReviewTab  user={user}/>}

        <div style={{textAlign:"center",color:C.muted,fontSize:11,padding:"1rem 0",lineHeight:1.8}}>
          Nigeria Drug Checker · Powered by MCAIS · Free to use<br/>
          Not a substitute for professional medical advice.
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.white,
        borderTop:`1px solid ${C.border}`,display:"flex",padding:"8px 0 12px",justifyContent:"space-around"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            background:"none",border:"none",cursor:"pointer",
            color:tab===t.id?C.blue:C.muted,
            fontSize:10,fontWeight:tab===t.id?700:400}}>
            <span style={{fontSize:20}}>{t.label.split(" ")[0]}</span>
            <span>{t.label.split(" ").slice(1).join(" ")}</span>
          </button>
        ))}
      </div>

      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onLogin={u=>{setUser(u);setShowAuth(false);}}/>}
    </>
  );
}
