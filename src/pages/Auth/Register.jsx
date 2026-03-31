// src/pages/Auth/Register.jsx — DevOpsAkademy
// VERSION FINALE v3.0 — Mise en page 2 colonnes
// ✅ Colonne gauche : présentation / bénéfices selon le rôle
// ✅ Colonne droite : formulaire avec onglets Étudiant / Formateur
// ✅ Plus aucune page blanche (AuthContext ne bloque plus le rendu)
// ✅ Confirmation de mot de passe
// ✅ Écran succès avec compte à rebours + redirection
// ✅ Validation précise par champ

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  GraduationCap, BookOpen, CheckCircle, AlertCircle,
  Mail, Lock, Eye, EyeOff, User, ShieldCheck, ArrowRight,
  Clock, RefreshCw, AlertTriangle, Loader, Star,
  Trophy, Award, Users, Terminal, BarChart2, Zap
} from "lucide-react"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15", dark: "#1f1b5a" }

const ROLE_CONTENT = {
  student: {
    title:    "Lancez votre carrière DevOps",
    subtitle: "Rejoignez +2 000 ingénieurs formés par des praticiens.",
    icon:     GraduationCap,
    features: [
      { icon: Terminal,  text: "Labs interactifs Kubernetes & Docker" },
      { icon: Award,     text: "Certificats numériques vérifiables" },
      { icon: BarChart2, text: "Suivi de progression personnalisé" },
      { icon: Users,     text: "Communauté et forum actif" },
      { icon: Trophy,    text: "Classement gamifié & points XP" },
      { icon: Zap,       text: "Accès immédiat aux cours gratuits" },
    ],
    testimonial: {
      text:    "J'ai décroché ma première mission Cloud en 3 mois grâce à DevOpsAkademy.",
      author:  "Jean D.", role: "DevOps Engineer · Dakar", initials:"JD",
      color:   "from-violet-500 to-indigo-600",
    }
  },
  instructor: {
    title:    "Partagez votre expertise",
    subtitle: "Devenez formateur et touchez des milliers d'apprenants.",
    icon:     BookOpen,
    features: [
      { icon: Users,     text: "Audience de +2 000 apprenants actifs" },
      { icon: BarChart2, text: "Analytics détaillés de vos cours" },
      { icon: Award,     text: "Certification instructeur officielle" },
      { icon: Terminal,  text: "Outils de création de cours complets" },
      { icon: Trophy,    text: "Commissions sur chaque inscription" },
      { icon: Zap,       text: "Support dédié de notre équipe" },
    ],
    testimonial: {
      text:    "Mon cours Kubernetes génère des revenus passifs chaque mois.",
      author:  "Amina T.", role: "SRE Senior · Instructrice certifiée", initials:"AT",
      color:   "from-amber-500 to-orange-600",
    }
  }
}

