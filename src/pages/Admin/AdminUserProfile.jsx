import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

export default function AdminUserProfile() {
  const { id } = useParams();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUser(data.data);
      else toast.error("Utilisateur introuvable");
    } catch (err) {
      toast.error("Erreur de chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  if (loading)
    return (
      <div className="p-4 text-center text-gray-500">
        Chargement du profil...
      </div>
    );

  if (!user)
    return (
      <div className="p-4 text-center text-red-600">
        Utilisateur introuvable ❌
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">👤 Profil de {user.first_name} {user.last_name}</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            alt="Avatar"
            className="w-24 h-24 rounded-full mx-auto mb-3 border"
          />
          <h2 className="text-center text-lg font-semibold">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-center text-gray-600">{user.email}</p>
          <p className="text-center mt-1 text-sm">
            Rôle : <span className="font-semibold">{user.role}</span>
          </p>
          <p className="text-center mt-1 text-sm">
            Validé : {user.is_validated ? "✅ Oui" : "❌ Non"}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-lg">📚 Informations générales</h3>
          <p>🕓 Date d’inscription : {new Date(user.created_at).toLocaleDateString()}</p>
          <p>📬 Email : {user.email}</p>
          <p>🧩 ID utilisateur : {user.id}</p>
        </div>
      </div>

      {/* SECTION COURS */}
      <div className="bg-gray-50 p-4 rounded border">
        <h2 className="text-xl font-semibold mb-3">🎓 Cours suivis</h2>
        {user.enrolled_courses?.length ? (
          <ul className="list-disc ml-6">
            {user.enrolled_courses.map((c) => (
              <li key={c.id}>
                {c.title} — {c.completion_percentage}% complété
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aucun cours suivi.</p>
        )}
      </div>

      {user.role === "instructor" && (
        <div className="bg-gray-50 p-4 rounded border">
          <h2 className="text-xl font-semibold mb-3">📘 Cours enseignés</h2>
          {user.taught_courses?.length ? (
            <ul className="list-disc ml-6">
              {user.taught_courses.map((c) => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun cours enseigné.</p>
          )}
        </div>
      )}
    </div>
  );
}
