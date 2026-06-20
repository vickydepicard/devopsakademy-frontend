// src/pages/Courses/CourseEnroll.jsx
// Page d'inscription à un cours — redirige vers CourseDetails si payant
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { BookOpen, CheckCircle, Loader, AlertCircle, ArrowRight } from "lucide-react";

export default function CourseEnroll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [course,   setCourse]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  // Charger le cours pour vérifier s'il est gratuit ou payant
  useEffect(() => {
    if (!token) { navigate("/login", { state: { from: `/courses/${id}/enroll` } }); return; }
    api.get(`/courses/${id}`)
      .then(r => {
        const data = r.data?.data || r.data;
        setCourse(data);
        const isFree = data?.is_free === 1 || Number(data?.price || 0) === 0;
        // Si payant → rediriger vers la page détail qui gère le modal paiement
        if (!isFree) { navigate(`/courses/${id}`, { replace: true }); }
      })
      .catch(() => setError("Cours introuvable."))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setError("");
    try {
      const res = await api.post("/enrollments", { course_id: Number(id) });
      if (res.data?.success || res.status === 409) {
        setSuccess(true);
        setTimeout(() => navigate(`/courses/${id}/learn`), 2000);
      } else {
        setError(res.data?.message || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (err.response?.status === 409 || msg.toLowerCase().includes("déjà inscrit")) {
        // Déjà inscrit — accéder directement
        navigate(`/courses/${id}/learn`);
        return;
      }
      setError(msg || "Impossible de s'inscrire. Réessayez.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader className="w-8 h-8 text-[#2d287f] animate-spin" />
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 text-center max-w-sm shadow border border-gray-100">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Inscription confirmée !</h2>
        <p className="text-gray-500 text-sm mb-4">Redirection vers le cours…</p>
        <div className="w-8 h-8 border-4 border-[#2d287f] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow border border-gray-100">

        {/* Icône */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
          <BookOpen className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl font-black text-[#1f1b5a] text-center mb-1">
          Confirmer l'inscription
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Bonjour <strong>{user?.first_name || "cher apprenant"}</strong>,<br />
          vous allez vous inscrire à :
        </p>

        {/* Nom du cours */}
        {course && (
          <div className="bg-[#2d287f]/5 border border-[#2d287f]/15 rounded-xl p-4 mb-6 text-center">
            <p className="font-bold text-[#1f1b5a] text-base">{course.title}</p>
            <p className="text-emerald-600 text-sm font-semibold mt-1">Accès gratuit</p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="w-full py-3.5 rounded-2xl font-black text-white flex items-center justify-center gap-2 text-base disabled:opacity-70 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
            {enrolling
              ? <><Loader className="w-5 h-5 animate-spin" /> Inscription en cours…</>
              : <><CheckCircle className="w-5 h-5" /> Confirmer l'inscription</>
            }
          </button>

          <Link to={`/courses/${id}`}
            className="block w-full py-3 border border-gray-200 rounded-2xl text-gray-600 text-sm font-semibold text-center hover:bg-gray-50 transition">
            ← Retour au cours
          </Link>
        </div>
      </div>
    </div>
  );
}