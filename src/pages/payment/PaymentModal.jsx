// src/pages/payment/PaymentModal.jsx — DevOpsAkademy
// Parcours inscription & paiement 4 étapes — 100% fonctionnel
import { useState, useRef, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  X, CheckCircle, Upload, FileText, AlertCircle,
  Clock, Shield, Loader, ChevronRight, Smartphone,
  ArrowRight, RefreshCw
} from "lucide-react"

/* ══════════════════════════════════════════
   CONFIG MOYENS DE PAIEMENT
══════════════════════════════════════════ */
const METHODS = [
  {
    id: "mtn_momo",
    name: "MTN Mobile Money",
    short: "MTN MoMo",
    emoji: "🟡",
    // Logo SVG inline pour fiabilité maximale
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/MTN_Logo.svg/120px-MTN_Logo.svg.png",
    color: "#FFCC00",
    bg: "#fffbeb",
    border: "#fcd34d",
    number: "+237 6XX XXX XXX",
    code: "*126#",
    steps: [
      "Composez *126# ou ouvrez l'app MTN MoMo",
      "Choisissez « Transfert » → « Vers compte MoMo »",
      `Saisissez le numéro DevOpsAkademy et le montant exact`,
      "Validez avec votre PIN — gardez le SMS de confirmation",
    ],
  },
  {
    id: "orange_money",
    name: "Orange Money",
    short: "Orange Money",
    emoji: "🟠",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/120px-Orange_logo.svg.png",
    color: "#FF7900",
    bg: "#fff7ed",
    border: "#fb923c",
    number: "+237 6XX XXX XXX",
    code: "#150#",
    steps: [
      "Composez #150# ou ouvrez l'app Orange Money",
      "Choisissez « Paiement marchand »",
      "Entrez le numéro DevOpsAkademy et le montant exact",
      "Confirmez avec votre code — gardez le SMS de reçu",
    ],
  },
  {
    id: "wave",
    name: "Wave",
    short: "Wave",
    emoji: "🌊",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wave_logo.svg/120px-Wave_logo.svg.png",
    color: "#1BB9E8",
    bg: "#ecfeff",
    border: "#22d3ee",
    number: "+237 6XX XXX XXX",
    code: "App Wave",
    steps: [
      "Ouvrez l'application Wave sur votre téléphone",
      "Appuyez sur « Envoyer » et entrez le numéro DevOpsAkademy",
      "Indiquez le montant exact et ajoutez le titre du cours en note",
      "Faites une capture d'écran de la confirmation",
    ],
  },
  {
    id: "virement",
    name: "Virement bancaire",
    short: "Virement",
    emoji: "🏦",
    logoUrl: null,
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#60a5fa",
    number: "CM21 XXXX XXXX XXXX",
    code: "IBAN",
    steps: [
      "Connectez-vous à votre banque en ligne",
      "Effectuez un virement vers le compte DevOpsAkademy",
      "Indiquez en référence : votre email + titre du cours",
      "Téléchargez le justificatif de virement (PDF)",
    ],
  },
]

