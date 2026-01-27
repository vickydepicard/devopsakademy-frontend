import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function Profile() {
  const { token, user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!res.ok) {
          // ⚠️ NE JAMAIS parser si erreur
          if (res.status === 401) {
            logout();
            return;
          }
          throw new Error("Erreur chargement profil");
        }

        const data = await res.json();

        if (!data?.success) {
          throw new Error("Profil invalide");
        }

        setProfile(data.data);
      } catch (err) {
        console.error("❌ Erreur profile:", err.message);
        setError("Impossible de charger votre profil");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
    else setLoading(false);
  }, [token, logout]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Chargement du profil...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error}
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="text-center mt-10 text-gray-400">
        Profil indisponible
      </p>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👤 Mon profil</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p><strong>Nom :</strong> {profile.first_name} {profile.last_name}</p>
        <p><strong>Email :</strong> {profile.email}</p>
        <p><strong>Rôle :</strong> {profile.role}</p>
      </div>
    </div>
  );
}
