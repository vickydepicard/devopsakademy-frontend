// src/contexts/ProfileContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"

const ProfileContext = createContext(null)

export const ProfileProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth()
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [saving, setSaving]     = useState(false)

  // ── Charger le profil ──────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      // ✅ Vérifier que c'est bien du JSON avant de parser
      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        throw new Error(`Route /api/profile introuvable (réponse: ${res.status})`)
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors du chargement du profil")
      }

      if (data?.success) {
        setProfile(data.data)
      } else {
        throw new Error(data?.message || "Erreur profil")
      }
    } catch (err) {
      console.error("❌ ProfileContext fetchProfile:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  // ── Mettre à jour le profil ────────────────────────────────
  const updateProfile = async (updates) => {
    if (!token) return { success: false, message: "Non authentifié" }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        throw new Error(`Route /api/profile introuvable (réponse: ${res.status})`)
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de la mise à jour")
      }

      if (data?.success) {
        setProfile(prev => ({ ...prev, ...data.data }))
        return { success: true }
      } else {
        throw new Error(data?.message || "Erreur mise à jour")
      }
    } catch (err) {
      console.error("❌ ProfileContext updateProfile:", err.message)
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setSaving(false)
    }
  }

  // ── Charger au montage si connecté ────────────────────────
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProfile()
    } else {
      setProfile(null)
      setError(null)
    }
  }, [isAuthenticated, token, fetchProfile])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        saving,
        fetchProfile,
        updateProfile,
        setProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}

export default ProfileContext