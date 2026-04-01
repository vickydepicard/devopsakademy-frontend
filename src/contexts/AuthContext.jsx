// src/contexts/AuthContext.jsx — DevOpsAkademy
// CORRECTION CRITIQUE : page blanche sur /register
// Le bug : {!loading && children} bloquait TOUT le rendu pendant la vérif de session
// Fix : on rend les children immédiatement, le loading est géré par chaque page si besoin

import {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)   // true uniquement le temps de lire localStorage
  const [error,   setError]   = useState("")
  const navigate = useNavigate()
  const justLoggedIn = useRef(false)

  // Écoute déconnexion forcée depuis api.js (refresh token expiré)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null); setToken(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      navigate("/login")
    }
    window.addEventListener("auth:logout", handleForceLogout)
    return () => window.removeEventListener("auth:logout", handleForceLogout)
  }, [navigate])

  // ── Init depuis localStorage — SYNCHRONE → loading passe à false rapidement ──
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      }
    } catch {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    } finally {
      setLoading(false)  // ← on passe à false immédiatement après lecture localStorage
    }
  }, [])

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {})
    } finally {
      setUser(null); setToken(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      navigate("/login")
    }
  }, [navigate])

  // ── Vérification de session en arrière-plan (non bloquante) ─
  useEffect(() => {
    if (!token) return
    if (justLoggedIn.current) { justLoggedIn.current = false; return }

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
        if (!res.ok) { logout(); return }
        const data = await res.json()
        if (data?.success) {
          setUser(data.data)
          localStorage.setItem("user", JSON.stringify(data.data))
        } else {
          logout()
        }
      } catch {
        // En cas d'erreur réseau on ne déconnecte pas — on garde la session locale
      }
    }
    checkAuth()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ───────────────────────────────────────────────────
  const login = async (credentials) => {
    setError("")
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      })
      const data = await res.json()

      if (!res.ok) {
        return {
          success: false,
          message:            data?.message || "Email ou mot de passe incorrect",
          email_not_verified: data?.email_not_verified || false,
          can_resend:         data?.can_resend         || false,
          email:              data?.email              || credentials.email,
        }
      }

      const loggedUser = data.data.user
      const newToken   = data.data.accessToken

      justLoggedIn.current = true
      setUser(loggedUser)
      setToken(newToken)
      localStorage.setItem("user",  JSON.stringify(loggedUser))
      localStorage.setItem("token", newToken)
      // ✅ Pas de refreshToken en localStorage — cookie httpOnly uniquement

      return { success: true, user: loggedUser }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    }
  }

  // ── Register ────────────────────────────────────────────────
  const register = async (userData) => {
    setError("")
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data?.message || "Erreur lors de l'inscription")

      // Compte inactif → PAS de token stocké en localStorage
      // Exception : instructeur → token temporaire pour soumettre la candidature
      return {
        success:                    true,
        email_verification_required: data.data?.email_verification_required,
        email_sent:                 data.email_sent ?? data.data?.email_sent,
        email:                      userData.email,
        first_name:                 userData.first_name,
        message:                    data.message,
        instructor_temp_token:      data.instructor_temp_token || null,
        user_id:                    data.data?.user?.id || null,
      }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    }
  }

  // ── Rafraîchissement automatique toutes les 10 min ──────────
  useEffect(() => {
    if (!token) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        })
        if (!res.ok) { logout(); return }
        const data = await res.json()
        const newToken = data?.data?.accessToken
        if (!newToken) return
        justLoggedIn.current = true
        setToken(newToken)
        localStorage.setItem("token", newToken)
      } catch { /* silencieux */ }
    }, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────
  const isAdmin      = () => user?.role === "admin" || user?.role === "superadmin"
  const isInstructor = () => user?.role === "instructor"
  const isStudent    = () => user?.role === "student"
  const hasRole      = (roles) => Array.isArray(roles) ? roles.includes(user?.role) : user?.role === roles
  const isGuest      = () => !user || !token

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData }
    setUser(merged)
    localStorage.setItem("user", JSON.stringify(merged))
  }

  const getFullName = () => {
    if (!user) return ""
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
    if (user.name)  return user.name
    if (user.email) return user.email.split("@")[0]
    return "Utilisateur"
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      isAuthenticated: !!token && !!user,
      isGuest, isAdmin, isInstructor, isStudent, hasRole,
      login, register, logout, updateUser, getFullName,
    }}>
      {/* ✅ CORRECTION : on rend TOUJOURS les children
          Avant : {!loading && children} → page blanche pendant la vérif de session
          Après : children toujours rendus, chaque composant gère son propre loading */}
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}