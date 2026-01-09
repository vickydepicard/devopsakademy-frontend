import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentCourseView() {
  const { id } = useParams();
  const { token } = useAuth();
  const [course, setCourse] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    api
      .get(`/enrollments/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourse(res.data))
      .catch((err) => console.error("Erreur chargement cours :", err));
  }, [id, token]);

  const handleUpload = async () => {
    if (!file) return alert("Veuillez sélectionner une preuve de paiement.");

    const formData = new FormData();
    formData.append("payment_proof", file);

    try {
      setUploading(true);
      await api.post(`/enrollments/${id}/upload-proof`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Preuve envoyée avec succès !");
    } catch (err) {
      alert("Erreur lors de l’envoi.");
    } finally {
      setUploading(false);
    }
  };

  if (!course) return <p>Chargement...</p>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">{course.title}</h1>

      {!course.is_approved ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
          <p className="text-yellow-800 text-sm">
            ⚠️ Votre accès complet est en attente de validation du paiement.
          </p>

          <div className="mt-3">
            <label className="block text-sm text-gray-600 mb-2">
              📤 Téléverser la preuve de paiement :
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full border rounded-md p-2 mb-3 text-sm"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {uploading ? "Envoi en cours..." : "Envoyer la preuve"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-green-600 font-semibold mb-4">
          ✅ Paiement validé — vous avez accès à toutes les leçons.
        </p>
      )}

      <h2 className="text-xl font-semibold mb-3">Modules du cours</h2>
      {course.modules?.map((mod) => (
        <div key={mod.id} className="mb-4 border-b pb-3">
          <h3 className="font-medium text-gray-900">{mod.title}</h3>
          <ul className="list-disc pl-5 text-gray-600">
            {mod.lessons.map((lesson) => (
              <li key={lesson.id}>
                {course.is_approved ? (
                  <a href={`/lesson/${lesson.id}`} className="text-blue-600 hover:underline">
                    {lesson.title}
                  </a>
                ) : (
                  <span className="text-gray-400">
                    🔒 {lesson.title} (verrouillé)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
