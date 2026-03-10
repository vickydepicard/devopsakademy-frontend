import { useState } from "react"
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
  const [localError, setLocalError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setLocalError("")
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")

    if (userData.password.length < 8) {
      setLocalError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await register(userData)

      if (response?.success) {
        // ✅ Redirection vers /login avec email et mot de passe pré-remplis
        navigate("/login", {
          state: {
            email: userData.email,
            password: userData.password,
            message: "Compte créé avec succès ! Connectez-vous."
          },
          replace: true  // empêche le retour arrière vers Register
        })
      } else {
        setLocalError(response?.message || "Une erreur est survenue")
      }
    } catch (err) {
      setLocalError(err?.response?.data?.message || "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
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

        {/* Erreur */}
        {localError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
            {localError}
          </div>
        )}

        {/* Formulaire */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <input
              type="text"
              name="first_name"
              placeholder="Prénom"
              value={userData.first_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Nom"
              value={userData.last_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Adresse email"
            value={userData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe (8 caractères min.)"
            value={userData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
          />

          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm text-gray-700"
          >
            <option value="student">👨‍🎓 Étudiant</option>
            <option value="instructor">👨‍🏫 Instructeur</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold rounded-md shadow-md transition disabled:opacity-50 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Inscription en cours…
              </span>
            ) : "Créer mon compte"}
          </button>
        </form>

        {/* Lien login */}
        <p className="text-center text-gray-500 text-sm">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register