// src/pages/Courses/CourseDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";

export default function CourseDetail() {
  const { id } = useParams(); // courseId
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState(0);

  // ====== Charger les infos du cours ======
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Si connecté → accès complet
        const endpoint = token
          ? `/courses/${id}`
          : `/courses/public/${id}`; // aperçu public
        const res = await api.get(endpoint);
        if (res.data.success) {
          setCourse(res.data.data);
        }
      } catch (err) {
        console.error("Erreur récupération cours:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, token]);

  // ====== Vérifier si déjà inscrit ======
  useEffect(() => {
    if (!token || !user) return;
    api
      .get(`/enrollments/${id}/check`)
      .then((res) => {
        if (res.data.success) {
          setEnrollment(res.data);
        }
      })
      .catch((err) => console.error("Erreur vérification inscription:", err));
  }, [id, user, token]);

  // ====== S’inscrire ======
  const handleEnroll = async () => {
    try {
      const res = await api.post("/enrollments", { courseId: id });
      if (res.data.success) {
        alert(res.data.message);
        setEnrollment({
          enrolled: true,
          is_approved: res.data.is_approved,
        });
      }
    } catch (err) {
      console.error("Erreur inscription:", err);
      alert("Erreur lors de l’inscription");
    }
  };

  // ====== Mettre à jour statut d’une leçon ======
  const updateLessonStatus = async (lessonId, status) => {
    try {
      const res = await api.patch(
        `/courses/${id}/lessons/${lessonId}/status`,
        { status }
      );
      if (res.data.success) {
        setProgress(res.data.newProgress);
        setCourse((prev) => ({
          ...prev,
          modules: prev.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId ? { ...l, status } : l
            ),
          })),
        }));
      }
    } catch (err) {
      console.error("Erreur validation leçon:", err);
    }
  };

  // ====== Rendu principal ======
  if (loading) return <p className="text-center mt-10">Chargement du cours...</p>;
  if (!course) return <p className="text-center mt-10">Cours introuvable.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 🧭 En-tête */}
      <h1 className="text-3xl font-bold text-indigo-900 mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">{course.short_description || course.description}</p>

      {/* 🧾 Statut d’inscription */}
      {user?.role === "student" && (
        <div className="mb-6">
          {!enrollment ? (
            <button
              onClick={handleEnroll}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md"
            >
              S’inscrire à ce cours
            </button>
          ) : enrollment && !enrollment.is_approved ? (
            <p className="text-yellow-600 font-semibold">
              ⏳ En attente de validation administrateur
            </p>
          ) : (
            <p className="text-green-600 font-semibold">
              ✅ Inscription validée — accès complet
            </p>
          )}
        </div>
      )}

      {/* 🔒 Contenu visible uniquement si approuvé */}
      {enrollment?.is_approved || !user ? (
        <>
          {/* Modules + Leçons */}
          {course.modules?.length > 0 ? (
            <div className="space-y-4">
              {course.modules.map((module, idx) => (
                <div key={module.id} className="bg-white shadow rounded-lg p-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">
                    Module {idx + 1}: {module.title}
                  </h2>
                  <ul className="space-y-2">
                    {module.lessons?.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex justify-between items-center border p-3 rounded-lg"
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            navigate(`/courses/${id}/lessons/${lesson.id}`)
                          }
                        >
                          <p className="font-medium text-gray-800">{lesson.title}</p>
                          <p className="text-xs text-gray-500">
                            {lesson.duration_minutes} min
                          </p>
                        </div>
                        {user?.role === "student" && (
                          <div className="flex gap-2">
                            {lesson.status !== "completed" && (
                              <button
                                onClick={() => updateLessonStatus(lesson.id, "completed")}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                              >
                                Terminer
                              </button>
                            )}
                            {lesson.status === "completed" && (
                              <span className="text-green-600 font-semibold text-sm">
                                ✅ Terminé
                              </span>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucun module disponible.</p>
          )}
        </>
      ) : (
        <div className="p-4 bg-gray-50 border rounded-lg text-gray-600 text-sm">
          🔒 Le contenu complet du cours sera disponible après validation de votre inscription par un administrateur.
        </div>
      )}
    </div>
  );
}
