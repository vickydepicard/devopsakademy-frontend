import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"

const ProfileContext = createContext()

export const ProfileProvider = ({ children }) => {
  const { user, token, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ utilise token
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur chargement profil")
      setProfile(data.data)
      setError("")
    } catch (err) {
      setProfile(null)
      setError(err.message || "Erreur chargement profil")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user && token) {
      setLoading(true)
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user, token, authLoading])

  return (
    <ProfileContext.Provider value={{ profile, loading, error, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
