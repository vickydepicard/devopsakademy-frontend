import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const navigate = useNavigate();

  // 🔹 Charger les cours de l’étudiant
  useEffect(() => {
    if (!token) return;
    const fetchCourses = async () => {
      try {
        const res = await api.get("/enrollments/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data?.data || []);
      } catch (err) {
        console.error("Erreur chargement cours :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  // 🔹 Upload preuve de paiement
  const handleUploadProof = async (courseId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("payment_proof", file);

    try {
      setUploadingId(courseId);
      const res = await api.post(`/enrollments/${courseId}/upload-proof`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message || "✅ Preuve de paiement envoyée avec succès");

      // Recharger les cours
      const refreshed = await api.get("/enrollments/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(refreshed.data?.data || []);
    } catch (err) {
      console.error("Erreur upload preuve:", err);
      alert("❌ Erreur lors de l’envoi de la preuve de paiement.");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement de vos cours...</p>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center">
        🎓 Mes formations
      </h1>

      {courses.length === 0 ? (
        <p className="text-gray-500 text-center">
          Vous n’êtes inscrit à aucun cours pour le moment.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col"
            >
              <img
                src={course.thumbnail_url || "/default-course.jpg"}
                alt={course.title}
                className="w-full h-40 object-cover"
              />

              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Niveau : {course.level}</p>
                </div>

                {/* ✅ Statut de l'inscription/paiement */}
                <div className="mt-3">
                  {course.is_approved ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      ✅ Cours validé — accès complet
                    </span>
                  ) : course.payment_status === "verified" ? (
                    <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">
                      🔍 Paiement vérifié — en attente d’accès
                    </span>
                  ) : course.payment_status === "pending" ? (
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                      ⏳ Paiement en cours de validation
                    </span>
                  ) : course.payment_status === "rejected" ? (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                      ❌ Paiement rejeté — veuillez réessayer
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                      🕓 En attente de paiement
                    </span>
                  )}
                </div>

                {/* 📤 Upload ou achat selon l’état */}
                <div className="mt-5 space-y-3">
                  {course.is_approved ? (
                    <button
                      onClick={() => navigate(`/student/course/${course.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      🚀 Accéder au cours
                    </button>
                  ) : course.payment_status === "pending" ? (
                    <p className="text-xs text-center text-gray-500 italic">
                      Votre paiement est en cours de vérification...
                    </p>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition"
                      >
                        👁️ Voir les détails du cours
                      </button>

                      <button
                        onClick={() => navigate(`/purchase/${course.id}`)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                      >
                        💳 Acheter ce cours
                      </button>

                      {/* Option de re-upload si rejeté */}
                      {(course.payment_status === "rejected" ||
                        !course.payment_status ||
                        course.payment_status === "none") && (
                        <div>
                          <label className="text-sm text-gray-700 font-medium block mb-1">
                            📤 Uploader la preuve de paiement :
                          </label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleUploadProof(course.id, e)}
                            disabled={uploadingId === course.id}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100 cursor-pointer"
                          />
                          {uploadingId === course.id && (
                            <p className="text-xs text-gray-500 mt-2 animate-pulse">
                              ⏳ Envoi en cours...
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
