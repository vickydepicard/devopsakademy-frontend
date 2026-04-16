// src/pages/payment/PaymentModal.jsx — DevOpsAkademy
// Parcours inscription & paiement 4 étapes
// ✅ Tous les numéros, noms et activation lus depuis .env
import { useState, useRef, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  X, CheckCircle, Upload, FileText, AlertCircle,
  Shield, Loader,
} from "lucide-react"

/* ══════════════════════════════════════════
   CONFIG DEPUIS .ENV — ne jamais hardcoder
   
   Variables à définir dans .env :
   VITE_PAYMENT_ORANGE_ENABLED=true
   VITE_PAYMENT_ORANGE_NUMBER=237691706006
   VITE_PAYMENT_ORANGE_NAME=Hotio Vicky De Picard
   VITE_PAYMENT_MTN_ENABLED=false
   VITE_PAYMENT_MTN_NUMBER=679340490
   VITE_PAYMENT_MTN_NAME=DevOpsAkademy MTN
   VITE_PAYMENT_WAVE_ENABLED=false
   VITE_PAYMENT_WAVE_NUMBER=691706006
   VITE_PAYMENT_WAVE_NAME=DevOpsAkademy Wave
   VITE_PAYMENT_EMAIL=devopseduque@gmail.com
══════════════════════════════════════════ */

const env = import.meta.env

// Formate un numéro brut : 237691706006 → 237 691 706 006
const formatPhone = (raw = "") => {
  const n = String(raw).replace(/\D/g, "")
  if (n.length === 12) return `${n.slice(0,3)} ${n.slice(3,6)} ${n.slice(6,9)} ${n.slice(9)}`
  if (n.length === 9)  return `${n.slice(0,3)} ${n.slice(3,6)} ${n.slice(6)}`
  return n
}

