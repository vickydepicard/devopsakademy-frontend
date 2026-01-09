import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger toutes les inscriptions
  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/admin/enrollments");
      if (res.data.success) setEnrollments(res.data.data);
    } catch (err) {
      console.error("Erreur chargement inscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleApprove = async (userId, courseId) => {
    if (!confirm("Valider cette inscription ?")) return;
    try {
      await api.patch(`/enrollments/${userId}/${courseId}/approve`);
      alert("Inscription validée ✅");
      fetchEnrollments();
    } catch (err) {
      console.error("Erreur validation:", err);
      alert("Erreur validation inscription");
    }
  };

  const handleDelete = async (userId, courseId) => {
    if (!confirm("Supprimer cette inscription ?")) return;
    try {
      await api.delete(`/enrollments/${courseId}/students/${userId}`);
      alert("Inscription supprimée ❌");
      fetchEnrollments();
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur suppression inscription");
    }
  };

  if (loading)
    return <p className="text-center mt-10">Chargement des inscriptions...</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">
        🧾 Gestion des inscriptions
      </h1>

      {enrollments.length === 0 ? (
        <p className="text-gray-500 italic">Aucune inscription enregistrée.</p>
      ) : (
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-blue-50 text-gray-700">
            <tr>
              <th className="p-3 text-left">Étudiant</th>
              <th className="p-3 text-left">Cours</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={`${e.user_id}-${e.course_id}`} className="border-t">
                <td className="p-3">
                  {e.first_name} {e.last_name} <br />
                  <span className="text-xs text-gray-400">{e.email}</span>
                </td>
                <td className="p-3">{e.course_title}</td>
                <td className="p-3 text-center">
                  {e.is_approved ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                      ✅ Validée
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      ⏳ En attente
                    </span>
                  )}
                </td>
                <td className="p-3 text-center space-x-2">
                  {!e.is_approved && (
                    <button
                      onClick={() => handleApprove(e.user_id, e.course_id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Valider
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(e.user_id, e.course_id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
