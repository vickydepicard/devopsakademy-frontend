import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  })

  const { user, login, loading, error } = useAuth()
  const navigate = useNavigate()

  // 🚨 Si déjà connecté → redirection automatique vers dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation rapide côté client
    if (!credentials.email || !credentials.password) {
      alert("Veuillez remplir tous les champs")
      return
    }

    try {
      const response = await login(credentials)
      if (response?.success) {
        navigate("/dashboard")
      }
    } catch (err) {
      console.error("Login error:", err)
    }
  }

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-700 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-900">Connexion</h2>
          <p className="mt-1 text-gray-500 text-sm">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        {/* Message d’erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
            {typeof error === "string" ? error : "Une erreur est survenue"}
          </div>
        )}

        {/* Formulaire */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 transition text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 transition text-sm"
          />

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold rounded-md shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50 text-sm"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Lien inscription */}
        <p className="text-center text-gray-500 text-sm">
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="text-yellow-500 hover:text-yellow-400 font-semibold"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