function PwdStrength({ pwd }) {
  if (!pwd) return null
  const checks = { length:pwd.length>=8, upper:/[A-Z]/.test(pwd), number:/[0-9]/.test(pwd), special:/[^a-zA-Z0-9]/.test(pwd) }
  const score = Object.values(checks).filter(Boolean).length
  const levels = [
    {label:"Trop court",color:"#ef4444",w:"20%"},
    {label:"Faible",    color:"#f97316",w:"45%"},
    {label:"Moyen",     color:"#eab308",w:"70%"},
    {label:"Fort",      color:"#22c55e",w:"100%"},
  ]
  const lv = levels[score-1] || levels[0]
  return (
    <div className="mt-1 space-y-1">
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{width:lv.w,background:lv.color}}/>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold" style={{color:lv.color}}>{lv.label}</span>
        <div className="flex gap-1">
          {[["length","8+"],["upper","Maj"],["number","123"],["special","#@"]].map(([k,l])=>(
            <span key={k} className={`text-[9px] px-1 py-0.5 rounded font-medium ${checks[k]?"bg-emerald-100 text-emerald-700":"bg-gray-100 text-gray-400"}`}>
              {checks[k]?"✓":"·"}{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function LeftPanel({ role }) {
  const content = ROLE_CONTENT[role]
  const Icon = content.icon
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden h-full"
      style={{background:`linear-gradient(135deg,${C.dark} 0%,${C.primary} 60%,${C.light} 100%)`}}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:`linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)`,
        backgroundSize:"40px 40px"
      }}/>
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{background:C.accent,filter:"blur(60px)"}}/>
      <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full opacity-10" style={{background:C.light,filter:"blur(50px)"}}/>

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{background:C.accent}}>
            <span className="text-indigo-900 font-black text-sm">DA</span>
          </div>
          <span className="font-black text-lg tracking-tight">DevOps Akademy</span>
        </div>
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.2)"}}>
            <Icon className="w-7 h-7 text-white"/>
          </div>
          <h2 className="text-3xl font-black leading-tight mb-3">{content.title}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{content.subtitle}</p>
        </div>
        <div className="space-y-3">
          {content.features.map(({icon:FIcon,text},i)=>(
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{background:"rgba(255,255,255,0.12)"}}>
                <FIcon className="w-3.5 h-3.5 text-white/80"/>
              </div>
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 rounded-2xl p-5"
        style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",backdropFilter:"blur(8px)"}}>
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_,i)=><Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"/>)}
        </div>
        <p className="text-white/80 text-sm italic leading-relaxed mb-4">"{content.testimonial.text}"</p>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${content.testimonial.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
            {content.testimonial.initials}
          </div>
          <div>
            <p className="text-white text-sm font-bold">{content.testimonial.author}</p>
            <p className="text-white/50 text-xs">{content.testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessScreen({ email, emailSent, role, onResend, resending, resendOk }) {
  const navigate = useNavigate()
  const [left, setLeft] = useState(10)
  useEffect(() => {
    const t = setInterval(() => setLeft(p => {
      if (p<=1) { clearInterval(t); navigate("/login",{state:{message:"✅ Compte créé ! Vérifiez votre email puis connectez-vous.",email}}); return 0 }
      return p-1
    }), 1000)
    return () => clearInterval(t)
  }, [navigate, email])
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{background:"linear-gradient(135deg,#ecfdf5,#d1fae5)",border:"3px solid #10b981"}}>
            <Mail className="w-10 h-10 text-emerald-500"/>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow">
            <CheckCircle className="w-3.5 h-3.5 text-white"/>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Compte créé ! 🎉</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {emailSent
              ? <>Email d'activation envoyé à <strong className="text-indigo-700 break-all">{email}</strong></>
              : <>Compte créé pour <strong className="text-indigo-700">{email}</strong></>}
          </p>
        </div>
        {emailSent ? (
          <div className="rounded-xl p-4 text-left space-y-2.5" style={{background:"#f0f9ff",border:"1px solid #bae6fd"}}>
            <p className="text-xs font-bold text-blue-700">📬 Pour activer votre compte :</p>
            {["Ouvrez votre boîte email (et vos spams)","Cliquez sur « Activer mon compte »","Votre compte est activé instantanément"].map((s,i)=>(
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0" style={{background:"#0ea5e9"}}>{i+1}</div>
                <p className="text-blue-700 text-xs">{s}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl p-3 text-left flex items-start gap-2" style={{background:"#fffbeb",border:"1px solid #fde68a"}}>
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/>
            <p className="text-amber-700 text-xs leading-relaxed">L'envoi automatique a échoué. Cliquez sur <strong>Renvoyer</strong>.</p>
          </div>
        )}
        {role==="instructor" && (
          <div className="rounded-xl p-3 text-left flex items-start gap-2" style={{background:"#f5f3ff",border:"1px solid #ddd6fe"}}>
            <BookOpen className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5"/>
            <p className="text-violet-700 text-xs leading-relaxed">
              <strong>Étape suivante :</strong> après connexion, soumettez votre candidature via <strong>Devenir instructeur</strong>.
            </p>
          </div>
        )}
        {resendOk ? (
          <p className="text-emerald-600 text-xs font-medium flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5"/> Email renvoyé ! Vérifiez vos spams.
          </p>
        ) : (
          <button onClick={onResend} disabled={resending}
            className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{borderColor:C.light,color:C.light}}>
            {resending?<><Loader className="w-3.5 h-3.5 animate-spin"/>Envoi...</>:<><RefreshCw className="w-3.5 h-3.5"/>Renvoyer l'email</>}
          </button>
        )}
        <Link to="/login" state={{message:"✅ Vérifiez votre email pour activer votre compte.",email}}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition"
          style={{background:`linear-gradient(135deg,${C.primary},${C.light})`}}>
          <ArrowRight className="w-4 h-4"/> Se connecter maintenant
        </Link>
        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
          <Clock className="w-3 h-3"/>
          Redirection dans <span className="font-black text-indigo-600 tabular-nums">{left}s</span>
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [role,      setRole]      = useState("student")
  const [form,      setForm]      = useState({first_name:"",last_name:"",email:"",password:"",confirm:""})
  const [showPwd,   setShowPwd]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [emailSent, setEmailSent] = useState(true)
  const [resending, setResending] = useState(false)
  const [resendOk,  setResendOk]  = useState(false)
  const [errors,    setErrors]    = useState({})
  const [globalErr, setGlobalErr] = useState("")

  useEffect(() => {
    if (!user) return
    const r = user.role
    navigate(r==="admin"||r==="superadmin"?"/admin":r==="instructor"?"/instructor":"/student",{replace:true})
  }, [user, navigate])

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:""})); setGlobalErr("") }
  const changeRole = (r) => { setRole(r); setErrors({}); setGlobalErr("") }

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()||form.first_name.trim().length<2) e.first_name="Minimum 2 caractères"
    if (!form.last_name.trim()||form.last_name.trim().length<2)   e.last_name="Minimum 2 caractères"
    if (!form.email||!form.email.includes("@"))                    e.email="Email invalide"
    if (!form.password||form.password.length<8)                    e.password="Minimum 8 caractères"
    if (!form.confirm)                                              e.confirm="Confirmez votre mot de passe"
    else if (form.password!==form.confirm)                         e.confirm="Les mots de passe ne correspondent pas"
    setErrors(e); return Object.keys(e).length===0
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); if(!validate()) return
    setLoading(true); setGlobalErr("")
    try {
      const {confirm,...payload} = form
      const res = await register({...payload,role})
      if(res?.success) { setEmailSent(res.email_sent!==false); setSuccess(true) }
      else {
        const msg = res?.message||"Une erreur est survenue"
        if(msg.toLowerCase().includes("exist")||msg.toLowerCase().includes("déjà"))
          setErrors(p=>({...p,email:"Cet email est déjà utilisé. Connectez-vous ?"}))
        else if(msg.toLowerCase().includes("email")) setErrors(p=>({...p,email:msg}))
        else setGlobalErr(msg)
      }
    } catch(err) { setGlobalErr(err?.message||"Erreur de connexion au serveur") }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setResendOk(false)
    try { await fetch("/api/auth/resend-verification",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.email})}); setResendOk(true) }
    catch{} finally{setResending(false)}
  }

  const inp = "flex-1 px-3.5 py-3 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"
  const fw  = (k) => `flex items-center rounded-xl border-2 transition bg-white ${errors[k]?"border-red-300":"border-gray-200 focus-within:border-indigo-400"}`

  return (
    <div className="min-h-screen flex" style={{background:`linear-gradient(135deg,#1e1b4b,#2d287f,#4c1d95)`}}>
      <div className="m-auto w-full max-w-5xl min-h-screen lg:min-h-0 lg:my-8 lg:rounded-3xl lg:shadow-2xl overflow-hidden flex flex-col lg:flex-row bg-white">

        {/* COLONNE GAUCHE */}
        <div className="lg:w-[42%] lg:flex-shrink-0">
          <LeftPanel role={role}/>
        </div>

        {/* COLONNE DROITE */}
        <div className="flex-1 flex flex-col">
          {success ? (
            <SuccessScreen email={form.email} emailSent={emailSent} role={role}
              onResend={handleResend} resending={resending} resendOk={resendOk}/>
          ) : (
            <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-12">
              {/* Logo mobile */}
              <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:C.accent}}>
                  <span className="text-indigo-900 font-black text-xs">DA</span>
                </div>
                <span className="font-black" style={{color:C.primary}}>DevOps Akademy</span>
              </div>

              <div className="max-w-md w-full mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-gray-900">Créer un compte</h1>
                  <p className="text-gray-500 text-sm mt-1">Rejoignez la communauté DevOps francophone</p>
                </div>

                {/* ONGLETS */}
                <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-2xl bg-gray-100">
                  {[
                    {value:"student",   icon:GraduationCap, label:"Apprenant",  sub:"Je veux apprendre"},
                    {value:"instructor",icon:BookOpen,       label:"Formateur",  sub:"Je veux enseigner"},
                  ].map(({value,icon:Icon,label,sub})=>(
                    <button key={value} type="button" onClick={()=>changeRole(value)}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all text-center"
                      style={role===value
                        ?{background:`linear-gradient(135deg,${C.primary},${C.light})`,color:"#fff",boxShadow:"0 4px 12px rgba(45,40,127,0.3)"}
                        :{background:"transparent",color:"#6b7280"}}>
                      <Icon className="w-5 h-5"/>
                      <span className="font-black text-sm">{label}</span>
                      <span className={`text-[10px] ${role===value?"text-white/75":"text-gray-400"}`}>{sub}</span>
                    </button>
                  ))}
                </div>

                {/* Avertissement formateur */}
                {role==="instructor" && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3"
                    style={{background:"#fffbeb",border:"1px solid #fde68a"}}>
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-amber-800 font-bold text-xs">Compte Formateur</p>
                      <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                        Après inscription, soumettez votre candidature via <strong>Devenir instructeur</strong>. Réponse sous 3–5 jours ouvrés.
                      </p>
                    </div>
                  </div>
                )}

                {globalErr && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl px-3 py-2.5"
                    style={{background:"#fef2f2",border:"1px solid #fecaca"}}>
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5"/>
                    <p className="text-red-600 text-xs">{globalErr}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                  {/* Prénom / Nom */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className={fw("first_name")}>
                        <div className="pl-3"><User className="w-3.5 h-3.5 text-gray-400"/></div>
                        <input value={form.first_name} onChange={e=>set("first_name",e.target.value)}
                          className={inp} placeholder="Prénom" autoComplete="given-name" autoFocus/>
                      </div>
                      {errors.first_name&&<p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5"/>{errors.first_name}</p>}
                    </div>
                    <div>
                      <div className={fw("last_name")}>
                        <input value={form.last_name} onChange={e=>set("last_name",e.target.value)}
                          className={inp} placeholder="Nom" autoComplete="family-name"/>
                      </div>
                      {errors.last_name&&<p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5"/>{errors.last_name}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <div className={fw("email")}>
                      <div className="pl-3"><Mail className="w-3.5 h-3.5 text-gray-400"/></div>
                      <input type="email" value={form.email} onChange={e=>set("email",e.target.value)}
                        className={inp} placeholder="vous@exemple.com" autoComplete="email"/>
                    </div>
                    {errors.email&&<p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5"/>{errors.email}</p>}
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <div className={fw("password")}>
                      <div className="pl-3"><Lock className="w-3.5 h-3.5 text-gray-400"/></div>
                      <input type={showPwd?"text":"password"} value={form.password}
                        onChange={e=>set("password",e.target.value)}
                        className={inp} placeholder="Minimum 8 caractères" autoComplete="new-password"/>
                      <button type="button" onClick={()=>setShowPwd(s=>!s)}
                        className="pr-3 text-gray-400 hover:text-gray-600 transition">
                        {showPwd?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}
                      </button>
                    </div>
                    {errors.password
                      ?<p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5"/>{errors.password}</p>
                      :<PwdStrength pwd={form.password}/>}
                  </div>

                  {/* Confirmation */}
                  <div>
                    <div className={fw("confirm")}>
                      <div className="pl-3">
                        {form.confirm&&form.confirm===form.password
                          ?<CheckCircle className="w-3.5 h-3.5 text-emerald-500"/>
                          :<ShieldCheck className="w-3.5 h-3.5 text-gray-400"/>}
                      </div>
                      <input type={showConf?"text":"password"} value={form.confirm}
                        onChange={e=>set("confirm",e.target.value)}
                        className={inp} placeholder="Confirmer le mot de passe" autoComplete="new-password"/>
                      <button type="button" onClick={()=>setShowConf(s=>!s)}
                        className="pr-3 text-gray-400 hover:text-gray-600 transition">
                        {showConf?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}
                      </button>
                    </div>
                    {errors.confirm&&<p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5"/>{errors.confirm}</p>}
                    {form.confirm&&form.confirm===form.password&&!errors.confirm&&(
                      <p className="mt-0.5 text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5"/>Mots de passe identiques</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                    style={{background:`linear-gradient(135deg,${C.primary},${C.light})`}}>
                    {loading
                      ?<><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Création...</>
                      :<>Créer mon compte <ArrowRight className="w-4 h-4"/></>}
                  </button>

                  <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-400"/>
                    Un email d'activation sera envoyé à votre adresse
                  </p>
                </form>

                <p className="text-center text-sm text-gray-500 mt-5">
                  Déjà un compte ?{" "}
                  <Link to="/login" className="font-black hover:underline" style={{color:C.light}}>Se connecter</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}