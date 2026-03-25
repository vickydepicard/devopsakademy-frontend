// src/pages/Auth/VerifyEmail.jsx
// Page d'activation du compte après clic sur le lien email
import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Loader, Mail } from "lucide-react"

export default function VerifyEmail() {
  const { token }  = useParams()
  const navigate   = useNavigate()
  const [status, setStatus] = useState("loading") // loading | success | error
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Token manquant"); return }
    const verify = async () => {
      try {
        const res  = await fetch(`/api/auth/verify-email/${token}`)
        const data = await res.json()
        if (data.success) {
          setStatus("success")
          setMessage(data.message)
          // Redirection vers login après 3s
          setTimeout(() => navigate("/login", {
            state: { message: "✅ Compte activé ! Connectez-vous maintenant." }
          }), 3000)
        } else {
          setStatus("error")
          setMessage(data.message || "Lien invalide ou expiré.")
        }
      } catch {
        setStatus("error")
        setMessage("Erreur de connexion au serveur.")
      }
    }
    verify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg,#1e1b4b,#2d287f,#4c1d95)" }}>
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
        style={{ animation: "slideUp 0.4s ease" }}>

        {status === "loading" && (
          <>
            <Loader className="w-14 h-14 animate-spin mx-auto mb-5" style={{ color: "#5653e1" }} />
            <h2 className="text-xl font-black text-gray-900">Vérification en cours...</h2>
            <p className="text-gray-500 text-sm mt-2">Activation de votre compte</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Compte activé ! 🎉</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <p className="text-gray-400 text-xs mb-4">Redirection automatique dans 3 secondes...</p>
            <Link to="/login"
              className="block w-full py-3.5 rounded-xl font-black text-white text-sm hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
              → Se connecter maintenant
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Lien invalide</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <div className="space-y-3">
              <Link to="/register"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                <Mail className="w-4 h-4" /> Créer un nouveau compte
              </Link>
              <Link to="/login"
                className="block w-full py-3 rounded-xl border-2 font-bold text-sm text-center"
                style={{ borderColor: "#5653e1", color: "#5653e1" }}>
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}