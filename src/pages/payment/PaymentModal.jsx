// src/components/payment/PaymentModal.jsx
import { useState, useRef, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"

const PAYMENT_METHODS = [
  {
    id: "orange_money",
    label: "Orange Money",
    icon: "🟠",
    color: "from-orange-500 to-orange-600",
    border: "border-orange-400",
    instructions: "Envoyez le montant au **237 6XX XXX XXX** (Orange Money DevOpsAkademy). Notez la référence de transaction.",
    fields: ["reference"],
  },
  {
    id: "mtn_momo",
    label: "MTN Mobile Money",
    icon: "🟡",
    color: "from-yellow-400 to-yellow-500",
    border: "border-yellow-400",
    instructions: "Envoyez le montant au **237 6XX XXX XXX** (MTN MoMo DevOpsAkademy). Conservez votre reçu.",
    fields: ["reference"],
  },
  {
    id: "virement",
    label: "Virement bancaire",
    icon: "🏦",
    color: "from-blue-600 to-blue-700",
    border: "border-blue-400",
    instructions: "IBAN : **FR76 XXXX XXXX XXXX XXXX** — BIC : XXXXFRPP — Mention : votre email + titre du cours.",
    fields: ["reference"],
  },
  {
    id: "wave",
    label: "Wave",
    icon: "🌊",
    color: "from-teal-500 to-teal-600",
    border: "border-teal-400",
    instructions: "Envoyez le montant via Wave au **+237 6XX XXX XXX**. Prenez une capture de la confirmation.",
    fields: ["reference"],
  },
]

const STEPS = ["Récapitulatif", "Paiement", "Preuve", "Confirmation"]

export default function PaymentModal({ course, onClose, onSuccess }) {
  const { token } = useAuth()
  const [step, setStep] = useState(0)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [reference, setReference] = useState("")
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [enrollmentId, setEnrollmentId] = useState(null)
  const fileRef = useRef()

  const price = Number(course?.price || 0)
  const currency = "XAF"
  const priceFormatted = price.toLocaleString("fr-FR") + " " + currency

  // ── Étape 0 : Récapitulatif → créer enrollment ──────────
  const handleConfirmRecap = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ course_id: course.id }),
      })
      const data = await res.json()
      if (!res.ok && res.status !== 409)
        throw new Error(data?.message || "Erreur lors de l'inscription")

      // Si déjà inscrit ou nouveau → récupérer l'enrollmentId
      const eid = data?.data?.enrollment_id || data?.data?.id
      setEnrollmentId(eid)
      setStep(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Étape 1 : Choix méthode ──────────────────────────────
  const handleSelectMethod = (method) => {
    setSelectedMethod(method)
    setError("")
  }

  // ── Étape 2 : Upload preuve ──────────────────────────────
  const handleFile = (file) => {
    if (!file) return
    const allowed = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowed.includes(file.type)) {
      setError("Format non accepté. JPG, PNG ou PDF uniquement.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Fichier trop lourd (max 5 Mo).")
      return
    }
    setProofFile(file)
    setError("")
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setProofPreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setProofPreview("pdf")
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  // ── Étape 2 → 3 : Soumettre paiement ────────────────────
  const handleSubmitPayment = async () => {
    if (!proofFile) {
      setError("Veuillez joindre votre preuve de paiement.")
      return
    }
    setLoading(true)
    setError("")
    try {
      // Upload du fichier → base64 pour demo (en prod : FormData vers S3/cloudinary)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const proof_url = e.target.result // En prod : URL après upload S3

        const res = await fetch(`/api/enrollments/${enrollmentId}/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          credentials: "include",
          body: JSON.stringify({
            amount: price,
            payment_method: selectedMethod.id,
            reference: reference || null,
            proof_url: proofFile.name, // En prod : URL S3
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Erreur soumission paiement")
        setStep(3)
        setLoading(false)
      }
      reader.readAsDataURL(proofFile)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDone = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-800 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider">Inscription au cours</p>
            <h2 className="text-white font-bold text-lg leading-tight mt-0.5">{course?.title}</h2>
          </div>
          <button onClick={onClose} className="text-indigo-300 hover:text-white transition text-2xl leading-none">&times;</button>
        </div>

        {/* Steps indicator */}
        <div className="flex border-b border-gray-100">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 py-3 text-center text-xs font-semibold transition-all ${
              i === step ? "text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50"
              : i < step ? "text-green-600" : "text-gray-400"
            }`}>
              {i < step ? "✓ " : `${i + 1}. `}{s}
            </div>
          ))}
        </div>

        <div className="p-6">

          {/* ──── ÉTAPE 0 : Récapitulatif ─────────────────── */}
          {step === 0 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800">Récapitulatif de commande</h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cours</span>
                  <span className="font-semibold text-gray-800 text-right max-w-xs">{course?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Niveau</span>
                  <span className="capitalize text-gray-700">{course?.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Durée</span>
                  <span className="text-gray-700">{course?.duration_hours ? `${course.duration_hours}h` : "—"}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">Total à payer</span>
                  <span className="font-bold text-2xl text-indigo-700">{priceFormatted}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <p className="font-semibold mb-1">📋 Comment ça marche ?</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Choisissez votre moyen de paiement</li>
                  <li>Effectuez le virement/paiement</li>
                  <li>Téléversez votre preuve de paiement</li>
                  <li>L'admin valide sous 24h — vous recevez l'accès</li>
                </ol>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
                  Annuler
                </button>
                <button
                  onClick={handleConfirmRecap}
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-semibold transition text-sm disabled:opacity-60"
                >
                  {loading ? "Chargement..." : "Continuer vers le paiement →"}
                </button>
              </div>
            </div>
          )}

          {/* ──── ÉTAPE 1 : Choix méthode ─────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Choisissez votre moyen de paiement</h3>
                <p className="text-sm text-gray-500 mt-1">Montant à payer : <span className="font-bold text-indigo-700">{priceFormatted}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedMethod?.id === method.id
                        ? `${method.border} bg-indigo-50 shadow-md scale-[1.02]`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="font-semibold text-sm text-gray-800">{method.label}</div>
                    {selectedMethod?.id === method.id && (
                      <div className="text-indigo-600 text-xs mt-1 font-medium">✓ Sélectionné</div>
                    )}
                  </button>
                ))}
              </div>

              {selectedMethod && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-indigo-800 mb-1">Instructions {selectedMethod.label}</p>
                  <p className="text-xs text-indigo-700 leading-relaxed whitespace-pre-line">
                    {selectedMethod.instructions.replace(/\*\*(.*?)\*\*/g, "$1")}
                  </p>
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    if (!selectedMethod) { setError("Sélectionnez un moyen de paiement"); return }
                    setError(""); setStep(2)
                  }}
                  className="flex-1 py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-semibold transition text-sm"
                >
                  Téléverser ma preuve →
                </button>
              </div>
            </div>
          )}

          {/* ──── ÉTAPE 2 : Upload preuve ─────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Téléversez votre preuve de paiement</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedMethod?.icon} {selectedMethod?.label} — <span className="font-semibold text-indigo-700">{priceFormatted}</span>
                </p>
              </div>

              {/* Référence transaction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence de transaction <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: TXN-20260305-XXXX"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Zone drag & drop */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver ? "border-indigo-500 bg-indigo-50"
                  : proofFile ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {proofFile ? (
                  <div className="space-y-2">
                    {proofPreview === "pdf" ? (
                      <div className="text-4xl">📄</div>
                    ) : (
                      <img src={proofPreview} alt="Preuve" className="w-full max-h-40 object-contain rounded-lg" />
                    )}
                    <p className="text-green-700 font-semibold text-sm">✓ {proofFile.name}</p>
                    <p className="text-gray-400 text-xs">Cliquez pour changer</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl">📎</div>
                    <p className="text-gray-600 font-medium text-sm">Glissez votre fichier ici ou cliquez</p>
                    <p className="text-gray-400 text-xs">JPG, PNG, PDF — max 5 Mo</p>
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
                  ← Retour
                </button>
                <button
                  onClick={handleSubmitPayment}
                  disabled={loading || !proofFile}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition text-sm disabled:opacity-60"
                >
                  {loading ? "Envoi en cours..." : "Soumettre le paiement ✓"}
                </button>
              </div>
            </div>
          )}

          {/* ──── ÉTAPE 3 : Confirmation ──────────────────── */}
          {step === 3 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">✅</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Paiement soumis !</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  Votre preuve de paiement a été envoyée avec succès.<br />
                  L'administrateur validera votre accès <strong>sous 24h</strong>.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cours</span>
                  <span className="font-medium text-gray-800">{course?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Moyen de paiement</span>
                  <span className="font-medium">{selectedMethod?.icon} {selectedMethod?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-bold text-indigo-700">{priceFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut</span>
                  <span className="text-yellow-600 font-semibold bg-yellow-50 px-2 py-0.5 rounded-full text-xs">⏳ En attente de validation</span>
                </div>
              </div>

              <p className="text-xs text-gray-400">Vous recevrez une notification dès que votre paiement sera validé.</p>

              <button
                onClick={handleDone}
                className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-semibold transition"
              >
                Retour au catalogue
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
      `}</style>
    </div>
  )
}