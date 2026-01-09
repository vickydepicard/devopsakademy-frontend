import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/enrollments");
        if (res.data.success) setEnrollments(res.data.data);
      } catch (err) {
        console.error("Erreur chargement inscriptions:", err);
      }
    };
    fetchData();
  }, []);

  const approve = async (userId, courseId) => {
    if (!window.confirm("Valider cette inscription ?")) return;
    try {
      await api.patch(`/enrollments/${userId}/${courseId}/approve`);
      setEnrollments((prev) =>
        prev.map((e) =>
          e.user_id === userId && e.course_id === courseId
            ? { ...e, is_approved: 1 }
            : e
        )
      );
    } catch (err) {
      console.error("Erreur validation:", err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">
        📋 Inscriptions en attente
      </h1>

      {enrollments.length === 0 ? (
        <p className="text-gray-500">Aucune inscription en attente.</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-blue-50 text-left">
              <th className="p-3 border">Étudiant</th>
              <th className="p-3 border">Cours</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Statut</th>
              <th className="p-3 border"></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={`${e.user_id}-${e.course_id}`}>
                <td className="border p-3">{e.user_name}</td>
                <td className="border p-3">{e.course_title}</td>
                <td className="border p-3">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                <td className="border p-3">
                  {e.is_approved ? (
                    <span className="text-green-600 font-semibold">Validé</span>
                  ) : (
                    <span className="text-yellow-600">En attente</span>
                  )}
                </td>
                <td className="border p-3 text-right">
                  {!e.is_approved && (
                    <button
                      onClick={() => approve(e.user_id, e.course_id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Valider
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