// Construit la liste des méthodes actives depuis .env
const buildMethods = () => {
  const all = [
    {
      id:          "orange_money",
      envKey:      "ORANGE",
      name:        "Orange Money",
      short:       "Orange Money",
      code:        "#150*1#",
      color:       "#FF6900",
      bg:          "#fff7ed",
      border:      "#fed7aa",
      badgeColor:  "#c2410c",
      LogoEl:      () => (
        <div style={{ width:44, height:44, borderRadius:11, background:"#111",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden", padding:3, boxShadow:"0 4px 12px rgba(255,105,0,0.3)" }}>
          <img
            src="https://www.logo.wine/a/logo/Orange_Money/Orange_Money-Logo.wine.svg"
            alt="Orange Money"
            style={{ width:"100%", height:"100%", objectFit:"contain" }}
            onError={e => { e.target.style.display="none"; e.target.parentNode.innerHTML='<span style="color:#FF6900;font-size:20px">🟠</span>' }}
          />
        </div>
      ),
      steps: (num, name) => [
        `Composez #150*1# ou ouvrez l'app Orange Money`,
        `Choisissez « Paiement marchand »`,
        `Entrez le numéro ${num} (${name}) et le montant exact`,
        `Confirmez avec votre code — gardez le SMS de reçu`,
      ],
    },
    {
      id:          "mtn_momo",
      envKey:      "MTN",
      name:        "MTN Mobile Money",
      short:       "MTN MoMo",
      code:        "*126#",
      color:       "#FFCC00",
      bg:          "#fffbeb",
      border:      "#fde68a",
      badgeColor:  "#92400e",
      LogoEl:      () => (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect width="44" height="44" rx="11" fill="#FFCC00"/>
          <rect x="0" y="13" width="44" height="6" fill="#111"/>
          <rect x="0" y="25" width="44" height="6" fill="#111"/>
          <text x="22" y="11" textAnchor="middle" fontSize="9" fontWeight="900" fill="#111" fontFamily="Arial Black,sans-serif">MTN</text>
          <text x="22" y="40" textAnchor="middle" fontSize="8" fontWeight="800" fill="#111" fontFamily="Arial,sans-serif">MoMo</text>
        </svg>
      ),
      steps: (num, name) => [
        `Composez *126# ou ouvrez l'app MTN MoMo`,
        `Choisissez « Transfert » → « Vers compte MoMo »`,
        `Saisissez le numéro ${num} (${name}) et le montant exact`,
        `Validez avec votre PIN — gardez le SMS de confirmation`,
      ],
    },
    {
      id:          "wave",
      envKey:      "WAVE",
      name:        "Wave",
      short:       "Wave",
      code:        "App Wave",
      color:       "#00B2F0",
      bg:          "#ecfeff",
      border:      "#a5f3fc",
      badgeColor:  "#0e7490",
      LogoEl:      () => (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect width="44" height="44" rx="11" fill="#00B2F0"/>
          <ellipse cx="22" cy="27" rx="10" ry="8" fill="#111"/>
          <ellipse cx="22" cy="27" rx="6" ry="5" fill="white"/>
          <ellipse cx="22" cy="17" rx="8" ry="8" fill="#111"/>
          <circle cx="19" cy="15" r="2" fill="white"/>
          <circle cx="25" cy="15" r="2" fill="white"/>
          <circle cx="19.5" cy="15.5" r="1" fill="#111"/>
          <circle cx="25.5" cy="15.5" r="1" fill="#111"/>
          <path d="M20 19 L22 22 L24 19 Z" fill="#FF9900"/>
          <ellipse cx="12" cy="27" rx="3.5" ry="6" fill="#111" transform="rotate(-10 12 27)"/>
          <ellipse cx="32" cy="27" rx="3.5" ry="6" fill="#111" transform="rotate(10 32 27)"/>
          <ellipse cx="18" cy="36" rx="4" ry="2" fill="#FF9900"/>
          <ellipse cx="26" cy="36" rx="4" ry="2" fill="#FF9900"/>
        </svg>
      ),
      steps: (num, name) => [
        `Ouvrez l'application Wave sur votre téléphone`,
        `Appuyez sur « Envoyer » et entrez le numéro ${num} (${name})`,
        `Indiquez le montant exact et ajoutez le titre du cours en note`,
        `Faites une capture d'écran de la confirmation`,
      ],
    },
  ]

  // Filtrer selon .env : enabled=true ET numéro renseigné
  return all.filter(m => {
    const enabled = env[`VITE_PAYMENT_${m.envKey}_ENABLED`] !== "false"
    const number  = env[`VITE_PAYMENT_${m.envKey}_NUMBER`]
    return enabled && number
  }).map(m => ({
    ...m,
    number:      formatPhone(env[`VITE_PAYMENT_${m.envKey}_NUMBER`] || ""),
    rawNumber:   String(env[`VITE_PAYMENT_${m.envKey}_NUMBER`] || ""),
    accountName: String(env[`VITE_PAYMENT_${m.envKey}_NAME`] || "DevOpsAkademy").trim(),
  }))
}

const ACTIVE_METHODS = buildMethods()
const SUPPORT_EMAIL  = env.VITE_PAYMENT_EMAIL || "support@devopsakademy.com"
const STEPS_LABELS   = ["Récapitulatif", "Paiement", "Preuve", "Confirmation"]
const fmtPrice = (p) => Number(p || 0).toLocaleString("fr-FR") + " XAF"
const LEVELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" }

/* ══════════════════════════════════════════
   BARRE D'ÉTAPES
══════════════════════════════════════════ */
function Steps({ current }) {
  return (
    <div className="flex items-center gap-0 px-5 py-3 bg-white border-b border-gray-100">
      {STEPS_LABELS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all
              ${i < current ? "bg-emerald-500 text-white" : i === current ? "text-white" : "bg-gray-100 text-gray-400"}`}
              style={i === current ? { background: "linear-gradient(135deg,#2d287f,#5653e1)" } : {}}>
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-semibold truncate hidden sm:block
              ${i < current ? "text-emerald-600" : i === current ? "text-indigo-700" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < STEPS_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 rounded-full ${i < current ? "bg-emerald-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   CARTE MÉTHODE
══════════════════════════════════════════ */
function MethodCard({ method, selected, onSelect }) {
  const { LogoEl, name, code, bg, border, number, accountName } = method
  return (
    <button onClick={() => onSelect(method)}
      className="relative p-3 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 focus:outline-none w-full"
      style={{
        borderColor: selected ? border : "#e5e7eb",
        background:  selected ? bg : "#fff",
        boxShadow:   selected ? `0 4px 20px ${border}60` : "0 1px 4px rgba(0,0,0,0.04)",
      }}>
      <div className="flex items-center gap-3">
        <LogoEl />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-gray-900 leading-tight">{name}</p>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{code}</p>
          <p className="text-xs font-black text-gray-800 tracking-wider mt-1">{number}</p>
          <p className="text-[10px] text-gray-400 italic">{accountName}</p>
        </div>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  )
}

/* ══════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════ */
export default function PaymentModal({ course, onClose, onSuccess }) {
  const { token } = useAuth()
  const navigate  = useNavigate()
  const [step,    setStep]    = useState(0)
  const [method,  setMethod]  = useState(null)
  const [ref_,    setRef]     = useState("")
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [drag,    setDrag]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [copied,  setCopied]  = useState(false)
  const fileRef = useRef()

  const price    = Number(course?.price || 0)
  const isFree   = course?.is_free === 1 || price === 0
  const priceFmt = fmtPrice(price)

  // Copier le numéro
  const copyNumber = () => {
    if (!method?.rawNumber) return
    navigator.clipboard?.writeText(method.rawNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ─── Étape 0 → 1 ─── */
  const handleRecap = async () => {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ course_id: course.id }),
      })
      const data = await res.json()
      const eid  = data?.data?.enrollment_id || data?.data?.id
      if (res.status === 409) {
        const status = data?.data?.payment_status
        if (status === "pending") { setStep(2); return }
        if (status === "verified" || status === "free" || data?.data?.is_approved) {
          onSuccess?.(); navigate(`/courses/${course.id}/learn`); return
        }
        setStep(isFree ? 3 : 1); return
      }
      if (!res.ok) throw new Error(data?.message || "Erreur lors de l'inscription")
      if (isFree) { setStep(3); return }
      setStep(1)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  /* ─── Upload fichier ─── */
  const handleFile = (f) => {
    if (!f) return
    const ok = ["image/jpeg","image/png","image/jpg","image/webp","application/pdf"]
    if (!ok.includes(f.type)) { setError("Format non supporté. Utilisez JPG, PNG, WEBP ou PDF."); return }
    if (f.size > 10 * 1024 * 1024) { setError("Fichier trop lourd (max 10 Mo)."); return }
    setFile(f); setError("")
    if (f.type.startsWith("image/")) {
      const r = new FileReader()
      r.onload = (e) => setPreview(e.target.result)
      r.readAsDataURL(f)
    } else setPreview("pdf")
  }
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0])
  }, [])

  /* ─── Soumettre preuve ─── */
  const handleSubmit = async () => {
    if (!file) { setError("Veuillez joindre votre preuve de paiement."); return }
    setLoading(true); setError("")
    try {
      const fd = new FormData()
      fd.append("payment_proof", file)
      fd.append("payment_method", method?.id || "")
      fd.append("amount", String(price))
      if (ref_) fd.append("reference", ref_)
      const res  = await fetch(`/api/enrollments/${course.id}/upload-proof`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Erreur lors de l'envoi")
      setStep(3)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  /* ═══════════ RENDU ═══════════ */
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}>
      <div className="w-full sm:max-w-lg bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight:"100dvh", borderRadius:"24px 24px 0 0",
          animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 relative"
          style={{ background:"linear-gradient(135deg,#1e1b4b,#2d287f,#4c1d95)" }}>
          <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-indigo-900">DA</span>
                </div>
                <span className="text-indigo-300 text-xs font-semibold uppercase tracking-widest">
                  Inscription au cours
                </span>
              </div>
              <h2 className="text-white font-black text-base leading-snug line-clamp-2">{course?.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-black" style={{ color:"#facc15" }}>
                  {isFree ? "🎉 Gratuit" : priceFmt}
                </span>
                {!isFree && (
                  <span className="text-indigo-300 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                    Paiement unique · Accès à vie
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="flex-shrink-0 w-9 h-9 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <Steps current={step} />

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* ══ ÉTAPE 0 : Récapitulatif ══ */}
            {step === 0 && (
              <>
                <h3 className="font-black text-gray-900 text-lg">Récapitulatif</h3>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Détails de la commande</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      ["Cours",     course?.title],
                      ["Niveau",    LEVELS[course?.level] || course?.level],
                      course?.duration_hours && ["Durée", `${course.duration_hours} heures`],
                      course?.category_name  && ["Catégorie", course.category_name],
                    ].filter(Boolean).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center px-4 py-2.5 text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-semibold text-gray-800 text-right max-w-[55%] truncate">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-3 bg-indigo-50">
                      <span className="font-black text-gray-900">Total à payer</span>
                      <span className="font-black text-xl" style={{ color:"#2d287f" }}>
                        {isFree ? "🎉 Gratuit" : priceFmt}
                      </span>
                    </div>
                  </div>
                </div>

                {!isFree && (
                  <div className="rounded-2xl p-4 space-y-2.5"
                    style={{ background:"#fffbeb", border:"1px solid #fde68a" }}>
                    <p className="font-bold text-amber-800 text-sm">📋 Processus de paiement</p>
                    {["Choisissez votre moyen de paiement Mobile Money",
                      "Effectuez le virement selon les instructions",
                      "Téléversez la capture ou le PDF de confirmation",
                      "Validation admin sous 24h — accès immédiat après",
                    ].map((t, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5"
                          style={{ background:"#92400e" }}>{i+1}</div>
                        <p className="text-xs text-amber-800">{t}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background:"#ecfdf5", border:"1px solid #a7f3d0" }}>
                  <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Garantie satisfait ou remboursé 30 jours</p>
                    <p className="text-xs text-emerald-600">Aucun risque — {SUPPORT_EMAIL}</p>
                  </div>
                </div>

                {error && <ErrorBox msg={error} />}
                <Btns onBack={onClose} backLabel="Annuler"
                  onNext={handleRecap}
                  nextLabel={isFree ? "🎉 S'inscrire gratuitement" : "Continuer →"}
                  loading={loading} />
              </>
            )}

            {/* ══ ÉTAPE 1 : Choix méthode ══ */}
            {step === 1 && (
              <>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Moyen de paiement</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Montant : <strong style={{ color:"#2d287f" }}>{priceFmt}</strong>
                  </p>
                </div>

                {/* Aucun moyen configuré */}
                {ACTIVE_METHODS.length === 0 && (
                  <div className="rounded-2xl p-5 text-center border border-orange-200 bg-orange-50">
                    <p className="font-bold text-orange-700 text-sm">⚠️ Aucun moyen de paiement activé</p>
                    <p className="text-xs text-orange-600 mt-1">Contactez l'admin : {SUPPORT_EMAIL}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {ACTIVE_METHODS.map(m => (
                    <MethodCard key={m.id} method={m} selected={method?.id === m.id} onSelect={setMethod} />
                  ))}
                </div>

                {/* Détails méthode sélectionnée */}
                {method && (
                  <div className="rounded-2xl overflow-hidden border" style={{ borderColor: method.border }}>
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ background: method.bg, borderBottom:`1px solid ${method.border}` }}>
                      <div className="flex items-center gap-3">
                        <method.LogoEl />
                        <div>
                          <p className="font-black text-gray-900 text-sm">{method.name}</p>
                          <p className="text-xs text-gray-500">{method.code}</p>
                        </div>
                      </div>
                    </div>

                    {/* Numéro + bouton copier */}
                    <div className="px-4 py-4 text-center" style={{ background: method.bg }}>
                      <p className="text-xs text-gray-500 mb-1">Envoyez à ce numéro</p>
                      <p className="font-black text-2xl text-gray-900 tracking-wider">{method.number}</p>
                      <p className="text-sm text-gray-500 italic mt-0.5">{method.accountName}</p>
                      <p className="font-black text-2xl mt-2" style={{ color:"#2d287f" }}>{priceFmt}</p>
                      <button onClick={copyNumber}
                        className="mt-3 px-5 py-2 rounded-xl text-sm font-bold text-white transition"
                        style={{ background: copied ? "linear-gradient(135deg,#059669,#10b981)" : `linear-gradient(135deg,${method.color},${method.color}cc)`,
                          color: method.id==="mtn_momo" ? "#111" : "white" }}>
                        {copied ? "✓ Numéro copié !" : "📋 Copier le numéro"}
                      </button>
                    </div>

                    {/* Étapes */}
                    <div className="px-4 py-3 bg-white space-y-2">
                      {method.steps(method.number, method.accountName).map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5"
                            style={{ background: method.color, color: method.id==="mtn_momo"?"#111":"white" }}>
                            {i+1}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && <ErrorBox msg={error} />}
                <Btns onBack={() => setStep(0)}
                  onNext={() => {
                    if (!method) { setError("Sélectionnez un moyen de paiement."); return }
                    setError(""); setStep(2)
                  }}
                  nextLabel="J'ai payé → Téléverser ma preuve" />
              </>
            )}

            {/* ══ ÉTAPE 2 : Upload preuve ══ */}
            {step === 2 && (
              <>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Preuve de paiement</h3>
                  {method && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {method.short} · <strong style={{ color:"#2d287f" }}>{priceFmt}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Référence de transaction
                    <span className="font-normal text-gray-400 text-xs ml-1">(recommandé)</span>
                  </label>
                  <input type="text" value={ref_} onChange={e => setRef(e.target.value)}
                    placeholder="Ex: TXN-20260305-XXXX"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                    onFocus={e => e.target.style.borderColor="#6366f1"}
                    onBlur={e => e.target.style.borderColor="#e5e7eb"} />
                </div>

                <div onDragOver={e => { e.preventDefault(); setDrag(true) }}
                  onDragLeave={() => setDrag(false)} onDrop={onDrop}
                  onClick={() => !file && fileRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer"
                  style={{ borderColor: drag?"#6366f1":file?"#10b981":"#d1d5db",
                    background: drag?"#eef2ff":file?"#f0fdf4":"#fafafa" }}>
                  <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden" onChange={e => handleFile(e.target.files[0])} />
                  {file ? (
                    <div className="space-y-3">
                      {preview === "pdf"
                        ? <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                            <FileText className="w-8 h-8 text-red-500" />
                          </div>
                        : preview
                          ? <img src={preview} alt="Preuve"
                              className="max-h-44 max-w-full object-contain rounded-xl mx-auto shadow-md border border-gray-200" />
                          : null}
                      <p className="font-bold text-emerald-700 text-sm">✓ {file.name}</p>
                      <p className="text-gray-400 text-xs">{(file.size/1024).toFixed(0)} Ko</p>
                      <button onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                        className="text-indigo-600 text-xs font-semibold underline">
                        Changer le fichier
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Upload className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="font-bold text-gray-700 text-sm">Glissez votre fichier ici</p>
                      <p className="text-gray-400 text-xs">ou cliquez pour parcourir</p>
                      <p className="text-gray-300 text-xs">JPG, PNG, WEBP, PDF · max 10 Mo</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl p-3.5 flex items-start gap-3"
                  style={{ background:"#eff6ff", border:"1px solid #bfdbfe" }}>
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-800 mb-1">Ce que nous vérifions :</p>
                    <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
                      <li>Le montant correspond exactement au prix du cours</li>
                      <li>La date de la transaction est récente</li>
                      <li>Le destinataire est bien DevOpsAkademy</li>
                      <li>Le statut indique « réussi » ou « confirmé »</li>
                    </ul>
                  </div>
                </div>

                {error && <ErrorBox msg={error} />}
                <Btns onBack={() => setStep(isFree ? 0 : 1)}
                  onNext={handleSubmit}
                  nextLabel={<><Upload className="w-4 h-4" /> Soumettre ma preuve</>}
                  nextStyle={{ background: loading?"#6b7280":"linear-gradient(135deg,#059669,#10b981)" }}
                  loading={loading} disabled={!file} />
              </>
            )}

            {/* ══ ÉTAPE 3 : Confirmation ══ */}
            {step === 3 && (
              <div className="text-center space-y-5 py-3">
                <div className="relative mx-auto w-20 h-20">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    {isFree ? "Inscription confirmée !" : "Preuve envoyée !"}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                    {isFree
                      ? "Votre inscription est active. Vous pouvez commencer immédiatement !"
                      : "Votre preuve a bien été reçue. L'admin la vérifiera et activera votre accès sous 24h ouvrées."}
                  </p>
                </div>
                <div className="rounded-2xl p-4 text-left space-y-2 border border-gray-100 bg-gray-50">
                  {[
                    ["Cours",   course?.title],
                    method && ["Paiement", method.short],
                    ["Montant", isFree ? "Gratuit" : priceFmt],
                    ["Statut",  isFree ? "✅ Actif" : "⏳ En cours de validation"],
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-semibold text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
                {!isFree && (
                  <div className="rounded-xl p-3 text-left"
                    style={{ background:"#eff6ff", border:"1px solid #bfdbfe" }}>
                    <p className="text-xs font-bold text-blue-800 mb-1.5">📧 Prochaines étapes</p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Notification par email dès validation</li>
                      <li>Délai : 24h ouvrées maximum</li>
                      <li>Support : {SUPPORT_EMAIL}</li>
                    </ul>
                  </div>
                )}
                <button onClick={() => { onSuccess?.(); onClose() }}
                  className="w-full py-4 text-white rounded-2xl font-black transition hover:opacity-90 shadow-lg"
                  style={{ background:"linear-gradient(135deg,#2d287f,#5653e1)" }}>
                  {isFree ? "▶ Commencer le cours maintenant" : "Retour au catalogue"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(40px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 rounded-xl p-3"
      style={{ background:"#fef2f2", border:"1px solid #fecaca" }}>
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-red-600 text-sm">{msg}</p>
    </div>
  )
}

function Btns({ onBack, backLabel="← Retour", onNext, nextLabel, nextStyle={}, loading, disabled }) {
  return (
    <div className="flex gap-3 pt-1">
      <button onClick={onBack}
        className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition font-semibold text-sm">
        {backLabel}
      </button>
      <button onClick={onNext} disabled={loading || disabled}
        className="flex-[2] py-3 text-white rounded-2xl font-black text-sm transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background:"linear-gradient(135deg,#2d287f,#5653e1)", ...nextStyle }}>
        {loading ? <><Loader className="w-4 h-4 animate-spin" /> Chargement...</> : nextLabel}
      </button>
    </div>
  )
}