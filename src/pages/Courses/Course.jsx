// src/pages/Courses/CourseDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);

  const hasFullAccess = enrollment?.is_approved === true;
  const isPreview = !hasFullAccess;

  // ======================
  // Charger le cours
  // ======================
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const endpoint = token
          ? `/courses/${id}`
          : `/courses/public/${id}`;

        const res = await api.get(endpoint);
        if (res.data?.success) {
          setCourse(res.data.data);
        }
      } catch (err) {
        console.error("Erreur récupération cours :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, token]);

  // ======================
  // Vérifier inscription
  // ======================
  useEffect(() => {
    if (!token || !user) return;

    api
      .get(`/enrollments/${id}/check`)
      .then((res) => {
        if (res.data?.success) {
          setEnrollment(res.data);
        }
      })
      .catch(() => {});
  }, [id, token, user]);

  // ======================
  // Inscription
  // ======================
  const handleEnroll = async () => {
    if (!user) return navigate("/login");

    try {
      const res = await api.post("/enrollments", { courseId: id });
      if (res.data?.success) {
        setEnrollment({
          enrolled: true,
          is_approved: res.data.is_approved,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // RENDER
  // ======================
  if (loading)
    return <p className="text-center mt-10">Chargement du cours…</p>;

  if (!course)
    return <p className="text-center mt-10">Cours introuvable.</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* ================= HERO ================= */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#3B3A82] mb-3">
          {course.title}
        </h1>

        <p className="text-gray-600 max-w-3xl">
          {course.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="text-sm text-gray-500">
            👨‍🏫 {course.instructor_name || "DevOps Akademy"}
          </span>

          <span className="px-3 py-1 rounded-full bg-yellow-400 text-[#3B3A82] text-sm font-bold">
            {course.is_free ? "Gratuit" : `${course.price} €`}
          </span>
        </div>
      </div>

      {/* ================= CTA ================= */}
      {!hasFullAccess && (
        <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="font-semibold text-indigo-700 mb-3">
            👀 Vous consultez l’aperçu du cours
          </p>

          <button
            onClick={handleEnroll}
            className="px-6 py-3 bg-[#4F46E5] hover:bg-[#3B3A82] text-white font-semibold rounded-lg"
          >
            Voir plus — S’inscrire au cours
          </button>
        </div>
      )}

      {/* ================= MODULES ================= */}
      {course.modules?.length > 0 ? (
        <div className="space-y-6">
          {course.modules.map((module, index) => (
            <div
              key={module.id}
              className="bg-white border rounded-xl shadow-sm p-5"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Module {index + 1} — {module.title}
              </h2>

              <ul className="space-y-3">
                {module.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className={`flex justify-between items-center border rounded-lg p-4 ${
                      isPreview
                        ? "bg-gray-100 cursor-not-allowed"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (hasFullAccess) {
                        navigate(
                          `/courses/${id}/lessons/${lesson.id}`
                        );
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {lesson.duration_minutes} min
                      </p>
                    </div>

                    {isPreview ? (
                      <span className="text-sm text-gray-400">
                        🔒 Aperçu
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 font-semibold">
                        ▶ Accéder
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          Aucun module disponible pour ce cours.
        </p>
      )}
    </div>
  );
}
