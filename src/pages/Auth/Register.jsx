import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const Register = () => {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "student"
  })

  const { user, register, loading, error } = useAuth()
  const navigate = useNavigate()

  // 🚨 Si déjà connecté → redirection auto vers dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation basique côté client
    if (userData.password.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    try {
      const response = await register(userData)
      if (response?.success) {
        navigate("/dashboard") // Redirige après succès
      }
    } catch (err) {
      console.error("Erreur inscription:", err)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-700 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-900">Créer un compte</h2>
          <p className="mt-1 text-gray-500 text-sm">
            Inscris-toi pour accéder à nos formations DevOps
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
            type="text"
            name="first_name"
            placeholder="Prénom"
            value={userData.first_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
          />

          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            value={userData.last_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={userData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={userData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
          />

          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
          >
            <option value="student">Étudiant</option>
            <option value="instructor">Instructeur</option>
          </select>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold rounded-md shadow-md transition disabled:opacity-50 text-sm"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        {/* Lien connexion */}
        <p className="text-center text-gray-500 text-sm">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-yellow-500 hover:text-yellow-400 font-semibold"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
