// src/pages/Auth/VerifyEmail.jsx — DevOpsAkademy
// CORRECTION CIBLÉE du bug "Lien invalide" alors que le compte est activé
//
// Problème :
//   Backend renvoyait success:false si is_active=TRUE (SQL cherchait is_active=FALSE)
//   Frontend affichait "Lien invalide" car il recevait success:false
//
// Fix backend : SQL sans contrainte is_active → gère 4 cas distincts
// Fix frontend : gère already_active:true (affiche succès), expired:true (lien expiré)

import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Loader, Mail, Clock, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" }

export default function VerifyEmail() {
  const { t, i18n } = useTranslation("auth")
  const lang = (i18n.resolvedLanguage || "fr").slice(0, 2)
  const { token }  = useParams()
  const navigate   = useNavigate()

  // status : "loading" | "success" | "already_active" | "expired" | "error"
  const [status,      setStatus]      = useState("loading")
  const [message,     setMessage]     = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resending,   setResending]   = useState(false)
  const [resendOk,    setResendOk]    = useState(false)
  const [countdown,   setCountdown]   = useState(5)

  // ── Appel API au montage ──────────────────────────────────
  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage(t("verify.missing"))
      return
    }

    const verify = async () => {
      try {
        const res  = await fetch(`/api/auth/verify-email/${token}`, { headers: { "Accept-Language": lang } })
        const data = await res.json()

        if (data.success) {
          if (data.already_active) {
            // Compte déjà activé → on affiche un succès clair
            setStatus("already_active")
            setMessage(data.message || t("verify.alreadyActiveMsg"))
          } else {
            // Activation fraîche réussie
            setStatus("success")
            setMessage(data.message || t("verify.successMsg"))
          }
        } else {
          if (data.expired) {
            setStatus("expired")
            setMessage(data.message || t("verify.expiredMsg"))
          } else {
            setStatus("error")
            setMessage(data.message || t("verify.invalidMsg"))
          }
        }
      } catch {
        setStatus("error")
        setMessage(t("verify.networkError"))
      }
    }

    verify()
  }, [token])

  // ── Compte à rebours pour redirection auto (succès uniquement) ──
  useEffect(() => {
    if (status !== "success" && status !== "already_active") return

    const t = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) {
          clearInterval(t)
          navigate("/login", {
            state: { notice: "accountActivated" }
          })
          return 0
        }
        return p - 1
      })
    }, 1000)

    return () => clearInterval(t)
  }, [status, navigate])

  // ── Renvoi email (cas lien expiré) ───────────────────────
  const handleResend = async () => {
    if (!resendEmail || !resendEmail.includes("@")) return
    setResending(true)
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept-Language": lang },
        body: JSON.stringify({ email: resendEmail, language: lang }),
      })
      setResendOk(true)
    } catch { /* silencieux */ } finally {
      setResending(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg,#1e1b4b,#2d287f,#4c1d95)" }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
        style={{ animation: "slideUp 0.4s ease" }}
      >

        {/* ── CHARGEMENT ── */}
        {status === "loading" && (
          <>
            <Loader className="w-14 h-14 animate-spin mx-auto mb-5" style={{ color: C.light }} />
            <h2 className="text-xl font-black text-gray-900">{t("verify.loadingTitle")}</h2>
            <p className="text-gray-500 text-sm mt-2">{t("verify.loadingText")}</p>
          </>
        )}

        {/* ── SUCCÈS (activation fraîche) ── */}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t("verify.successTitle")}</h2>
            <p className="text-gray-500 text-sm mb-2">{message}</p>
            <p className="text-gray-400 text-xs mb-6 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {t("verify.redirectIn")} <span className="font-black text-indigo-600 tabular-nums mx-1">{countdown}s</span>
            </p>
            <Link
              to="/login"
              state={{ notice: "accountActivated" }}
              className="block w-full py-3.5 rounded-xl font-black text-white text-sm hover:opacity-90 transition"
              style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}
            >
              {t("verify.loginNow")}
            </Link>
          </>
        )}

        {/* ── DÉJÀ ACTIVÉ (re-clic sur le lien) ── */}
        {status === "already_active" && (
          <>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-blue-500" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ background: "#dbeafe", color: "#1d4ed8" }}>
              <CheckCircle className="w-3.5 h-3.5" /> {t("verify.alreadyBadge")}
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t("verify.alreadyTitle")}</h2>
            <p className="text-gray-500 text-sm mb-2">{message}</p>
            <p className="text-gray-400 text-xs mb-6 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {t("verify.redirectIn")} <span className="font-black text-indigo-600 tabular-nums mx-1">{countdown}s</span>
            </p>
            <Link
              to="/login"
              state={{ notice: "accountActive" }}
              className="block w-full py-3.5 rounded-xl font-black text-white text-sm hover:opacity-90 transition"
              style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}
            >
              {t("verify.login")}
            </Link>
          </>
        )}

        {/* ── LIEN EXPIRÉ ── */}
        {status === "expired" && (
          <>
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ background: "#fef3c7", color: "#92400e" }}>
              <Clock className="w-3.5 h-3.5" /> {t("verify.expiredBadge")}
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t("verify.expiredTitle")}</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>

            {/* Formulaire renvoi */}
            {resendOk ? (
              <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-center gap-2"
                style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <p className="text-emerald-700 text-sm font-semibold">{t("verify.resent")}</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  placeholder={t("verify.emailPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm"
                />
                <button
                  onClick={handleResend}
                  disabled={resending || !resendEmail.includes("@")}
                  className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition"
                  style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}
                >
                  {resending
                    ? <Loader className="w-4 h-4 animate-spin" />
                    : <RefreshCw className="w-4 h-4" />
                  }
                  {resending ? t("verify.sending") : t("verify.resend")}
                </button>
              </div>
            )}

            <Link to="/login"
              className="block w-full py-3 rounded-xl border-2 font-bold text-sm text-center transition hover:bg-gray-50"
              style={{ borderColor: C.light, color: C.light }}>
              {t("verify.backToLogin")}
            </Link>
          </>
        )}

        {/* ── ERREUR (lien vraiment invalide) ── */}
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ background: "#fee2e2", color: "#991b1b" }}>
              <XCircle className="w-3.5 h-3.5" /> {t("verify.invalidBadge")}
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t("verify.invalidTitle")}</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black text-white text-sm hover:opacity-90 transition"
                style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}
              >
                {t("verify.login")}
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 font-bold text-sm transition hover:bg-gray-50"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
              >
                <Mail className="w-4 h-4" /> {t("verify.createAccount")}
              </Link>
            </div>
          </>
        )}

      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}