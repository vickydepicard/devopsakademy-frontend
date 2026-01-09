import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

export default function CoursePreview() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/courses/${id}/public`)
      .then((res) => setCourse(res.data.data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!course) return <p className="text-center mt-10">Cours introuvable</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={course.thumbnail_url || "/default-course.jpg"}
          alt={course.title}
          className="w-full md:w-1/3 rounded-xl shadow"
        />
        <div>
          <h1 className="text-3xl font-bold text-indigo-900">{course.title}</h1>
          <p className="mt-2 text-gray-600">{course.short_description}</p>
          <p className="mt-3 text-sm text-gray-500 italic">
            Niveau : {course.level} | Langue : {course.language}
          </p>
          <p className="mt-3 font-semibold text-blue-700">
            {course.price ? `${course.price} €` : "Gratuit"}
          </p>

          <button
            onClick={() =>
              user ? navigate(`/courses/${id}/enroll`) : navigate("/login")
            }
            className="mt-6 px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
          >
            {user ? "S’inscrire à ce cours" : "Se connecter pour s’inscrire"}
          </button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Aperçu du contenu
        </h2>
        {course.modules?.map((m) => (
          <div key={m.id} className="mb-4">
            <h3 className="font-semibold text-gray-900">📘 {m.title}</h3>
            <ul className="ml-4 text-gray-700 text-sm">
              {m.lessons?.map((l) => (
                <li key={l.id}>▶️ {l.title} ({l.duration_minutes} min)</li>
              ))}
            </ul>
          </div>
        ))}
        <p className="mt-4 text-gray-500 italic">
          Connectez-vous pour voir le contenu complet du cours.
        </p>
      </div>
    </div>
  );
}
