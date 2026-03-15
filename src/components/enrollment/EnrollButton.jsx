// src/components/enrollment/EnrollButton.jsx
// Gère tous les états : non inscrit, pending, verified, rejected, free
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import PaymentModal from "../../pages/payment/PaymentModal"

export default function EnrollButton({ course, className = "", size = "md", onEnrolled }) {
  const { token, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null) // null = non inscrit
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const isFree = course?.is_free === 1 || Number(course?.price || 0) === 0

  // Charger le statut d'inscription
  useEffect(() => {
    if (!isAuthenticated || !course?.id) { setLoading(false); return }
    fetchStatus()
  }, [course?.id, isAuthenticated])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/enrollments/status/${course.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      const data = await res.json()
      if (data?.success) {
        setStatus(data.data) // null si pas inscrit, sinon { payment_status, is_approved, ... }
      }
    } catch (err) {
      console.error("EnrollButton fetchStatus:", err)
    } finally {
      setLoading(false)
    }
  }

  // Inscription gratuite directe
  const handleFreeEnroll = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ course_id: course.id }),
      })
      const data = await res.json()
      if (res.ok || res.status === 409) {
        await fetchStatus()
        onEnrolled?.()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (!isAuthenticated) { navigate("/login"); return }
    if (isFree) { handleFreeEnroll(); return }
    setShowModal(true)
  }

  const handlePaymentSuccess = async () => {
    await fetchStatus()
    onEnrolled?.()
  }

  // ── Calcul du rendu du bouton ────────────────────────────
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  }
  const sz = sizeClasses[size] || sizeClasses.md

  if (loading) {
    return (
      <button disabled className={`${sz} rounded-full bg-gray-200 text-gray-400 font-semibold cursor-not-allowed ${className}`}>
        ...
      </button>
    )
  }

  // Pas encore inscrit
  if (!status) {
    return (
      <>
        <button
          onClick={handleClick}
          className={`${sz} rounded-full font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 ${
            isFree
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-indigo-700 hover:bg-indigo-800 text-white"
          } ${className}`}
        >
          {isFree ? "✓ S'inscrire gratuitement" : "S'inscrire"}
        </button>

        {showModal && (
          <PaymentModal
            course={course}
            onClose={() => setShowModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </>
    )
  }

  const { payment_status, is_approved } = status

  // Accès validé (free ou vérifié)
  if (payment_status === "free" || payment_status === "verified" || is_approved === 1) {
    return (
      <button
        onClick={() => navigate(`/courses/${course.id}/learn`)}
        className={`${sz} rounded-full font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm hover:shadow-md ${className}`}
      >
        ▶ Accéder au cours
      </button>
    )
  }

  // En attente de validation
  if (payment_status === "pending") {
    return (
      <button
        disabled
        className={`${sz} rounded-full font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-not-allowed ${className}`}
      >
        ⏳ En attente de validation
      </button>
    )
  }

  // Rejeté → permettre de re-soumettre
  if (payment_status === "rejected") {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`${sz} rounded-full font-semibold bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition-all ${className}`}
        >
          ❌ Rejeté — Réessayer
        </button>

        {showModal && (
          <PaymentModal
            course={course}
            onClose={() => setShowModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </>
    )
  }

  // Fallback
  return (
    <button
      onClick={() => setShowModal(true)}
      className={`${sz} rounded-full font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition ${className}`}
    >
      S'inscrire
    </button>
  )
}