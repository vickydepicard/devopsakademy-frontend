// src/contexts/AuthContext.jsx
// VERSION CORRIGÉE — 25 mars 2026
// Corrections :
//   - register() ne stocke plus le token (compte inactif jusqu'à vérif email)
//   - login() expose email_not_verified pour que Login.jsx affiche le bon message

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const justLoggedIn = useRef(false)

  // ================= INIT STORAGE =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      } catch {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }

    setLoading(false)
  }, [])

  // ================= LOGOUT =================
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    navigate("/login")
  }, [navigate])

  // ================= CHECK SESSION =================
  useEffect(() => {
    if (!token) return
    if (justLoggedIn.current) {
      justLoggedIn.current = false
      return
    }

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })

        if (!res.ok) throw new Error("Session invalide")

        const data = await res.json()
        if (data?.success) {
          setUser(data.data)
        } else {
          logout()
        }
      } catch (err) {
        console.error("❌ Auth check failed:", err.message)
        logout()
      }
    }

    checkAuth()
  }, [token, logout])

  // ================= LOGIN =================
  const login = async (credentials) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      const data = await res.json()

      if (!res.ok) {
        // ✅ CORRECTIF 3 — on propage email_not_verified et can_resend
        // pour que Login.jsx puisse afficher le bon message + bouton renvoyer
        return {
          success: false,
          message: data?.message || "Email ou mot de passe incorrect",
          email_not_verified: data?.email_not_verified || false,
          can_resend: data?.can_resend || false,
          email: data?.email || credentials.email,
        }
      }

      const loggedUser = data.data.user
      const newToken = data.data.accessToken
      const newRefreshToken = data.data.refreshToken

      justLoggedIn.current = true

      setUser(loggedUser)
      setToken(newToken)

      localStorage.setItem("user", JSON.stringify(loggedUser))
      localStorage.setItem("token", newToken)
      if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken)

      return { success: true, user: loggedUser }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // ================= REGISTER =================
  // ✅ CORRECTIF 1 — register() ne stocke plus le token
  // Le compte est inactif jusqu'à vérification email.
  // On retourne email_verification_required et email_sent.
  const register = async (userData) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Erreur inscription")
      }

      // ✅ Ne PAS stocker le token — le compte n'est pas actif
      // On laisse user et token à null
      // Le Register.jsx affichera l'écran "vérifiez votre email"

      return {
        success: true,
        email_verification_required: data.data?.email_verification_required,
        email_sent: data.data?.email_sent,
        email: userData.email,
        first_name: userData.first_name,
      }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // ================= REFRESH TOKEN =================
  useEffect(() => {
    if (!token) return

    const interval = setInterval(async () => {
      try {
        const storedRefreshToken = localStorage.getItem("refreshToken")
        if (!storedRefreshToken) return

        const res = await fetch("/api/auth/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ refresh_token: storedRefreshToken }),
        })

        if (!res.ok) {
          console.warn("⚠️ Refresh token expiré")
          return
        }

        const data = await res.json()
        if (!data?.data?.accessToken) return

        const newToken = data.data.accessToken
        const newRefresh = data.data.refreshToken

        justLoggedIn.current = true
        setToken(newToken)
        localStorage.setItem("token", newToken)
        if (newRefresh) localStorage.setItem("refreshToken", newRefresh)
      } catch (err) {
        console.warn("⚠️ Refresh token error:", err.message)
      }
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [token, logout])

  // ================= FONCTIONS DE RÔLE =================
  const isAdmin = () => user?.role === "admin" || user?.role === "superadmin"
  const isInstructor = () => user?.role === "instructor"
  const isStudent = () => user?.role === "student"
  const hasRole = (roles) => Array.isArray(roles) ? roles.includes(user?.role) : user?.role === roles
  const isGuest = () => !user || !token

  const updateUser = (updatedData) => {
    const mergedUser = { ...user, ...updatedData }
    setUser(mergedUser)
    localStorage.setItem("user", JSON.stringify(mergedUser))
  }

  const getFullName = () => {
    if (!user) return ""
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
    if (user.name) return user.name
    if (user.email) return user.email.split("@")[0]
    return "Utilisateur"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token,
        isGuest,
        isAdmin,
        isInstructor,
        isStudent,
        hasRole,
        login,
        register,
        logout,
        updateUser,
        getFullName,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}