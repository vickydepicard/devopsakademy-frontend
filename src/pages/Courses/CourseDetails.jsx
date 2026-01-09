// src/pages/CourseDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(res => {
        setCourse(res.data);
        setModules(res.data.modules || []);
      })
      .catch(err => console.error("Erreur chargement cours :", err));
  }, [id]);

  if (!course) return <p>Chargement...</p>;

  const handleEnroll = async () => {
    if (!user) return navigate("/login");
    try {
      const res = await api.post("/enrollments", { courseId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      navigate("/dashboard");
    } catch (err) {
      alert("Erreur d'inscription");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">{course.title}</h1>
      <p className="text-gray-700 mb-4">{course.description}</p>

      <h2 className="text-xl font-semibold mb-2">Aperçu des modules</h2>
      {modules.slice(0, 2).map((mod) => (
        <div key={mod.id} className="border rounded-lg p-3 mb-3">
          <h3 className="font-medium text-gray-900">{mod.title}</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            {mod.lessons.slice(0, 2).map((l) => (
              <li key={l.id}>{l.title}</li>
            ))}
          </ul>
        </div>
      ))}

      <button
        onClick={handleEnroll}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {user ? "S’inscrire à ce cours" : "Se connecter pour s’inscrire"}
      </button>
    </div>
  );
}
