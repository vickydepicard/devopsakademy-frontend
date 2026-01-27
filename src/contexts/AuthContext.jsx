import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // ================= INIT STORAGE =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }

    setLoading(false)
  }, [])

  // ================= CHECK SESSION =================
  useEffect(() => {
    if (!token) return

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  }, [token])

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

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Erreur de connexion")
      }

      const data = await res.json()

      const loggedUser = data.data.user
      const newToken = data.data.accessToken

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

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Erreur inscription")
      }

      const data = await res.json()

      const newUser = data.data.user
      const newToken = data.data.accessToken

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

  // ================= LOGOUT =================
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }, [navigate])

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
        setToken(data.data.accessToken)
        localStorage.setItem("token", data.data.accessToken)
      } catch (err) {
        console.error("❌ Refresh token error:", err.message)
        logout()
      }
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [token, logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
