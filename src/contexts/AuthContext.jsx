import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()
const API_URL = import.meta.env.VITE_API_URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // ================= Charger user + token depuis localStorage =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")
    if (storedUser) setUser(JSON.parse(storedUser))
    if (storedToken) setToken(storedToken)
  }, [])

  // ================= Vérifier session =================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        })
        const data = await res.json()
        if (res.ok && data.success) {
          setUser(data.data)
        } else {
          logout()
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        logout()
      }
    }
    if (token) {
      initAuth()
    }
  }, [token])

  // ================= LOGIN =================
  const login = async (credentials) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur login")

      const loggedUser = data.data.user
      const newToken = data.data.accessToken

      setUser(loggedUser)
      setToken(newToken)

      localStorage.setItem("user", JSON.stringify(loggedUser))
      localStorage.setItem("token", newToken)

      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  // ================= REGISTER =================
  const register = async (userData) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur inscription")

      const newUser = data.data.user
      const newToken = data.data.accessToken

      setUser(newUser)
      setToken(newToken)

      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.setItem("token", newToken)

      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
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

  // ================= Auto-refresh token =================
  useEffect(() => {
    let interval
    if (user) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
          })
          const data = await res.json()
          if (res.ok && data.success) {
            setToken(data.data.accessToken)
            localStorage.setItem("token", data.data.accessToken)
          } else {
            logout()
          }
        } catch (err) {
          console.error("Refresh token error:", err)
          logout()
        }
      }, 10 * 60 * 1000)
    }
    return () => clearInterval(interval)
  }, [user, logout])

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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
