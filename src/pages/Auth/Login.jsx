import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const Login = () => {
  const location = useLocation()
  const navigate  = useNavigate()
  const { login, loading } = useAuth()

  // ✅ Récupère les données pré-remplies envoyées depuis Register
  const prefill = location.state || {}

  const [credentials, setCredentials] = useState({
    email:    prefill.email    || "",
    password: prefill.password || "",
  })
  const [localError,   setLocalError]   = useState("")
  const [successMsg,   setSuccessMsg]   = useState(prefill.message || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Nettoyer le state pour éviter re-remplissage au refresh
  useEffect(() => {
    if (prefill.email) {
      window.history.replaceState({}, document.title)
    }
  }, [])

  const handleChange = (e) => {
    setLocalError("")
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")
    setSuccessMsg("")

    if (!credentials.email || !credentials.password) {
      setLocalError("Veuillez remplir tous les champs")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await login(credentials)
      if (response?.success) {
        navigate("/student", { replace: true })
      } else {
        setLocalError(response?.message || "Email ou mot de passe incorrect")
      }
    } catch (err) {
      setLocalError(err?.response?.data?.message || "Email ou mot de passe incorrect")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-700 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-900">Connexion</h2>
          <p className="mt-1 text-gray-500 text-sm">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        {/* ✅ Message succès depuis Register */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 px-3 py-2.5 rounded-md text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            {successMsg}
          </div>
        )}

        {/* Erreur */}
        {localError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2.5 rounded-md text-sm">
            {localError}
          </div>
        )}

        {/* Formulaire */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse email</label>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={credentials.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-yellow-500 transition">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold rounded-md shadow-md transition disabled:opacity-50 text-sm"
          >
            {isSubmitting || loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Connexion…
              </span>
            ) : "Se connecter"}
          </button>
        </form>

        {/* Lien inscription */}
        <p className="text-center text-gray-500 text-sm">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-yellow-500 hover:text-yellow-400 font-semibold">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login