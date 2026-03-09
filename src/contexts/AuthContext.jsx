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

  // ✅ Flag pour savoir si le token vient d'un login (pas du storage)
  // → évite que checkAuth efface un token qu'on vient de créer
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

  // ================= LOGOUT (défini avant checkAuth) =================
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }, [navigate])

  // ================= CHECK SESSION =================
  // Ne se déclenche QUE sur le token venu du storage (pas après un login)
  useEffect(() => {
    if (!token) return
    if (justLoggedIn.current) {
      // Token vient d'un login → pas besoin de re-vérifier
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

      // ✅ Lire le JSON même en cas d'erreur pour avoir le vrai message
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Email ou mot de passe incorrect")
      }

      const loggedUser = data.data.user
      const newToken = data.data.accessToken

      // ✅ Marquer qu'on vient de se connecter → checkAuth ne s'exécutera pas
      justLoggedIn.current = true

      setUser(loggedUser)
      setToken(newToken)

      localStorage.setItem("user", JSON.stringify(loggedUser))
      localStorage.setItem("token", newToken)

      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // ================= REGISTER =================
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

      const newUser = data.data.user
      const newToken = data.data.accessToken

      // ✅ Même chose pour le register
      justLoggedIn.current = true

      setUser(newUser)
      setToken(newToken)

      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.setItem("token", newToken)

      return { success: true }
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
        const res = await fetch("/api/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        })

        if (!res.ok) throw new Error("Refresh failed")

        const data = await res.json()
        const newToken = data.data.accessToken

        // ✅ Ne pas déclencher checkAuth sur le nouveau token
        justLoggedIn.current = true

        setToken(newToken)
        localStorage.setItem("token", newToken)
      } catch (err) {
        console.error("❌ Refresh token error:", err.message)
        logout()
      }
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [token, logout])

  // ================= FONCTIONS DE RÔLE =================
  const isAdmin = () => {
    if (!user?.role) return false
    return user.role === "admin" || user.role === "superadmin"
  }

  const isInstructor = () => {
    if (!user?.role) return false
    return user.role === "instructor"
  }

  const isStudent = () => {
    if (!user) return false
    return user.role === "student"
  }

  const hasRole = (roles) => {
    if (!user?.role) return false
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles
  }

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
        // États
        user,
        token,
        loading,
        error,

        // Authentification
        isAuthenticated: !!token,
        isGuest,

        // Rôles
        isAdmin,
        isInstructor,
        isStudent,
        hasRole,

        // Actions
        login,
        register,
        logout,
        updateUser,

        // Utilitaires
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
