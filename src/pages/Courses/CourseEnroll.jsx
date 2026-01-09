import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

export default function CourseEnroll() {
  const { id } = useParams(); // id du cours
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEnroll = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/enrollments",
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage(res.data.message);
      } else {
        setMessage("Une erreur est survenue.");
      }
    } catch (err) {
      console.error("❌ Erreur inscription :", err);
      setMessage("Impossible de s’inscrire pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20 bg-white p-6 rounded-xl shadow-md text-center">
      <h1 className="text-2xl font-bold text-indigo-800 mb-4">
        Demande d’inscription au cours
      </h1>
      <p className="text-gray-600 mb-4">
        {user
          ? `Bonjour ${user.first_name || "cher étudiant"}, confirmez votre demande pour suivre ce cours.`
          : "Vous devez être connecté pour vous inscrire."}
      </p>

      {!message ? (
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          {loading ? "Inscription en cours..." : "Demander l'inscription"}
        </button>
      ) : (
        <p className="text-green-700 font-semibold">{message}</p>
      )}

      <button
        onClick={() => navigate(-1)}
        className="block mt-4 text-sm text-gray-500 hover:underline"
      >
        ⬅️ Retour
      </button>
    </div>
  );
}