const STEPS_LABELS = ["Récapitulatif", "Paiement", "Preuve", "Confirmation"]

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
              ${i < current
                ? "bg-emerald-500 text-white shadow-sm"
                : i === current
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-400"}`}
              style={i === current ? { background: "linear-gradient(135deg,#2d287f,#5653e1)" } : {}}>
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-semibold truncate hidden sm:block
              ${i < current ? "text-emerald-600"
              : i === current ? "text-indigo-700"
              : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < STEPS_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 rounded-full transition-all
              ${i < current ? "bg-emerald-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   CARTE MÉTHODE DE PAIEMENT
══════════════════════════════════════════ */
function MethodCard({ method, selected, onSelect }) {
  const [logoFailed, setLogoFailed] = useState(false)
  return (
    <button
      onClick={() => onSelect(method)}
      className="relative p-4 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 focus:outline-none"
      style={{
        borderColor: selected ? method.border : "#e5e7eb",
        background: selected ? method.bg : "#fff",
        boxShadow: selected ? `0 4px 20px ${method.border}40` : "0 1px 4px rgba(0,0,0,0.04)",
      }}>
      {/* Logo */}
      <div className="h-9 mb-2.5 flex items-center">
        {method.logoUrl && !logoFailed ? (
          <img
            src={method.logoUrl}
            alt={method.name}
            className="h-8 w-auto max-w-[90px] object-contain"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="text-3xl">{method.emoji}</span>
        )}
      </div>
      <p className="font-bold text-sm text-gray-800 leading-tight">{method.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{method.code}</p>
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
  const navigate = useNavigate()
  const [step,     setStep]     = useState(0)
  const [method,   setMethod]   = useState(null)
  const [ref_,     setRef]      = useState("")
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [drag,     setDrag]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [enrollId, setEnrollId] = useState(null)
  const fileRef = useRef()

  const price   = Number(course?.price || 0)
  const isFree  = course?.is_free === 1 || price === 0
  const priceFmt = fmtPrice(price)

  /* ─── Étape 0 → 1 : Créer inscription ─── */
  const handleRecap = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ course_id: course.id }),
      })
      const data = await res.json()

      // 409 = déjà inscrit → continuer avec l'enrollment existant
      const eid = data?.data?.enrollment_id || data?.data?.id
      if (eid) setEnrollId(eid)

      if (res.status === 409) {
        // Déjà inscrit — continuer selon statut
        const status = data?.data?.payment_status
        if (status === "pending") { setStep(2); return }  // reprendre à l'upload
        if (status === "verified" || status === "free" || data?.data?.is_approved) {
          // Déjà approuvé → aller directement au cours
          onSuccess?.()
          navigate(`/courses/${course.id}/learn`)
          return
        }
        setStep(isFree ? 3 : 1); return
      }

      if (!res.ok) throw new Error(data?.message || "Erreur lors de l'inscription")

      if (isFree) { setStep(3); return }
      setStep(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ─── Upload fichier preuve ─── */
  const handleFile = (f) => {
    if (!f) return
    const ok = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"]
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

  /* ─── Étape 2 → 3 : Soumettre preuve ─── */
  const handleSubmit = async () => {
    if (!file) { setError("Veuillez joindre votre preuve de paiement."); return }
    setLoading(true); setError("")
    try {
      const fd = new FormData()
      fd.append("payment_proof", file)
      fd.append("payment_method", method?.id || "")
      fd.append("amount", String(price))
      if (ref_) fd.append("reference", ref_)

      const res = await fetch(`/api/enrollments/${course.id}/upload-proof`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Erreur lors de l'envoi")
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDone = () => {
    onSuccess?.()
    onClose()
  }

  /* ═══════════ RENDU ═══════════ */
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}>

      <div className="w-full sm:max-w-lg bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "100dvh",
          borderRadius: "24px 24px 0 0",
          animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)"
        }}>

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 relative"
          style={{ background: "linear-gradient(135deg,#1e1b4b,#2d287f,#4c1d95)" }}>
          {/* Drag handle mobile */}
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
              <h2 className="text-white font-black text-base leading-snug line-clamp-2">
                {course?.title}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-black" style={{ color: "#facc15" }}>
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

        {/* Steps */}
        <Steps current={step} />

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* ══════ ÉTAPE 0 : Récapitulatif ══════ */}
            {step === 0 && (
              <>
                <h3 className="font-black text-gray-900 text-lg">Récapitulatif</h3>

                {/* Détails cours */}
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Détails de la commande</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      ["Cours", course?.title],
                      ["Niveau", LEVELS[course?.level] || course?.level],
                      course?.duration_hours && ["Durée", `${course.duration_hours} heures`],
                      course?.category_name && ["Catégorie", course.category_name],
                    ].filter(Boolean).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center px-4 py-2.5 text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-semibold text-gray-800 text-right max-w-[55%] truncate">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-3 bg-indigo-50">
                      <span className="font-black text-gray-900">Total à payer</span>
                      <span className="font-black text-xl" style={{ color: "#2d287f" }}>
                        {isFree ? "🎉 Gratuit" : priceFmt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Process d'inscription */}
                {!isFree && (
                  <div className="rounded-2xl p-4 space-y-2.5"
                    style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                    <p className="font-bold text-amber-800 text-sm flex items-center gap-2">
                      <span>📋</span> Processus de paiement
                    </p>
                    {[
                      ["1", "Choisissez votre moyen de paiement Mobile Money"],
                      ["2", "Effectuez le virement selon les instructions"],
                      ["3", "Téléversez la capture ou le PDF de confirmation"],
                      ["4", "Validation admin sous 24h — accès immédiat après"],
                    ].map(([n, t]) => (
                      <div key={n} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5"
                          style={{ background: "#92400e" }}>{n}</div>
                        <p className="text-xs text-amber-800">{t}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Garantie */}
                <div className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                  <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Garantie satisfait ou remboursé 30 jours</p>
                    <p className="text-xs text-emerald-600">Aucun risque — support@devopsakademy.com</p>
                  </div>
                </div>

                {error && <ErrorBox msg={error} />}

                <Btns
                  onBack={onClose} backLabel="Annuler"
                  onNext={handleRecap} nextLabel={isFree ? "🎉 S'inscrire gratuitement" : "Continuer →"}
                  loading={loading}
                />
              </>
            )}

            {/* ══════ ÉTAPE 1 : Choix méthode ══════ */}
            {step === 1 && (
              <>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Moyen de paiement</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Montant : <strong style={{ color: "#2d287f" }}>{priceFmt}</strong>
                  </p>
                </div>

                {/* Grille méthodes */}
                <div className="grid grid-cols-2 gap-3">
                  {METHODS.map((m) => (
                    <MethodCard key={m.id} method={m} selected={method?.id === m.id} onSelect={setMethod} />
                  ))}
                </div>

                {/* Instructions méthode sélectionnée */}
                {method && (
                  <div className="rounded-2xl overflow-hidden border"
                    style={{ borderColor: method.border }}>
                    {/* Header méthode */}
                    <div className="flex items-center gap-3 px-4 py-3"
                      style={{ background: method.bg, borderBottom: `1px solid ${method.border}` }}>
                      <span className="text-2xl">{method.emoji}</span>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.code}</p>
                      </div>
                    </div>

                    {/* Numéro + montant */}
                    <div className="px-4 py-3 text-center"
                      style={{ background: method.bg }}>
                      <p className="text-xs text-gray-500 mb-0.5">Envoyez à ce numéro</p>
                      <p className="font-black text-xl text-gray-900 tracking-wider">{method.number}</p>
                      <p className="font-black text-2xl mt-1" style={{ color: "#2d287f" }}>{priceFmt}</p>
                    </div>

                    {/* Étapes */}
                    <div className="px-4 py-3 bg-white space-y-2">
                      {method.steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5"
                            style={{ background: method.color }}>
                            {i + 1}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && <ErrorBox msg={error} />}

                <Btns
                  onBack={() => setStep(0)}
                  onNext={() => {
                    if (!method) { setError("Sélectionnez un moyen de paiement."); return }
                    setError(""); setStep(2)
                  }}
                  nextLabel="J'ai payé → Téléverser ma preuve"
                />
              </>
            )}

            {/* ══════ ÉTAPE 2 : Upload preuve ══════ */}
            {step === 2 && (
              <>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Preuve de paiement</h3>
                  {method && (
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <span>{method.emoji}</span>
                      {method.short} · <strong style={{ color: "#2d287f" }}>{priceFmt}</strong>
                    </p>
                  )}
                </div>

                {/* Référence */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Référence de transaction
                    <span className="font-normal text-gray-400 text-xs ml-1">(recommandé)</span>
                  </label>
                  <input type="text" value={ref_} onChange={e => setRef(e.target.value)}
                    placeholder="Ex: TXN-20260305-XXXX"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                    style={{ focusBorderColor: "#6366f1" }}
                    onFocus={e => e.target.style.borderColor = "#6366f1"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                </div>

                {/* Zone drag & drop */}
                <div
                  onDragOver={e => { e.preventDefault(); setDrag(true) }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={onDrop}
                  onClick={() => !file && fileRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer"
                  style={{
                    borderColor: drag ? "#6366f1" : file ? "#10b981" : "#d1d5db",
                    background: drag ? "#eef2ff" : file ? "#f0fdf4" : "#fafafa",
                  }}>
                  <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden" onChange={e => handleFile(e.target.files[0])} />

                  {file ? (
                    <div className="space-y-3">
                      {preview === "pdf" ? (
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                          <FileText className="w-8 h-8 text-red-500" />
                        </div>
                      ) : preview ? (
                        <img src={preview} alt="Preuve"
                          className="max-h-44 max-w-full object-contain rounded-xl mx-auto shadow-md border border-gray-200" />
                      ) : null}
                      <p className="font-bold text-emerald-700 text-sm">✓ {file.name}</p>
                      <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(0)} Ko</p>
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
                      <p className="font-bold text-gray-700 text-sm">
                        Glissez votre fichier ici
                      </p>
                      <p className="text-gray-400 text-xs">ou cliquez pour parcourir</p>
                      <p className="text-gray-300 text-xs">JPG, PNG, WEBP, PDF · max 10 Mo</p>
                    </div>
                  )}
                </div>

                {/* Ce qu'on vérifie */}
                <div className="rounded-xl p-3.5 flex items-start gap-3"
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
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

                <Btns
                  onBack={() => setStep(isFree ? 0 : 1)}
                  onNext={handleSubmit}
                  nextLabel={<><Upload className="w-4 h-4" /> Soumettre ma preuve</>}
                  nextStyle={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#059669,#10b981)" }}
                  loading={loading}
                  disabled={!file}
                />
              </>
            )}

            {/* ══════ ÉTAPE 3 : Confirmation ══════ */}
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

                {/* Récap */}
                <div className="rounded-2xl p-4 text-left space-y-2 border border-gray-100 bg-gray-50">
                  {[
                    ["Cours", course?.title],
                    method && ["Paiement", `${method.emoji} ${method.short}`],
                    ["Montant", isFree ? "Gratuit" : priceFmt],
                    ["Statut", isFree ? "✅ Actif" : "⏳ En cours de validation"],
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-semibold text-gray-800 text-right max-w-[55%]">{v}</span>
                    </div>
                  ))}
                </div>

                {!isFree && (
                  <div className="rounded-xl p-3 text-left"
                    style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                    <p className="text-xs font-bold text-blue-800 mb-1.5">📧 Prochaines étapes</p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Notification par email dès validation</li>
                      <li>Délai : 24h ouvrées maximum</li>
                      <li>Support : support@devopsakademy.com</li>
                    </ul>
                  </div>
                )}

                <button onClick={handleDone}
                  className="w-full py-4 text-white rounded-2xl font-black transition hover:opacity-90 shadow-lg"
                  style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
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

/* ── Sous-composants utilitaires ── */
function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 rounded-xl p-3"
      style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-red-600 text-sm">{msg}</p>
    </div>
  )
}

function Btns({ onBack, backLabel = "← Retour", onNext, nextLabel, nextStyle = {}, loading, disabled }) {
  return (
    <div className="flex gap-3 pt-1">
      <button onClick={onBack}
        className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition font-semibold text-sm">
        {backLabel}
      </button>
      <button onClick={onNext} disabled={loading || disabled}
        className="flex-[2] py-3 text-white rounded-2xl font-black text-sm transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)", ...nextStyle }}>
        {loading ? <><Loader className="w-4 h-4 animate-spin" /> Chargement...</> : nextLabel}
      </button>
    </div>
  )
}