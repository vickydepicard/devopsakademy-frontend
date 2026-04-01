import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

export default function CourseDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Charger les infos du cours
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setCourse(res.data.data);
      } catch (err) {
        console.error("Erreur récupération cours:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, token]);

  // Gérer l’upload de la preuve de paiement
  const handlePaymentProof = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("payment_proof", file);

    try {
      setUploading(true);
      const res = await api.post(`/enrollments/${id}/upload-proof`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert(res.data.message);
    } catch (err) {
      console.error("Erreur upload paiement:", err);
      alert("Erreur lors de l’envoi de la preuve de paiement.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!course) return <p className="text-center text-red-500">Cours introuvable.</p>;

  const access = course.access || "public";

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* 🧱 Section principale */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image */}
        <div className="md:w-1/3">
          <img
            src={course.thumbnail_url || "/default-course.jpg"}
            alt={course.title}
            className="w-full h-56 object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Détails */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.short_description || course.description}</p>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <span>📚 Niveau : {course.level}</span>
            <span>💰 Prix : {course.is_free ? "Gratuit" : `${course.price} XAF`}</span>
          </div>

          {/* 🎯 Boutons d’action selon le statut */}
          {access === "public" && (
            <div>
              <button
                onClick={() =>
                  token
                    ? navigate(`/purchase/${course.id}`)
                    : navigate("/login", { state: { from: `/purchase/${course.id}` } })
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                💳 Acheter ce cours
              </button>
              <p className="mt-3 text-gray-500 text-sm">
                Connectez-vous pour acheter et accéder à tout le contenu.
              </p>
            </div>
          )}

          {access === "pending" && (
            <div className="mt-4">
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md font-medium inline-block">
                ⏳ Paiement en attente de validation par l’administrateur
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📤 Uploader la preuve de paiement :
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handlePaymentProof}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer"
                />
                {uploading && (
                  <p className="text-xs text-gray-500 mt-2 animate-pulse">
                    ⏳ Envoi en cours...
                  </p>
                )}
              </div>
            </div>
          )}

          {access === "full" && (
            <div className="mt-4">
              <button
                onClick={() => navigate(`/student/course/${course.id}`)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                🚀 Accéder au cours complet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🧩 Contenu aperçu / complet */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">📘 Contenu du cours</h2>

        {access === "public" && (
          <p className="text-gray-500 mb-4">
            Aperçu du contenu — connectez-vous et achetez le cours pour voir tous les modules.
          </p>
        )}

        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((mod) => (
              <div
                key={mod.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <h3 className="font-bold text-gray-800 mb-2">📦 {mod.title}</h3>

                {mod.lessons?.length > 0 ? (
                  <ul className="space-y-1 text-sm text-gray-600">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex justify-between">
                        <span>▶ {lesson.title}</span>
                        <span className="text-gray-400">
                          {lesson.duration_minutes} min
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">Aucune leçon disponible.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Aucun module disponible pour le moment.</p>
        )}
      </div>
    </div>
  );
}
